from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import asyncio
import os
import uuid
import logging
import bcrypt
import jwt
import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from fastapi import BackgroundTasks, FastAPI, APIRouter, Request, Response, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ValidationError, field_validator

from content import (
    CATEGORIES,
    ACTIVITIES_BY_CATEGORY,
    SFA_WORDS,
    get_activity,
)
from admin_bootstrap import bootstrap_admin_user
from contact_delivery import (
    MAX_ATTACHMENT_BYTES,
    MAX_CONTACT_ATTACHMENTS,
    MAX_TOTAL_ATTACHMENT_BYTES,
    ContactAttachmentValidationError,
    ContactDeliveryConfigurationError,
    ContactDeliveryError,
    ContactMessage,
    ContactRateLimiter,
    build_contact_rate_limit_response,
    deliver_contact_message,
    validate_contact_attachments,
)
from password_reset import (
    GENERIC_PASSWORD_RESET_MESSAGE,
    INVALID_PASSWORD_RESET_MESSAGE,
    PasswordResetConfigurationError,
    PasswordResetDeliveryError,
    PasswordResetRateLimiter,
    build_password_reset_rate_limit_response,
    consume_password_reset_token,
    create_password_reset_dispatch,
    deliver_password_reset_email,
    ensure_password_reset_indexes,
    revoke_password_reset_dispatch,
)
from session_objective import (
    build_local_session_objective,
    build_session_document,
    build_session_facts,
    select_session_objective,
)
from voicemail_content_provider import get_voicemail_activity

# ---------- Setup ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

app = FastAPI(title="Concentric API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
contact_rate_limiter = ContactRateLimiter.from_environment(os.environ)
password_reset_rate_limiter = PasswordResetRateLimiter.from_environment(os.environ)


@api_router.post("/contact", status_code=202)
async def submit_contact_message(
    request: Request,
    fullName: str = Form(...),
    contactType: str = Form(...),
    email: str = Form(...),
    subject: str = Form(...),
    message: str = Form(...),
    honeypot: str = Form(""),
    attachments: Optional[List[UploadFile]] = File(None),
):
    try:
        payload = ContactMessage(
            fullName=fullName,
            contactType=contactType,
            email=email,
            subject=subject,
            message=message,
            honeypot=honeypot,
        )
    except ValidationError:
        raise HTTPException(status_code=422, detail="Invalid contact form data.")

    if payload.honeypot:
        return {"status": "accepted"}

    uploaded_attachments = [attachment for attachment in (attachments or []) if attachment.filename]
    attachment_specs = []
    try:
        if len(uploaded_attachments) > MAX_CONTACT_ATTACHMENTS:
            raise HTTPException(status_code=400, detail="You can attach up to 5 files.")
        combined_size = 0
        for attachment in uploaded_attachments:
            attachment_content = await attachment.read(MAX_ATTACHMENT_BYTES + 1)
            if len(attachment_content) > MAX_ATTACHMENT_BYTES:
                raise HTTPException(status_code=413, detail="Attachments must be 10 MB or smaller.")
            combined_size += len(attachment_content)
            if combined_size > MAX_TOTAL_ATTACHMENT_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail="Attachments must be 25 MB or smaller in total.",
                )
            attachment_specs.append(
                (attachment.filename, attachment.content_type or "", attachment_content)
            )
        validated_attachments = validate_contact_attachments(attachment_specs)
    except ContactAttachmentValidationError as error:
        raise HTTPException(status_code=400, detail=str(error))
    finally:
        await asyncio.gather(*(attachment.close() for attachment in (attachments or [])))

    rate_limit_key = request.client.host if request.client else "unknown"
    rate_limit_decision = contact_rate_limiter.acquire(rate_limit_key)
    if not rate_limit_decision.allowed:
        payload, headers = build_contact_rate_limit_response(rate_limit_decision)
        return JSONResponse(status_code=429, content=payload, headers=headers)

    try:
        await asyncio.to_thread(
            deliver_contact_message,
            payload,
            os.environ,
            validated_attachments,
        )
    except ContactDeliveryConfigurationError:
        contact_rate_limiter.release(rate_limit_decision)
        logger.warning("Contact delivery is not configured")
        raise HTTPException(status_code=503, detail="Contact message delivery is not configured.")
    except ContactDeliveryError:
        contact_rate_limiter.release(rate_limit_decision)
        logger.exception("Contact message delivery failed")
        raise HTTPException(status_code=502, detail="Contact message delivery failed.")
    return {"status": "accepted"}


# ---------- Models ----------
class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str = Field(min_length=32, max_length=512)
    newPassword: str = Field(min_length=8, max_length=128)

    @field_validator("newPassword")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Password cannot be blank")
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 bytes or fewer")
        return value


class GoogleSessionIn(BaseModel):
    session_id: str


class TTSIn(BaseModel):
    text: str = Field(min_length=1, max_length=4096)
    voice: str = "nova"


class GenerateScenarioIn(BaseModel):
    scenario_type: str  # "receipt" | "medication" | "form"


class SessionAttemptIn(BaseModel):
    activity_slug: str
    activity_title: str
    category: str
    qid: Optional[str] = None
    correct: bool
    picked: Optional[str] = None
    expected: Optional[str] = None
    ts: str


class SessionCueIn(BaseModel):
    activity_slug: str
    activity_title: str
    category: str
    cue_type: str  # 'show_answer' | 'hint' | 'listen' | 'reveal'
    detail: Optional[str] = None
    ts: str


class SessionActivityIn(BaseModel):
    category: str
    activity_slug: str
    activity_title: str
    started_at: str


class SaveSessionIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    patient_label: Optional[str] = None
    notes: Optional[str] = None
    started_at: str
    ended_at: str
    duration_sec: int = Field(ge=0)
    activities: List[SessionActivityIn] = []
    attempts: List[SessionAttemptIn] = []
    cues: List[SessionCueIn] = []


# ---------- Auth helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, auth_version: int = 0) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "ver": auth_version,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_access_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("session_token", path="/")


def public_user(doc: dict) -> dict:
    return {
        "user_id": doc["user_id"],
        "email": doc["email"],
        "name": doc.get("name", ""),
        "picture": doc.get("picture"),
        "auth_provider": doc.get("auth_provider", "email"),
    }


async def get_current_user(request: Request) -> dict:
    access_token = request.cookies.get("access_token")
    if not access_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            access_token = auth_header[7:]
    if access_token:
        try:
            payload = jwt.decode(access_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            if payload.get("type") == "access":
                user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
                if user and payload.get("ver", 0) == user.get("auth_version", 0):
                    return user
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            pass

    session_token = request.cookies.get("session_token")
    if session_token:
        sess = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if sess:
            expires_at = sess.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at and expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at and expires_at >= datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
                if user:
                    return user

    raise HTTPException(status_code=401, detail="Not authenticated")


# ---------- Auth Endpoints ----------
@api_router.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    doc = {
        "user_id": user_id,
        "email": email,
        "name": payload.name.strip(),
        "password_hash": hash_password(payload.password),
        "auth_provider": "email",
        "auth_version": 0,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email, doc["auth_version"])
    set_access_cookie(response, token)
    return public_user(doc)


@api_router.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["user_id"], email, user.get("auth_version", 0))
    set_access_cookie(response, token)
    return public_user(user)


async def _process_password_reset_request(email: str) -> None:
    dispatch = None
    try:
        dispatch = await create_password_reset_dispatch(
            users=db.users,
            reset_tokens=db.password_reset_tokens,
            email=email,
            environ=os.environ,
        )
        if not dispatch:
            return
        await asyncio.to_thread(deliver_password_reset_email, dispatch, os.environ)
    except PasswordResetConfigurationError:
        if dispatch:
            await revoke_password_reset_dispatch(db.password_reset_tokens, dispatch)
        logger.warning("Password reset email delivery is not configured")
    except PasswordResetDeliveryError:
        if dispatch:
            await revoke_password_reset_dispatch(db.password_reset_tokens, dispatch)
        logger.exception("Password reset email delivery failed")
    except Exception:
        if dispatch:
            await revoke_password_reset_dispatch(db.password_reset_tokens, dispatch)
        logger.exception("Password reset request processing failed")


@api_router.post("/auth/forgot-password", status_code=202)
async def forgot_password(
    payload: ForgotPasswordIn,
    request: Request,
    background_tasks: BackgroundTasks,
):
    client_key = request.client.host if request.client else "unknown"
    rate_limit_decision = password_reset_rate_limiter.check(client_key)
    if not rate_limit_decision.allowed:
        content, headers = build_password_reset_rate_limit_response(rate_limit_decision)
        return JSONResponse(status_code=429, content=content, headers=headers)

    background_tasks.add_task(_process_password_reset_request, str(payload.email))
    return {"message": GENERIC_PASSWORD_RESET_MESSAGE}


@api_router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordIn, response: Response):
    password_was_reset = await consume_password_reset_token(
        reset_tokens=db.password_reset_tokens,
        users=db.users,
        user_sessions=db.user_sessions,
        raw_token=payload.token,
        new_password=payload.newPassword,
        hash_password=hash_password,
    )
    if not password_was_reset:
        raise HTTPException(status_code=400, detail=INVALID_PASSWORD_RESET_MESSAGE)

    clear_auth_cookies(response)
    return {"message": "Your password has been reset successfully."}


@api_router.post("/auth/logout")
async def logout(response: Response, request: Request):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    clear_auth_cookies(response)
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


@api_router.post("/auth/google/session")
async def google_session(payload: GoogleSessionIn, response: Response):
    """Exchange Emergent OAuth session_id for our session/cookie and create user if needed."""
    async with httpx.AsyncClient(timeout=15) as http:
        r = await http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": payload.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google session")
    data = r.json()
    email = data["email"].lower()
    name = data.get("name") or email.split("@")[0]
    picture = data.get("picture")
    session_token = data["session_token"]

    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "auth_provider": "google",
            "auth_version": 0,
            "password_hash": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user)
    else:
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture}},
        )
        user["name"] = name
        user["picture"] = picture

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {
            "$set": {
                "user_id": user["user_id"],
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )
    return public_user(user)


# ---------- Content / Activities ----------
@api_router.get("/categories")
async def list_categories():
    return CATEGORIES


@api_router.get("/activities")
async def all_activities():
    items = []
    for cat_slug, acts in ACTIVITIES_BY_CATEGORY.items():
        for a in acts:
            items.append({**a, "category": cat_slug})
    return items


@api_router.get("/categories/{slug}/activities")
async def list_activities(slug: str):
    if slug not in ACTIVITIES_BY_CATEGORY:
        raise HTTPException(status_code=404, detail="Category not found")
    items = []
    seen = set()
    for cat_slug, activities in ACTIVITIES_BY_CATEGORY.items():
        for activity in activities:
            belongs_to_category = cat_slug == slug or activity.get("primary_category") == slug
            belongs_to_functional = slug == "functional-communication" and activity.get("is_functional")
            if not belongs_to_category and not belongs_to_functional:
                continue
            key = activity.get("slug")
            if key in seen:
                continue
            seen.add(key)
            items.append({**activity, "category": cat_slug})
    return items


@api_router.get("/activities/{category}/{activity_slug}")
async def get_activity_detail(category: str, activity_slug: str):
    activity = get_activity(category, activity_slug)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    if category == "functional-communication" and activity_slug == "voicemails":
        return await get_voicemail_activity(activity, os.environ)
    return activity


@api_router.get("/sfa/words")
async def sfa_words():
    return SFA_WORDS


# ---------- TTS ----------
@api_router.post("/tts")
async def tts(payload: TTSIn, user: dict = Depends(get_current_user)):
    from emergentintegrations.llm.openai import OpenAITextToSpeech
    tts_client = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
    try:
        audio_b64 = await tts_client.generate_speech_base64(
            text=payload.text,
            model="tts-1",
            voice=payload.voice or "nova",
        )
    except Exception as e:
        logger.exception("TTS failed")
        raise HTTPException(status_code=500, detail=f"TTS failed: {e}")
    return {"audio_base64": audio_b64, "mime": "audio/mp3"}


# ---------- STT (Whisper) ----------
@api_router.post("/transcribe")
async def transcribe(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    from emergentintegrations.llm.openai import OpenAISpeechToText
    raw = await file.read()
    if len(raw) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio too large (>25MB)")

    import io
    buf = io.BytesIO(raw)
    buf.name = file.filename or "audio.webm"

    stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
    try:
        resp = await stt.transcribe(file=buf, model="whisper-1", response_format="json", language="en")
    except Exception as e:
        logger.exception("Transcription failed")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")

    text = getattr(resp, "text", None) or (resp.get("text") if isinstance(resp, dict) else str(resp))
    return {"text": text}


# ---------- AI Scenario Generation ----------
@api_router.post("/generate-scenario")
async def generate_scenario(payload: GenerateScenarioIn, user: dict = Depends(get_current_user)):
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    prompts = {
        "receipt": (
            "Generate a realistic short grocery receipt with 4-6 items, prices, subtotal, tax, and total. "
            "Use plain-text format with simple alignment. Keep wording clear and easy to read for someone with aphasia. "
            "Return only the receipt text, no commentary."
        ),
        "medication": (
            "Generate a short, simple medication package label. Include drug name, dosage, frequency, "
            "warnings (1-2 lines), and storage. Use clear short sentences for an adult with aphasia. Return only the label."
        ),
        "form": (
            "Generate a simple sample patient intake form with about 6 short labelled fields filled in "
            "(e.g., Name, Date of Birth, Address, Phone, Allergies, Medications). Use clear labels. Return only the form text."
        ),
    }
    if payload.scenario_type not in prompts:
        raise HTTPException(status_code=400, detail="Invalid scenario_type")

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"concentric-{user['user_id']}-{uuid.uuid4().hex[:6]}",
        system_message="You generate short clear practice texts for aphasia therapy reading exercises.",
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    try:
        text = await chat.send_message(UserMessage(text=prompts[payload.scenario_type]))
    except Exception as e:
        logger.exception("Scenario generation failed")
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}")
    return {"text": text}


# ---------- Clinician Sessions ----------
def _summarize_session(payload: SaveSessionIn) -> dict:
    """Aggregate per-activity stats for a saved session."""
    by_act: dict = {}
    for a in payload.activities:
        key = f"{a.category}/{a.activity_slug}"
        by_act.setdefault(
            key,
            {
                "category": a.category,
                "activity_slug": a.activity_slug,
                "activity_title": a.activity_title,
                "started_at": a.started_at,
                "attempts_total": 0,
                "attempts_correct": 0,
                "attempts_incorrect": 0,
                "cues_used": 0,
                "cue_types": {},
            },
        )
    for at in payload.attempts:
        key = f"{at.category}/{at.activity_slug}"
        b = by_act.setdefault(
            key,
            {
                "category": at.category,
                "activity_slug": at.activity_slug,
                "activity_title": at.activity_title,
                "started_at": at.ts,
                "attempts_total": 0,
                "attempts_correct": 0,
                "attempts_incorrect": 0,
                "cues_used": 0,
                "cue_types": {},
            },
        )
        b["attempts_total"] += 1
        if at.correct:
            b["attempts_correct"] += 1
        else:
            b["attempts_incorrect"] += 1
    for c in payload.cues:
        key = f"{c.category}/{c.activity_slug}"
        b = by_act.setdefault(
            key,
            {
                "category": c.category,
                "activity_slug": c.activity_slug,
                "activity_title": c.activity_title,
                "started_at": c.ts,
                "attempts_total": 0,
                "attempts_correct": 0,
                "attempts_incorrect": 0,
                "cues_used": 0,
                "cue_types": {},
            },
        )
        b["cues_used"] += 1
        b["cue_types"][c.cue_type] = b["cue_types"].get(c.cue_type, 0) + 1

    activities = list(by_act.values())
    totals = {
        "attempts_total": sum(a["attempts_total"] for a in activities),
        "attempts_correct": sum(a["attempts_correct"] for a in activities),
        "attempts_incorrect": sum(a["attempts_incorrect"] for a in activities),
        "cues_used": sum(a["cues_used"] for a in activities),
        "activities_count": len(activities),
    }
    accuracy = (
        round(100 * totals["attempts_correct"] / totals["attempts_total"])
        if totals["attempts_total"]
        else None
    )
    totals["accuracy_pct"] = accuracy
    return {"per_activity": activities, "totals": totals}


async def _generate_soap_objective(payload: SaveSessionIn, summary: dict, user: dict) -> str:
    """Use Claude Sonnet 4.5 to write a SOAP-objective-style narrative from session data."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    facts = build_session_facts(payload, summary)

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"concentric-soap-{user['user_id']}-{uuid.uuid4().hex[:6]}",
        system_message=(
            "You are a speech-language pathologist drafting the OBJECTIVE section of a SOAP note "
            "for an adult aphasia therapy session. Use formal but plain clinical language, "
            "third-person, past tense. Stick strictly to the facts provided — do not invent measurements, "
            "diagnoses, or behaviors. Output 2-4 short paragraphs (no headings, no bullets, no markdown). "
            "Mention task domains, accuracy, cueing levels, and tolerance/engagement only if supported by data."
        ),
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    try:
        text = await chat.send_message(
            UserMessage(text=f"Session data:\n{facts}\n\nWrite the Objective section now.")
        )
        return text.strip()
    except Exception as e:
        logger.exception("SOAP generation failed")
        return build_local_session_objective(payload, summary)


@api_router.post("/sessions")
async def save_session(payload: SaveSessionIn, user: dict = Depends(get_current_user)):
    summary = _summarize_session(payload)
    soap = await select_session_objective(
        payload=payload,
        summary=summary,
        user=user,
        external_generator=_generate_soap_objective,
        api_key=EMERGENT_LLM_KEY,
    )
    session_id = f"sess_{uuid.uuid4().hex[:14]}"
    doc = build_session_document(
        payload=payload,
        summary=summary,
        objective=soap,
        user=user,
        session_id=session_id,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    await db.sessions.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/sessions")
async def list_sessions(user: dict = Depends(get_current_user)):
    cursor = db.sessions.find(
        {"user_id": user["user_id"]},
        {
            "_id": 0,
            "session_id": 1,
            "name": 1,
            "patient_label": 1,
            "started_at": 1,
            "ended_at": 1,
            "duration_sec": 1,
            "summary": 1,
            "created_at": 1,
        },
    ).sort("created_at", -1)
    return await cursor.to_list(500)


@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str, user: dict = Depends(get_current_user)):
    doc = await db.sessions.find_one(
        {"session_id": session_id, "user_id": user["user_id"]},
        {"_id": 0},
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")
    return doc


@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, user: dict = Depends(get_current_user)):
    res = await db.sessions.delete_one({"session_id": session_id, "user_id": user["user_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"ok": True}


@api_router.get("/")
async def root():
    return {"app": "Concentric API", "ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await ensure_password_reset_indexes(db.password_reset_tokens)
    await db.sessions.create_index([("user_id", 1), ("created_at", -1)])
    await db.sessions.create_index("session_id", unique=True)

    await bootstrap_admin_user(
        users=db.users,
        hash_password=hash_password,
        environ=os.environ,
        logger=logger,
    )
    logger.info("Startup complete")


@app.on_event("shutdown")
async def shutdown():
    client.close()

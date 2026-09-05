import os
import uuid
from datetime import datetime, timezone


async def bootstrap_admin_user(
    *,
    users,
    hash_password,
    environ=None,
    logger,
    user_id_factory=None,
    now_factory=None,
):
    """Create an explicitly configured administrator without changing existing users."""
    environ = os.environ if environ is None else environ
    admin_email = environ.get("ADMIN_EMAIL", "").strip().lower()
    admin_password = environ.get("ADMIN_PASSWORD", "")
    has_admin_password = bool(admin_password.strip())

    if not admin_email and not has_admin_password:
        logger.info("Administrator bootstrap skipped; configuration is absent")
        return "skipped"
    if not admin_email or not has_admin_password:
        logger.warning(
            "Administrator bootstrap skipped; ADMIN_EMAIL and ADMIN_PASSWORD must both be configured"
        )
        return "skipped"

    existing = await users.find_one({"email": admin_email})
    if existing:
        logger.info("Administrator bootstrap skipped; configured user already exists")
        return "existing"

    user_id_factory = user_id_factory or (lambda: f"user_{uuid.uuid4().hex[:12]}")
    now_factory = now_factory or (lambda: datetime.now(timezone.utc).isoformat())
    await users.insert_one(
        {
            "user_id": user_id_factory(),
            "email": admin_email,
            "name": "artiqal Admin",
            "password_hash": hash_password(admin_password),
            "auth_provider": "email",
            "picture": None,
            "role": "admin",
            "created_at": now_factory(),
        }
    )
    logger.info("Explicitly configured administrator created")
    return "created"

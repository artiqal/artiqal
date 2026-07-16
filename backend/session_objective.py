import os


EXTERNAL_AI_SESSION_NOTES_FLAG = "ENABLE_EXTERNAL_AI_SESSION_NOTES"


def external_ai_session_notes_enabled(environ=None):
    environ = os.environ if environ is None else environ
    return environ.get(EXTERNAL_AI_SESSION_NOTES_FLAG, "").strip().lower() == "true"


def build_session_facts(payload, summary):
    minutes = max(1, round(payload.duration_sec / 60))
    lines = [
        f"Session length: ~{minutes} min ({payload.duration_sec}s).",
        f"Activities completed: {summary['totals']['activities_count']}.",
        f"Total responses: {summary['totals']['attempts_total']} "
        f"({summary['totals']['attempts_correct']} correct, "
        f"{summary['totals']['attempts_incorrect']} incorrect"
        + (
            f", {summary['totals']['accuracy_pct']}% accuracy"
            if summary["totals"]["accuracy_pct"] is not None
            else ""
        )
        + ").",
        f"Cues / hints used: {summary['totals']['cues_used']}.",
    ]
    if payload.patient_label:
        lines.insert(0, f"Patient: {payload.patient_label}.")
    if payload.notes:
        lines.append(f"Clinician notes: {payload.notes}")
    lines.append("Per activity:")
    for activity in summary["per_activity"]:
        cue_breakdown = (
            ", ".join(f"{key}:{value}" for key, value in activity["cue_types"].items())
            or "0"
        )
        lines.append(
            f"- {activity['activity_title']} ({activity['category']}): "
            f"{activity['attempts_correct']}/{activity['attempts_total']} correct, "
            f"cues={activity['cues_used']} [{cue_breakdown}]"
        )
    return "\n".join(lines)


def build_local_session_objective(payload, summary):
    facts = build_session_facts(payload, summary)
    return "Patient participated in a structured aphasia therapy session. " + facts.replace(
        "\n", " "
    )


async def select_session_objective(
    *,
    payload,
    summary,
    user,
    external_generator,
    api_key,
    environ=None,
):
    """Use external generation only when both the opt-in flag and API key are present."""
    if not external_ai_session_notes_enabled(environ) or not (api_key or "").strip():
        return build_local_session_objective(payload, summary)
    return await external_generator(payload, summary, user)


def build_session_document(*, payload, summary, objective, user, session_id, created_at):
    """Build the persisted session record without changing the existing API shape."""
    return {
        "session_id": session_id,
        "user_id": user["user_id"],
        "name": payload.name.strip(),
        "patient_label": payload.patient_label,
        "notes": payload.notes,
        "started_at": payload.started_at,
        "ended_at": payload.ended_at,
        "duration_sec": payload.duration_sec,
        "activities": [activity.model_dump() for activity in payload.activities],
        "attempts": [attempt.model_dump() for attempt in payload.attempts],
        "cues": [cue.model_dump() for cue in payload.cues],
        "summary": summary,
        "soap_objective": objective,
        "created_at": created_at,
    }

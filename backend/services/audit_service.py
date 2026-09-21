from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from typing import Any, Dict, List, Optional

_audit_lock = Lock()
_audit_log: List[Dict[str, Any]] = []


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def record_audit_event(
    action: str,
    actor_name: str = "Unknown",
    actor_role: str = "VIEWER",
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    entry = {
        "timestamp": _utc_now(),
        "action": action,
        "actorName": actor_name,
        "actorRole": actor_role,
        "entityType": entity_type,
        "entityId": entity_id,
        "details": details,
        "metadata": metadata or {},
    }
    with _audit_lock:
        _audit_log.append(entry)
    return entry


def get_audit_log(limit: int = 100) -> List[Dict[str, Any]]:
    with _audit_lock:
        entries = list(reversed(_audit_log))
    return entries[:limit]


def get_audit_log_count() -> int:
    with _audit_lock:
        return len(_audit_log)


def seed_audit_event() -> None:
    if not _audit_log:
        record_audit_event(
            action="SYSTEM_READY",
            actor_name="System",
            actor_role="SYSTEM",
            details="Audit trail initialized",
        )

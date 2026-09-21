import os
import sys
import csv
import io

# Ensure parent and current directory are in sys.path so it works from anywhere
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI, Query, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any

try:
    from backend.ml.predictor import predict_delay, simulate_what_if, get_metrics
    from backend.services.data_service import get_projects, get_project_by_id, get_kpis, get_data_quality_report, get_priority_projects, get_project_locations, _load_projects
    from backend.services.analytics_service import (
        get_state_analytics,
        get_district_analytics,
        get_early_warnings,
        get_interventions
    )
    from backend.services.audit_service import record_audit_event, get_audit_log, get_audit_log_count, seed_audit_event
    from backend.services.provenance_service import get_provenance_report
except ImportError:
    from ml.predictor import predict_delay, simulate_what_if, get_metrics
    from services.data_service import get_projects, get_project_by_id, get_kpis, get_data_quality_report, get_priority_projects, get_project_locations, _load_projects
    from services.analytics_service import (
        get_state_analytics,
        get_district_analytics,
        get_early_warnings,
        get_interventions
    )
    from services.audit_service import record_audit_event, get_audit_log, get_audit_log_count, seed_audit_event
    from services.provenance_service import get_provenance_report

app = FastAPI(
    title="BhoomiRaksha AI - Machine Learning & Delay Intelligence API",
    description="Production backend API serving delay predictions, spatial risk analytics, and statutory governance intelligence for Indian infrastructure corridors.",
    version="1.0.0"
)

seed_audit_event()

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WhatIfRequest(BaseModel):
    project_id: str
    legal_cases: int
    compensation_progress: int
    approval_days: int
    rr_progress: int

class PredictRequest(BaseModel):
    state: str = "Maharashtra"
    land_required_ha: float = 25.0
    sanction_amount: float = 120.0
    num_3a: int = 2
    num_3A: int = 2
    days_3a_to_3A: float = 60.0

class AuditEventRequest(BaseModel):
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    details: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

def _actor_from_headers(
    x_user_name: Optional[str] = Header(default=None, alias="X-User-Name"),
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
) -> Dict[str, str]:
    return {
        "name": x_user_name or "Guest",
        "role": x_user_role or "VIEWER",
    }

@app.get("/")
def root():
    return {
        "message": "BhoomiRaksha AI Backend API is active",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "BhoomiRaksha AI Backend",
        "engine": "FastAPI + Scikit-Learn Random Forest Regressor",
        "dataset": "MoRTH BhoomiRashi 2,540 Projects Cleaned",
        "version": "v1.0.0"
    }

@app.get("/api/kpis")
def kpis():
    return get_kpis()

@app.get("/api/summary")
def summary():
    return {
        "health": {
            "status": "HEALTHY",
            "service": "BhoomiRaksha AI Backend",
            "engine": "FastAPI + Scikit-Learn Random Forest Regressor",
            "dataset": "MoRTH BhoomiRashi 2,540 Projects Cleaned",
            "version": "v1.0.0"
        },
        "kpis": get_kpis(),
        "priority_projects": get_priority_projects(limit=5),
        "warnings": get_early_warnings()[:5],
        "interventions": get_interventions()[:5]
    }

@app.get("/api/map/projects")
def map_projects():
    return get_project_locations()

@app.post("/api/audit/logs")
def write_audit_event(payload: AuditEventRequest, x_user_name: Optional[str] = Header(default=None, alias="X-User-Name"), x_user_role: Optional[str] = Header(default=None, alias="X-User-Role")):
    actor = _actor_from_headers(x_user_name=x_user_name, x_user_role=x_user_role)
    return record_audit_event(
        action=payload.action,
        actor_name=actor["name"],
        actor_role=actor["role"],
        entity_type=payload.entity_type,
        entity_id=payload.entity_id,
        details=payload.details,
        metadata=payload.metadata,
    )

@app.get("/api/audit/logs")
def read_audit_events(limit: int = Query(100, ge=1, le=500)):
    return {"items": get_audit_log(limit=limit), "total": get_audit_log_count()}

@app.get("/api/provenance")
def provenance():
    return get_provenance_report()

@app.get("/api/export/projects.csv")
def export_projects_csv(x_user_name: Optional[str] = Header(default=None, alias="X-User-Name"), x_user_role: Optional[str] = Header(default=None, alias="X-User-Role")):
    actor = _actor_from_headers(x_user_name=x_user_name, x_user_role=x_user_role)
    record_audit_event(
        action="EXPORT_PROJECTS",
        actor_name=actor["name"],
        actor_role=actor["role"],
        details="Downloaded project register CSV",
    )
    projects = _load_projects()
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=[
        "project_id",
        "project_name",
        "project_number",
        "state",
        "district",
        "risk_category",
        "risk_score",
        "predicted_delay_days",
        "predicted_delay_months",
        "land_required_ha",
        "land_acquired_till_now_ha",
        "sanction_amount_cr",
        "latitude",
        "longitude",
        "source_url",
    ])
    writer.writeheader()
    for project in projects:
        writer.writerow({key: project.get(key, "") for key in writer.fieldnames})
    buffer.seek(0)
    headers = {"Content-Disposition": 'attachment; filename="bhoomiraksha_projects.csv"'}
    return StreamingResponse(iter([buffer.getvalue()]), media_type="text/csv", headers=headers)

@app.get("/api/export/audit.csv")
def export_audit_csv(x_user_name: Optional[str] = Header(default=None, alias="X-User-Name"), x_user_role: Optional[str] = Header(default=None, alias="X-User-Role")):
    actor = _actor_from_headers(x_user_name=x_user_name, x_user_role=x_user_role)
    record_audit_event(
        action="EXPORT_AUDIT_LOG",
        actor_name=actor["name"],
        actor_role=actor["role"],
        details="Downloaded audit log CSV",
    )
    items = get_audit_log(limit=500)
    buffer = io.StringIO()
    fieldnames = ["timestamp", "action", "actorName", "actorRole", "entityType", "entityId", "details"]
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    for item in items:
        writer.writerow({key: item.get(key, "") for key in fieldnames})
    buffer.seek(0)
    headers = {"Content-Disposition": 'attachment; filename="bhoomiraksha_audit_log.csv"'}
    return StreamingResponse(iter([buffer.getvalue()]), media_type="text/csv", headers=headers)

@app.get("/api/projects")
def list_projects(
    search: str = Query("", description="Keyword search"),
    state: str = Query("ALL", description="State filter"),
    agency: str = Query("ALL", description="Agency filter"),
    risk: str = Query("ALL", description="Risk category filter"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100)
):
    return get_projects(
        search=search,
        state=state,
        agency=agency,
        risk=risk,
        page=page,
        page_size=page_size
    )

@app.get("/api/projects/{project_id}")
def project_detail(project_id: str):
    p = get_project_by_id(project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return p

@app.post("/api/predict")
def predict_endpoint(req: PredictRequest):
    return predict_delay(req.dict())

@app.post("/api/simulate")
def simulate_endpoint(
    req: WhatIfRequest,
    x_user_name: Optional[str] = Header(default=None, alias="X-User-Name"),
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
):
    p = get_project_by_id(req.project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    actor = _actor_from_headers(x_user_name=x_user_name, x_user_role=x_user_role)
    record_audit_event(
        action="SIMULATE_WHAT_IF",
        actor_name=actor["name"],
        actor_role=actor["role"],
        entity_type="project",
        entity_id=p["project_id"],
        details="Ran what-if simulation",
        metadata={
            "legal_cases": req.legal_cases,
            "compensation_progress": req.compensation_progress,
            "approval_days": req.approval_days,
            "rr_progress": req.rr_progress,
        },
    )
    return simulate_what_if(
        base_features=p,
        legal_cases=req.legal_cases,
        compensation_progress=req.compensation_progress,
        approval_days=req.approval_days,
        rr_progress=req.rr_progress
    )

@app.get("/api/early-warnings")
def early_warnings():
    return get_early_warnings()

@app.get("/api/interventions")
def interventions():
    return get_interventions()

@app.get("/api/analytics/state")
def state_analytics():
    return get_state_analytics()

@app.get("/api/analytics/district")
def district_analytics():
    return get_district_analytics()

@app.get("/api/model/metrics")
def model_metrics():
    return get_metrics()

@app.get("/api/data-quality")
def data_quality():
    return get_data_quality_report()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    target = "main:app" if os.path.exists("main.py") else "backend.main:app"
    uvicorn.run(target, host="0.0.0.0", port=port, reload=False)

import os
import sys

# Ensure parent and current directory are in sys.path so it works from anywhere
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

try:
    from backend.ml.predictor import predict_delay, simulate_what_if, get_metrics
    from backend.services.data_service import get_projects, get_project_by_id, get_kpis, get_data_quality_report
    from backend.services.analytics_service import (
        get_state_analytics,
        get_district_analytics,
        get_early_warnings,
        get_interventions
    )
except ImportError:
    from ml.predictor import predict_delay, simulate_what_if, get_metrics
    from services.data_service import get_projects, get_project_by_id, get_kpis, get_data_quality_report
    from services.analytics_service import (
        get_state_analytics,
        get_district_analytics,
        get_early_warnings,
        get_interventions
    )

app = FastAPI(
    title="BhoomiRaksha AI - Machine Learning & Delay Intelligence API",
    description="Production backend API serving delay predictions, spatial risk analytics, and statutory governance intelligence for Indian infrastructure corridors.",
    version="1.0.0"
)

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
def simulate_endpoint(req: WhatIfRequest):
    p = get_project_by_id(req.project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
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
    target = "main:app" if os.path.exists("main.py") else "backend.main:app"
    uvicorn.run(target, host="0.0.0.0", port=8000, reload=True)

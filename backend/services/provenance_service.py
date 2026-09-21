from __future__ import annotations

import os
from typing import Any, Dict

try:
    from backend.ml.predictor import get_metrics
except ImportError:
    from ml.predictor import get_metrics


def get_provenance_report() -> Dict[str, Any]:
    metrics = get_metrics()
    data_source = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "bhoomirashi_projects_clean.csv"))
    root_source = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "bhoomirashi_projects_clean.csv"))

    return {
        "operationalDataSource": {
            "name": "Cleaned BhoomiRashi project register",
            "primaryPath": data_source,
            "fallbackPath": root_source,
            "usage": "Live project search, detail views, analytics, and map markers",
        },
        "modelTrainingSource": {
            "name": "Historical registry snapshot",
            "usage": "ML training and evaluation in backend/ml/train_model.py",
            "evaluation": "Hold-out split inside the training script; reported scores are from the test fold, not the served records",
        },
        "validationStrategy": {
            "split": "80/20 train-test split",
            "riskControl": "Operational records are used for serving predictions; model quality is measured separately from the hold-out fold",
            "notes": "This avoids reusing the same rows for both serving and reporting accuracy.",
        },
        "modelSummary": {
            "algorithm": metrics.get("algorithm", "RandomForestRegressor + GradientBoostingClassifier"),
            "r2Score": metrics.get("r2_score", metrics.get("r2Score")),
            "rmseDays": metrics.get("rmse", metrics.get("rmseDays")),
            "maeDays": metrics.get("mae", metrics.get("maeDays")),
            "rocAuc": metrics.get("roc_auc", metrics.get("rocAuc")),
            "featureImportances": metrics.get("feature_importances", metrics.get("featureImportances", [])),
        },
        "lastReviewed": "2026-09-21",
    }
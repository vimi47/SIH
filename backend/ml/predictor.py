import os
import joblib
import numpy as np

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'delay_model.joblib'))

_model_bundle = None

def get_model():
    global _model_bundle
    if _model_bundle is None:
        if os.path.exists(MODEL_PATH):
            _model_bundle = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError("Model bundle not found. Run train_model.py first.")
    return _model_bundle

def get_metrics():
    bundle = get_model()
    metrics = dict(bundle.get("metrics", {}))
    if "r2_score" not in metrics:
        metrics["r2_score"] = metrics.get("r2Score")
    if "rmse" not in metrics:
        metrics["rmse"] = metrics.get("rmseDays")
    if "mae" not in metrics:
        metrics["mae"] = metrics.get("maeDays")
    if "roc_auc" not in metrics:
        metrics["roc_auc"] = metrics.get("rocAuc")
    if "feature_importances" not in metrics:
        metrics["feature_importances"] = metrics.get("featureImportances", [])
    return metrics

def predict_delay(features: dict) -> dict:
    bundle = get_model()
    reg = bundle["regressor"]
    clf = bundle["classifier"]
    state_freq = bundle.get("state_freq", {})

    state = features.get("state", "Other")
    state_weight = state_freq.get(state, 0.05)

    land_ha = float(features.get("land_required_ha", 10.0))
    sanction_cr = float(features.get("sanction_amount", 50.0))
    num_3a = int(features.get("num_3a", 1))
    num_3A = int(features.get("num_3A", 1))
    total_notif = int(features.get("total_notifications", num_3a + num_3A))
    days_3a_3A = float(features.get("days_3a_to_3A", 60.0))

    X_vec = np.array([[
        land_ha,
        sanction_cr,
        num_3a,
        num_3A,
        total_notif,
        days_3a_3A,
        state_weight
    ]])

    predicted_days = float(reg.predict(X_vec)[0])
    risk_class_idx = int(clf.predict(X_vec)[0])
    risk_labels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    risk_category = risk_labels[min(risk_class_idx, 3)]

    # Dynamic risk score (0-100)
    risk_score = min(98, max(12, int(predicted_days / 5.0)))

    return {
        "predicted_delay_days": round(max(15.0, predicted_days), 1),
        "predicted_delay_months": round(max(0.5, predicted_days / 30.0), 1),
        "risk_score": risk_score,
        "risk_category": risk_category,
    }

def simulate_what_if(
    base_features: dict,
    legal_cases: int,
    compensation_progress: int,
    approval_days: int,
    rr_progress: int
) -> dict:
    """
    Counter-factual simulation running on top of real ML predictions:
    Adjusts days based on stakeholder and administrative policy interventions.
    """
    baseline = predict_delay(base_features)

    # Policy intervention delta calculation
    legal_impact_days = (legal_cases - int(base_features.get("active_case_count", 2))) * 25.0
    comp_saved_days = (compensation_progress - int(base_features.get("compensation_progress_pct", 50))) * -1.8
    approval_impact_days = (approval_days - int(base_features.get("approval_pending_days", 45))) * 1.2
    rr_saved_days = (rr_progress - int(base_features.get("rr_progress_pct", 50))) * -1.2

    total_delta = legal_impact_days + comp_saved_days + approval_impact_days + rr_saved_days
    simulated_days = max(10.0, baseline["predicted_delay_days"] + total_delta)

    sim_score = min(98, max(10, int(simulated_days / 5.0)))
    if sim_score >= 75:
        sim_cat = "CRITICAL"
    elif sim_score >= 55:
        sim_cat = "HIGH"
    elif sim_score >= 35:
        sim_cat = "MEDIUM"
    else:
        sim_cat = "LOW"

    days_saved = round(baseline["predicted_delay_days"] - simulated_days, 1)

    return {
        "baseline": baseline,
        "simulated": {
            "predicted_delay_days": round(simulated_days, 1),
            "predicted_delay_months": round(simulated_days / 30.0, 1),
            "risk_score": sim_score,
            "risk_category": sim_cat
        },
        "days_saved": days_saved,
        "score_diff": baseline["risk_score"] - sim_score
    }

from typing import List, Dict, Any
from .data_service import _load_projects

def get_state_analytics() -> List[Dict[str, Any]]:
    projects = _load_projects()
    state_map: Dict[str, Dict[str, Any]] = {}

    for p in projects:
        state = p["state"]
        if state not in state_map:
            state_map[state] = {
                "state": state,
                "totalProjects": 0,
                "totalLandHa": 0.0,
                "delays": [],
                "criticalRiskCount": 0,
                "highRiskCount": 0,
                "totalSanctionCr": 0.0,
                "progressList": []
            }
        item = state_map[state]
        item["totalProjects"] += 1
        item["totalLandHa"] += p["land_required_ha"]
        item["delays"].append(p["predicted_delay_days"])
        if p["risk_category"] == "CRITICAL":
            item["criticalRiskCount"] += 1
        elif p["risk_category"] == "HIGH":
            item["highRiskCount"] += 1
        item["totalSanctionCr"] += p["sanction_amount_cr"]
        item["progressList"].append(p["acquisition_progress_pct"])

    result = []
    for state, data in state_map.items():
        avg_delay = round(sum(data["delays"]) / max(len(data["delays"]), 1))
        avg_prog = round(sum(data["progressList"]) / max(len(data["progressList"]), 1))
        result.append({
            "state": state,
            "totalProjects": data["totalProjects"],
            "totalLandHa": round(data["totalLandHa"], 1),
            "avgDelayDays": avg_delay,
            "criticalRiskCount": data["criticalRiskCount"],
            "highRiskCount": data["highRiskCount"],
            "totalSanctionCr": round(data["totalSanctionCr"], 1),
            "avgProgressPct": avg_prog
        })

    result.sort(key=lambda x: x["criticalRiskCount"], reverse=True)
    return result

def get_district_analytics() -> List[Dict[str, Any]]:
    projects = _load_projects()
    dist_map: Dict[str, Dict[str, Any]] = {}

    for p in projects:
        key = f"{p['district']} ({p['state']})"
        if key not in dist_map:
            dist_map[key] = {
                "district": p["district"],
                "state": p["state"],
                "count": 0,
                "delays": [],
                "riskScores": [],
                "disputed": 0,
                "bottlenecks": {}
            }
        item = dist_map[key]
        item["count"] += 1
        item["delays"].append(p["predicted_delay_days"])
        item["riskScores"].append(p["risk_score"])
        item["disputed"] += p.get("disputed_land_parcels", 0)
        bot = p.get("administrative_bottleneck", "Clearance Review")
        item["bottlenecks"][bot] = item["bottlenecks"].get(bot, 0) + 1

    result = []
    for key, d in dist_map.items():
        top_bot = max(d["bottlenecks"].items(), key=lambda x: x[1])[0] if d["bottlenecks"] else "General Review"
        result.append({
            "district": d["district"],
            "state": d["state"],
            "projectsCount": d["count"],
            "avgDelayDays": round(sum(d["delays"]) / max(len(d["delays"]), 1)),
            "topBottleneck": top_bot,
            "avgRiskScore": round(sum(d["riskScores"]) / max(len(d["riskScores"]), 1)),
            "totalDisputedParcels": d["disputed"]
        })

    result.sort(key=lambda x: x["avgRiskScore"], reverse=True)
    return result

def get_early_warnings() -> List[Dict[str, Any]]:
    projects = _load_projects()
    warnings = []
    stakeholders = [
        "S. Sharma (State Coordinator - MoRTH)",
        "P. Naidu (District Competent Authority - CALA)",
        "A. Deshmukh (Project Director - NHAI)",
        "R. Rawat (Special Land Acquisition Officer)",
        "K. Reddy (Tribunal Standing Counsel)"
    ]

    for idx, p in enumerate(projects):
        if len(warnings) >= 60:
            break
        if p["risk_category"] not in ["CRITICAL", "HIGH"]:
            continue

        if p["days_3a_to_3D"] >= 365:
            warnings.append({
                "id": f"EW-{p['raw_id']}-CRIT",
                "projectId": p["project_id"],
                "projectName": p["project_name"],
                "state": p["state"],
                "district": p["district"],
                "trigger": f"Statutory notification active for {p['days_3a_to_3D']} days without complete Section 3D award declaration",
                "action": "Convene Special Taskforce meeting with Competent Authority (CALA) and State Revenue Secretary.",
                "severity": "CRITICAL",
                "date": "2026-09-16",
                "responsibleStakeholder": stakeholders[idx % len(stakeholders)],
                "status": "ACTIVE"
            })
        elif p["days_3a_to_3D"] >= 200:
            warnings.append({
                "id": f"EW-{p['raw_id']}-HIGH",
                "projectId": p["project_id"],
                "projectName": p["project_name"],
                "state": p["state"],
                "district": p["district"],
                "trigger": f"Notification delay exceeding 180 days benchmark (Actual: {p['days_3a_to_3D']}d). Estimated {p['disputed_land_parcels']} parcels contested.",
                "action": "Initiate structured direct purchase negotiation or out-of-court dispute reconciliation.",
                "severity": "HIGH",
                "date": "2026-09-16",
                "responsibleStakeholder": stakeholders[(idx + 1) % len(stakeholders)],
                "status": "ACTIVE"
            })

    return warnings

def get_interventions() -> List[Dict[str, Any]]:
    projects = _load_projects()
    interventions = []
    stakeholders = [
        "Project Director (NHAI)",
        "Special Land Acquisition Officer (CALA)",
        "District Collector / DM",
        "High Court Standing Counsel",
        "Chief Engineer (Highway Projects)"
    ]

    for idx, p in enumerate(projects):
        if len(interventions) >= 40:
            break
        if p["risk_category"] not in ["CRITICAL", "HIGH"]:
            continue

        interventions.append({
            "id": f"INT-{p['raw_id']}-1",
            "projectId": p["project_id"],
            "projectName": p["project_name"],
            "problem": f"Section 3D statutory delay ({p['days_3a_to_3D']} days) on {p['land_required_ha']} Ha corridor",
            "recommendedAction": "Establish Dedicated Land Acquisition Fast-Track Camp at Sub-Divisional Magistrate office.",
            "priority": "HIGH" if p["risk_category"] == "CRITICAL" else "MEDIUM",
            "responsibleStakeholder": stakeholders[idx % len(stakeholders)],
            "expectedImpact": f"Expected reduction of 60-90 days in award finalization",
            "deadline": "2026-10-15",
            "status": "IN_PROGRESS" if idx % 3 == 0 else "PENDING"
        })

    return interventions

import os
import re
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error, roc_auc_score, confusion_matrix

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../data/bhoomirashi_projects_clean.csv'))
MODEL_OUTPUT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'delay_model.joblib'))

STATE_PATTERNS = [
    ("Jammu and Kashmir", re.compile(r"Jammu|Kashmir|J&K|JK|Ladakh|Srinagar|Akhnoor|Poonch", re.I)),
    ("Maharashtra", re.compile(r"Maharashtra|MH|Mumbai|Pune|Nagpur|Nashik|Thane|Palghar|Solapur|Kolhapur", re.I)),
    ("Uttar Pradesh", re.compile(r"Uttar Pradesh|UP|Varanasi|Lucknow|Kanpur|Agra|Meerut|Prayagraj|Gorakhpur|Ayodhya", re.I)),
    ("Gujarat", re.compile(r"Gujarat|GJ|Ahmedabad|Surat|Vadodara|Rajkot|Kutch|Bhavnagar", re.I)),
    ("Tamil Nadu", re.compile(r"Tamil Nadu|Tamilnadu|TN|Chennai|Salem|Madurai|Coimbatore|Tiruchirappalli", re.I)),
    ("Karnataka", re.compile(r"Karnataka|KA|Bengaluru|Bangalore|Mysuru|Hubli|Belagavi|Mangaluru", re.I)),
    ("Rajasthan", re.compile(r"Rajasthan|RJ|Jaipur|Jodhpur|Udaipur|Kota|Alwar|Bikaner|Ajmer", re.I)),
    ("Punjab", re.compile(r"Punjab|PB|Ludhiana|Amritsar|Jalandhar|Patiala|Bathinda|Mohali", re.I)),
    ("Haryana", re.compile(r"Haryana|HR|Gurugram|Faridabad|Rohtak|Hisar|Karnal|Panipat", re.I)),
    ("Bihar", re.compile(r"Bihar|BR|Patna|Gaya|Muzaffarpur|Bhagalpur|Darbhanga|Purnia", re.I)),
    ("Madhya Pradesh", re.compile(r"Madhya Pradesh|MP|Bhopal|Indore|Jabalpur|Gwalior|Ujjain", re.I)),
    ("West Bengal", re.compile(r"West Bengal|WB|Kolkata|Howrah|Darjeeling|Siliguri|Asansol", re.I)),
    ("Andhra Pradesh", re.compile(r"Andhra Pradesh|Andhra|AP|Visakhapatnam|Vijayawada|Guntur", re.I)),
    ("Telangana", re.compile(r"Telangana|TG|TS|Hyderabad|Warangal", re.I)),
    ("Kerala", re.compile(r"Kerala|KL|Kochi|Cochin|Thiruvananthapuram|Kozhikode", re.I)),
    ("Odisha", re.compile(r"Odisha|Orissa|OD|Bhubaneswar|Cuttack|Rourkela|Puri", re.I)),
    ("Assam", re.compile(r"Assam|AS|Guwahati|Dibrugarh|Silchar", re.I)),
    ("Uttarakhand", re.compile(r"Uttarakhand|UK|UA|Dehradun|Haridwar|Rishikesh", re.I)),
]

def extract_state(text):
    for name, pattern in STATE_PATTERNS:
        if pattern.search(text):
            return name
    return "Other"

def train_and_save_model():
    print(f"[ML Engine] Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    print(f"[ML Engine] Raw dataset shape: {df.shape}")

    # Parse and extract features
    df['text_corpus'] = df['project_name'].fillna('') + ' ' + df['sanction_number'].fillna('') + ' ' + df['project_number'].fillna('')
    df['state'] = df['text_corpus'].apply(extract_state)

    # Clean numeric columns
    df['land_required_ha'] = pd.to_numeric(df['land_required_ha'], errors='coerce').fillna(10.0)
    df['sanction_amount'] = pd.to_numeric(df['sanction_amount'], errors='coerce').fillna(50000000.0) / 10000000.0 # Cr
    df['num_3a'] = pd.to_numeric(df['num_3a'], errors='coerce').fillna(1)
    df['num_3A'] = pd.to_numeric(df['num_3A'], errors='coerce').fillna(1)
    df['num_3D'] = pd.to_numeric(df['num_3D'], errors='coerce').fillna(0)
    df['total_notifications'] = pd.to_numeric(df['total_notifications'], errors='coerce').fillna(2)
    
    # Target: days_3a_to_3D
    df['days_3a_to_3A'] = pd.to_numeric(df['days_3a_to_3A'], errors='coerce').fillna(60.0)
    df['days_3a_to_3D'] = pd.to_numeric(df['days_3a_to_3D'], errors='coerce')
    
    # Filter rows that have positive recorded days or impute based on notification spans
    valid_mask = df['days_3a_to_3D'].notna() & (df['days_3a_to_3D'] > 0)
    df.loc[~valid_mask, 'days_3a_to_3D'] = df.loc[~valid_mask, 'days_3a_to_3A'] + 120.0
    
    # Risk Categories: LOW (<90d), MEDIUM (90-180d), HIGH (180-365d), CRITICAL (>365d)
    def categorize_risk(days):
        if days >= 365:
            return 3 # CRITICAL
        elif days >= 180:
            return 2 # HIGH
        elif days >= 90:
            return 1 # MEDIUM
        else:
            return 0 # LOW

    df['risk_class'] = df['days_3a_to_3D'].apply(categorize_risk)
    df['is_critical_delay'] = (df['days_3a_to_3D'] >= 180).astype(int)

    # State frequency encoding
    state_freq = df['state'].value_counts(normalize=True).to_dict()
    df['state_weight'] = df['state'].map(state_freq).fillna(0.05)

    feature_cols = [
        'land_required_ha',
        'sanction_amount',
        'num_3a',
        'num_3A',
        'total_notifications',
        'days_3a_to_3A',
        'state_weight'
    ]

    X = df[feature_cols]
    y_reg = df['days_3a_to_3D']
    y_clf = df['risk_class']
    y_binary = df['is_critical_delay']

    # Train / Test Split
    X_train, X_test, y_train, y_test, y_train_clf, y_test_clf, y_train_bin, y_test_bin = train_test_split(
        X, y_reg, y_clf, y_binary, test_size=0.2, random_state=42
    )

    print("[ML Engine] Training Random Forest Regressor for Delay Days...")
    regressor = RandomForestRegressor(n_estimators=120, max_depth=12, random_state=42)
    regressor.fit(X_train, y_train)

    print("[ML Engine] Training Gradient Boosting Classifier for Risk Severity...")
    classifier = GradientBoostingClassifier(n_estimators=100, max_depth=5, random_state=42)
    classifier.fit(X_train, y_train_clf)

    # Evaluation
    preds_reg = regressor.predict(X_test)
    preds_clf = classifier.predict(X_test)
    preds_bin_prob = classifier.predict_proba(X_test)[:, 2:].sum(axis=1) # High + Critical prob

    r2 = round(float(r2_score(y_test, preds_reg)), 3)
    rmse = round(float(np.sqrt(mean_squared_error(y_test, preds_reg))), 1)
    mae = round(float(mean_absolute_error(y_test, preds_reg)), 1)
    roc_auc = round(float(roc_auc_score(y_test_bin, preds_bin_prob)), 3)
    conf_mat = confusion_matrix(y_test_clf, preds_clf).tolist()

    # Feature Importance
    importances = regressor.feature_importances_
    feature_importance_list = [
        {"feature": name, "importancePct": round(float(imp * 100), 1)}
        for name, imp in zip(feature_cols, importances)
    ]
    feature_importance_list.sort(key=lambda x: x["importancePct"], reverse=True)

    print("\n================ ML EVALUATION METRICS ================")
    print(f"R² Score: {r2}")
    print(f"RMSE: {rmse} days")
    print(f"MAE: {mae} days")
    print(f"ROC-AUC: {roc_auc}")
    print("Feature Importances:", feature_importance_list)
    print("Confusion Matrix:", conf_mat)
    print("=======================================================\n")

    model_bundle = {
        "regressor": regressor,
        "classifier": classifier,
        "feature_cols": feature_cols,
        "state_freq": state_freq,
        "metrics": {
            "algorithm": "RandomForestRegressor + GradientBoostingClassifier Ensemble",
            "version": "v1.0.0-bhoomirashi",
            "r2Score": r2,
            "rmseDays": rmse,
            "maeDays": mae,
            "rocAuc": roc_auc,
            "trainSamples": len(X_train),
            "testSamples": len(X_test),
            "featureImportances": feature_importance_list,
            "confusionMatrix": {
                "labels": ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
                "matrix": conf_mat
            }
        }
    }

    os.makedirs(os.path.dirname(MODEL_OUTPUT_PATH), exist_ok=True)
    joblib.dump(model_bundle, MODEL_OUTPUT_PATH)
    print(f"[ML Engine] Saved trained model bundle to: {MODEL_OUTPUT_PATH}")

if __name__ == "__main__":
    train_and_save_model()

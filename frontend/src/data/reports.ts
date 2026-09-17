export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export const AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "LOG-2026-0916-01",
    timestamp: "2026-09-16 14:22:10",
    user: "Rajesh Kumar (CENTRAL_ADMIN)",
    action: "MODEL_PREDICTION_RUN",
    target: "BRA-2024-001 (Mumbai-Ahmedabad HSR)",
    details: "Executed what-if simulation on legal disputes variance (-20%)",
    status: "SUCCESS"
  },
  {
    id: "LOG-2026-0916-02",
    timestamp: "2026-09-16 13:45:00",
    user: "S. Sharma (State Admin - MH)",
    action: "INTERVENTION_CREATED",
    target: "BRA-2024-001",
    details: "Assigned Special Land Acquisition Officer for out-of-court settlement",
    status: "SUCCESS"
  },
  {
    id: "LOG-2026-0916-03",
    timestamp: "2026-09-16 11:30:15",
    user: "System (BhoomiRashi Sync Worker)",
    action: "BATCH_DATA_SYNC",
    target: "National Ingestion Pipeline",
    details: "Synchronized 2,540 project records from BhoomiRashi API endpoint",
    status: "SUCCESS"
  },
  {
    id: "LOG-2026-0916-04",
    timestamp: "2026-09-16 10:15:40",
    user: "P. Naidu (District Admin)",
    action: "DOCUMENT_UPLOAD",
    target: "BRA-2024-003 (Salem-Kochi NH)",
    details: "Uploaded Section 3D gazette notification verification certificate",
    status: "SUCCESS"
  },
  {
    id: "LOG-2026-0916-05",
    timestamp: "2026-09-16 09:05:22",
    user: "System (Early Warning Engine)",
    action: "THRESHOLD_BREACH_ALERT",
    target: "Palghar District Corridors",
    details: "Triggered CRITICAL alert: 28 disputed parcels exceeded 180 days litigation limit",
    status: "WARNING"
  }
];

export interface ModelEvaluationMetrics {
  algorithm: string;
  version: string;
  lastTrained: string;
  trainSamples: number;
  testSamples: number;
  rmseDays: number;
  maeDays: number;
  r2Score: number;
  rocAuc: number;
  featureImportances: { feature: string; importancePct: number }[];
  confusionMatrix: {
    labels: string[];
    matrix: number[][];
  };
}

export const ML_MODEL_METRICS: ModelEvaluationMetrics = {
  algorithm: "Gradient Boosted Multi-Stage Regressor & Classifier (LightGBM + Random Forest Ensemble)",
  version: "v4.2.1-prod",
  lastTrained: "2026-09-10",
  trainSamples: 2450,
  testSamples: 612,
  rmseDays: 14.6,
  maeDays: 9.8,
  r2Score: 0.914,
  rocAuc: 0.942,
  featureImportances: [
    { feature: "Active Legal Objections & Cases", importancePct: 24.5 },
    { feature: "Compensation Disbursal Velocity", importancePct: 21.0 },
    { feature: "R&R Families Resettlement Backlog", importancePct: 16.2 },
    { feature: "Inter-Ministerial Approval Latency", importancePct: 13.8 },
    { feature: "District Historical Land Dispute Index", importancePct: 9.5 },
    { feature: "Physical Possession Survey Gaps", importancePct: 8.2 },
    { feature: "Revenue Record Digitization Completeness", importancePct: 6.8 }
  ],
  confusionMatrix: {
    labels: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    matrix: [
      [145, 12, 2, 0],
      [8, 180, 14, 3],
      [1, 11, 165, 9],
      [0, 2, 8, 52]
    ]
  }
};

export interface DataQualityReport {
  overallCompletenessPct: number;
  totalRecordsChecked: number;
  validRecordsCount: number;
  recordsWithAnomalies: number;
  fieldHealth: {
    field: string;
    missingCount: number;
    completenessPct: number;
    status: 'OPTIMAL' | 'ACCEPTABLE' | 'ATTENTION_NEEDED';
  }[];
}

export const DATA_QUALITY_STATS: DataQualityReport = {
  overallCompletenessPct: 94.8,
  totalRecordsChecked: 2540,
  validRecordsCount: 2418,
  recordsWithAnomalies: 122,
  fieldHealth: [
    { field: "Section 3a Notification Date", missingCount: 14, completenessPct: 99.4, status: "OPTIMAL" },
    { field: "Section 3A Gazette Issuance", missingCount: 38, completenessPct: 98.5, status: "OPTIMAL" },
    { field: "Section 3D Declaration Record", missingCount: 105, completenessPct: 95.8, status: "OPTIMAL" },
    { field: "Sanction Number & Amount", missingCount: 42, completenessPct: 98.3, status: "OPTIMAL" },
    { field: "Land Parcels Geo-Coordinates", missingCount: 184, completenessPct: 92.7, status: "ACCEPTABLE" },
    { field: "Beneficiary Bank Details (PFMS)", missingCount: 220, completenessPct: 91.3, status: "ACCEPTABLE" },
    { field: "R&R Grievance Case Records", missingCount: 340, completenessPct: 86.6, status: "ATTENTION_NEEDED" }
  ]
};

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProjectStatus = 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'HALTED';

export interface Project {
  project_id: string;
  project_name: string;
  project_number: string;
  project_type: string;
  implementing_agency: string;
  land_acquiring_authority: string;
  state: string;
  district: string;
  sub_district: string;
  village: string;
  project_status: string;
  land_required_ha: number;
  land_available_ha: number;
  land_to_be_acquired_ha: number;
  land_acquired_till_now_ha: number;
  land_remaining_ha: number;
  acquisition_progress_pct: number;
  land_available_pct: number;
  number_of_land_parcels: number;
  disputed_land_parcels: number;
  sanction_count: number;
  sanction_number: string;
  sanction_date: string;
  sanction_amount: number;
  approval_status: string;
  approval_stage: string;
  approval_pending_days: number;
  approval_delay_days: number;
  pending_approval_count: number;
  num_3a: number;
  num_3A: number;
  num_3D: number;
  total_notifications: number;
  first_3a_date?: string | null;
  last_3a_date?: string | null;
  first_3A_date?: string | null;
  last_3A_date?: string | null;
  first_3D_date?: string | null;
  last_3D_date?: string | null;
  active_case_count: number;
  unresolved_objection_count: number;
  legal_case_age_days: number;
  legal_risk_level: RiskLevel;
  legal_source: string;
  compensation_progress_pct: number;
  compensation_pending_days: number;
  compensation_pending_amount: number;
  beneficiaries_total: number;
  beneficiaries_paid: number;
  beneficiaries_pending: number;
  compensation_risk_level: RiskLevel;
  compensation_source: string;
  rr_progress_pct: number;
  affected_families: number;
  rr_pending_families: number;
  rr_pending_days: number;
  rr_risk_level: RiskLevel;
  rr_source: string;
  unresolved_ownership_count: number;
  ownership_risk_level: RiskLevel;
  ownership_source: string;
  affected_landowners: number;
  pending_landowners: number;
  verified_affected_parties: number;
  consent_status: string;
  affected_party_source: string;
  response_rate_pct: number;
  overdue_requests: number;
  average_response_days: number;
  stakeholder_risk_level: RiskLevel;
  possession_progress_pct: number;
  possession_pending_days: number;
  possession_status: string;
  possession_risk_level: RiskLevel;
  possession_source: string;
  missing_document_count: number;
  incomplete_record_count: number;
  data_completeness_pct: number;
  documentation_risk: RiskLevel;
  document_verification_status: string;
  source_reliability: string;
  agency_historical_delay_rate: number;
  district_historical_delay_rate: number;
  project_type_delay_rate: number;
  latitude: number;
  longitude: number;
  administrative_bottleneck?: string;
  department_pending?: string;
  last_updated: string;
  [key: string]: any;
}

export interface RiskFeatureContribution {
  feature: string;
  currentValue: string;
  contribution: 'High' | 'Medium' | 'Low';
  contributionPct: number;
  evidence: string;
  source: string;
  timestamp: string;
}

export interface RiskPrediction {
  riskScore: number;
  riskCategory: RiskLevel;
  predictedDelayDays: number;
  predictedDelayMonths: number;
  estimatedCompletionDate: string;
  confidenceScore: number;
  topDrivers: RiskFeatureContribution[];
}

export interface EarlyWarning {
  id: string;
  projectId: string;
  projectName: string;
  state: string;
  district: string;
  trigger: string;
  action: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  date: string;
  responsibleStakeholder: string | null;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface Intervention {
  id: string;
  projectId: string;
  projectName: string;
  problem: string;
  recommendedAction: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  responsibleStakeholder: string;
  expectedImpact: string;
  deadline: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
}
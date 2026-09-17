import { Project, RiskPrediction, RiskFeatureContribution, EarlyWarning, Intervention, RiskLevel } from './types';

function riskLevelToScore(level: RiskLevel): number {
  switch (level) {
    case 'CRITICAL': return 95;
    case 'HIGH': return 75;
    case 'MEDIUM': return 50;
    case 'LOW': return 20;
    default: return 10;
  }
}

function toImpactLabel(val: number): 'High' | 'Medium' | 'Low' {
  if (val >= 15) return 'High';
  if (val >= 8) return 'Medium';
  return 'Low';
}

function scoreToCategory(score: number): RiskLevel {
  if (score >= 75) return 'CRITICAL';
  if (score >= 55) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

export function calculateRiskPrediction(p: Project): RiskPrediction {
  const drivers: RiskFeatureContribution[] = [];

  // 1. Legal Disputes (Weight ~25%)
  const legalRaw = Math.min(100, 
    p.active_case_count * 8 + 
    p.unresolved_objection_count * 2 + 
    (p.legal_case_age_days > 180 ? 20 : p.legal_case_age_days > 90 ? 12 : 5) + 
    riskLevelToScore(p.legal_risk_level) * 0.3
  );
  const legalPct = Math.round(legalRaw * 0.25);
  drivers.push({
    feature: 'Legal Disputes',
    currentValue: `${p.active_case_count} active cases, ${p.unresolved_objection_count} unresolved objections`,
    contribution: toImpactLabel(legalPct),
    contributionPct: legalPct,
    evidence: `Oldest case: ${p.legal_case_age_days} days. Source: ${p.legal_source}`,
    source: p.legal_source,
    timestamp: p.last_updated
  });

  // 2. Compensation (Weight ~22%)
  const compRaw = Math.min(100,
    (100 - p.compensation_progress_pct) * 0.5 +
    (p.compensation_pending_days > 90 ? 25 : p.compensation_pending_days > 30 ? 15 : 5) +
    (p.beneficiaries_pending / Math.max(p.beneficiaries_total, 1)) * 30 +
    riskLevelToScore(p.compensation_risk_level) * 0.2
  );
  const compPct = Math.round(compRaw * 0.22);
  drivers.push({
    feature: 'Compensation',
    currentValue: `${p.compensation_progress_pct}% paid, ${p.beneficiaries_pending} beneficiaries pending`,
    contribution: toImpactLabel(compPct),
    contributionPct: compPct,
    evidence: `Pending: ₹${p.compensation_pending_amount} Cr. Source: ${p.compensation_source}`,
    source: p.compensation_source,
    timestamp: p.last_updated
  });

  // 3. Rehabilitation & Resettlement (Weight ~15%)
  const rrRaw = Math.min(100,
    (100 - p.rr_progress_pct) * 0.4 +
    (p.rr_pending_families / Math.max(p.affected_families, 1)) * 40 +
    (p.rr_pending_days > 90 ? 20 : 0) +
    riskLevelToScore(p.rr_risk_level) * 0.2
  );
  const rrPct = Math.round(rrRaw * 0.15);
  drivers.push({
    feature: 'Rehabilitation & Resettlement',
    currentValue: `${p.rr_progress_pct}% complete, ${p.rr_pending_families} families pending`,
    contribution: toImpactLabel(rrPct),
    contributionPct: rrPct,
    evidence: `${p.affected_families} total affected families. Source: ${p.rr_source}`,
    source: p.rr_source,
    timestamp: p.last_updated
  });

  // 4. Approval / Administrative (Weight ~15%)
  const appRaw = Math.min(100,
    p.pending_approval_count * 15 +
    p.approval_pending_days * 0.8 +
    p.approval_delay_days * 0.5
  );
  const appPct = Math.round(appRaw * 0.15);
  drivers.push({
    feature: 'Approval & Clearances',
    currentValue: `${p.pending_approval_count} pending, ${p.approval_pending_days} days waiting`,
    contribution: toImpactLabel(appPct),
    contributionPct: appPct,
    evidence: `Bottleneck: ${p.administrative_bottleneck || 'Clearances'}. Stage: ${p.approval_stage}`,
    source: 'Government Administrative Portal',
    timestamp: p.last_updated
  });

  // 5. Land Ownership & Title (Weight ~10%)
  const ownRaw = Math.min(100,
    p.unresolved_ownership_count * 5 +
    (p.disputed_land_parcels / Math.max(p.number_of_land_parcels, 1)) * 50 +
    riskLevelToScore(p.ownership_risk_level) * 0.3
  );
  const ownPct = Math.round(ownRaw * 0.10);
  drivers.push({
    feature: 'Ownership Conflicts',
    currentValue: `${p.disputed_land_parcels} disputed parcels, ${p.unresolved_ownership_count} unresolved`,
    contribution: toImpactLabel(ownPct),
    contributionPct: ownPct,
    evidence: `Source: ${p.ownership_source}`,
    source: p.ownership_source,
    timestamp: p.last_updated
  });

  // 6. Stakeholder & Responsiveness (Weight ~10%)
  const respRaw = Math.min(100,
    (100 - p.response_rate_pct) * 0.4 +
    p.overdue_requests * 3 +
    (p.average_response_days > 30 ? 20 : 5)
  );
  const respPct = Math.round(respRaw * 0.10);
  drivers.push({
    feature: 'Stakeholder Responsiveness',
    currentValue: `${p.response_rate_pct}% response rate, ${p.overdue_requests} overdue inquiries`,
    contribution: toImpactLabel(respPct),
    contributionPct: respPct,
    evidence: `Avg response time: ${p.average_response_days} days.`,
    source: 'Grievance Tracking System',
    timestamp: p.last_updated
  });

  // Sort drivers descending by contribution
  drivers.sort((a, b) => b.contributionPct - a.contributionPct);

  // Overall combined score capped at 98
  const totalScore = Math.min(98, Math.max(12, legalPct + compPct + rrPct + appPct + ownPct + respPct));
  const category = scoreToCategory(totalScore);

  // Calculate predicted delay in days and months
  const predictedDays = Math.round((totalScore / 100) * 450 + (p.active_case_count > 4 ? 120 : 0));
  const predictedMonths = Math.round((predictedDays / 30) * 10) / 10;

  // Estimated completion date from baseline
  const estDate = new Date('2026-09-16');
  estDate.setDate(estDate.getDate() + predictedDays);

  return {
    riskScore: totalScore,
    riskCategory: category,
    predictedDelayDays: predictedDays,
    predictedDelayMonths: predictedMonths,
    estimatedCompletionDate: estDate.toISOString().split('T')[0],
    confidenceScore: Math.round(85 + (p.data_completeness_pct - 70) * 0.3),
    topDrivers: drivers
  };
}

export function generateEarlyWarnings(projects: Project[]): EarlyWarning[] {
  const warnings: EarlyWarning[] = [];
  const stakeholders = [
    "S. Sharma (State Admin)",
    "P. Naidu (District Admin)",
    "A. Deshmukh (Project Officer)",
    "R. Rawat (Project Officer)",
    "M. Verma (State Admin)",
    "K. Reddy (Project Officer)"
  ];

  for (const p of projects) {
    const risk = calculateRiskPrediction(p);
    if (risk.riskScore < 50) continue;
    if (warnings.length >= 60) break;

    const baseDate = new Date('2026-09-16');

    if (p.active_case_count >= 4 && p.unresolved_objection_count > 20) {
      warnings.push({
        id: `EW-${p.project_id}-LEG`,
        projectId: p.project_id,
        projectName: p.project_name,
        state: p.state,
        district: p.district,
        trigger: `${p.active_case_count} active legal disputes with ${p.unresolved_objection_count} unresolved objections pending in court`,
        action: "Initiate special fast-track judicial mediation and assign dedicated standing counsel.",
        severity: p.active_case_count >= 6 ? 'CRITICAL' : 'HIGH',
        date: baseDate.toISOString().split('T')[0],
        responsibleStakeholder: stakeholders[warnings.length % stakeholders.length],
        status: 'ACTIVE'
      });
    }

    if (p.compensation_pending_days > 75 && p.beneficiaries_pending > 80) {
      warnings.push({
        id: `EW-${p.project_id}-CMP`,
        projectId: p.project_id,
        projectName: p.project_name,
        state: p.state,
        district: p.district,
        trigger: `Compensation disbursal stalled for ${p.compensation_pending_days} days; ₹${p.compensation_pending_amount} Cr pending for ${p.beneficiaries_pending} awardees`,
        action: "Deploy special treasury disbursal camp at District Collectorate with direct PFMS linking.",
        severity: p.compensation_pending_days > 120 ? 'CRITICAL' : 'HIGH',
        date: baseDate.toISOString().split('T')[0],
        responsibleStakeholder: stakeholders[(warnings.length + 1) % stakeholders.length],
        status: 'ACTIVE'
      });
    }

    if (p.pending_approval_count > 0 && p.approval_pending_days > 35) {
      warnings.push({
        id: `EW-${p.project_id}-APP`,
        projectId: p.project_id,
        projectName: p.project_name,
        state: p.state,
        district: p.district,
        trigger: `Statutory clearance pending ${p.approval_pending_days} days: ${p.administrative_bottleneck || 'Environmental Clearance'}`,
        action: "Submit inter-ministerial escalation memorandum to Ministry of Environment & Forests.",
        severity: p.approval_pending_days > 75 ? 'HIGH' : 'MEDIUM',
        date: baseDate.toISOString().split('T')[0],
        responsibleStakeholder: stakeholders[(warnings.length + 2) % stakeholders.length],
        status: 'ACTIVE'
      });
    }
  }

  return warnings;
}

export function generateInterventions(projects: Project[]): Intervention[] {
  const interventions: Intervention[] = [];
  const stakeholders = [
    "Project Director (NHAI)",
    "Special Land Acquisition Officer (SLAO)",
    "District Collector / DM",
    "Legal Cell In-Charge",
    "Chief Engineer (Railways)",
    "Rehabilitation Commissioner"
  ];

  for (const p of projects) {
    const risk = calculateRiskPrediction(p);
    if (risk.riskScore < 55) continue;
    if (interventions.length >= 40) break;

    const baseDate = new Date('2026-09-16');
    baseDate.setDate(baseDate.getDate() + 25);

    if (p.active_case_count >= 3) {
      interventions.push({
        id: `INT-${p.project_id}-1`,
        projectId: p.project_id,
        projectName: p.project_name,
        problem: `Protracted High Court objections affecting ${p.disputed_land_parcels} parcels`,
        recommendedAction: "Offer one-time structured out-of-court settlement package under Section 64/76 guidelines.",
        priority: p.active_case_count > 5 ? 'HIGH' : 'MEDIUM',
        responsibleStakeholder: stakeholders[0],
        expectedImpact: "Estimated reduction of 90-120 days in acquisition timeline",
        deadline: baseDate.toISOString().split('T')[0],
        status: interventions.length % 3 === 0 ? 'IN_PROGRESS' : 'PENDING'
      });
    }

    if (p.compensation_progress_pct < 60) {
      const deadline = new Date('2026-09-16');
      deadline.setDate(deadline.getDate() + 15);
      interventions.push({
        id: `INT-${p.project_id}-2`,
        projectId: p.project_id,
        projectName: p.project_name,
        problem: `Low award disbursement progress (${p.compensation_progress_pct}%) triggering village council strikes`,
        recommendedAction: "Host joint grievance-redressal and bank account validation camp at Tehsil office.",
        priority: 'HIGH',
        responsibleStakeholder: stakeholders[1],
        expectedImpact: "Accelerates title clearance and enables peaceful physical possession",
        deadline: deadline.toISOString().split('T')[0],
        status: 'PENDING'
      });
    }
  }

  return interventions;
}

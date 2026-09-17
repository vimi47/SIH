import { ALL_PROJECTS } from './projects';
import { calculateRiskPrediction } from './intelligence';

export interface StateSummary {
  state: string;
  totalProjects: number;
  totalLandHa: number;
  avgDelayDays: number;
  criticalRiskCount: number;
  highRiskCount: number;
  totalSanctionCr: number;
  avgProgressPct: number;
}

export function getStateAnalytics(): StateSummary[] {
  const map: Record<string, {
    count: number;
    land: number;
    delays: number[];
    critical: number;
    high: number;
    sanction: number;
    progress: number[];
  }> = {};

  for (const p of ALL_PROJECTS) {
    if (!map[p.state]) {
      map[p.state] = { count: 0, land: 0, delays: [], critical: 0, high: 0, sanction: 0, progress: [] };
    }
    const item = map[p.state];
    item.count += 1;
    item.land += p.land_required_ha;
    item.sanction += p.sanction_amount / 100; // convert to Cr
    item.progress.push(p.acquisition_progress_pct);

    const risk = calculateRiskPrediction(p);
    item.delays.push(risk.predictedDelayDays);
    if (risk.riskCategory === 'CRITICAL') item.critical += 1;
    if (risk.riskCategory === 'HIGH') item.high += 1;
  }

  return Object.entries(map).map(([state, data]) => ({
    state,
    totalProjects: data.count,
    totalLandHa: Math.round(data.land * 10) / 10,
    avgDelayDays: Math.round(data.delays.reduce((a, b) => a + b, 0) / Math.max(data.delays.length, 1)),
    criticalRiskCount: data.critical,
    highRiskCount: data.high,
    totalSanctionCr: Math.round(data.sanction * 10) / 10,
    avgProgressPct: Math.round(data.progress.reduce((a, b) => a + b, 0) / Math.max(data.progress.length, 1))
  })).sort((a, b) => b.criticalRiskCount - a.criticalRiskCount);
}

export interface DistrictSummary {
  district: string;
  state: string;
  projectsCount: number;
  avgDelayDays: number;
  topBottleneck: string;
  avgRiskScore: number;
  totalDisputedParcels: number;
}

export function getDistrictAnalytics(): DistrictSummary[] {
  const map: Record<string, {
    state: string;
    count: number;
    delays: number[];
    riskScores: number[];
    disputedParcels: number;
    bottlenecks: Record<string, number>;
  }> = {};

  for (const p of ALL_PROJECTS) {
    const key = `${p.district} (${p.state})`;
    if (!map[key]) {
      map[key] = {
        state: p.state,
        count: 0,
        delays: [],
        riskScores: [],
        disputedParcels: 0,
        bottlenecks: {}
      };
    }
    const item = map[key];
    item.count += 1;
    item.disputedParcels += p.disputed_land_parcels;

    const risk = calculateRiskPrediction(p);
    item.delays.push(risk.predictedDelayDays);
    item.riskScores.push(risk.riskScore);

    const b = p.administrative_bottleneck || 'Environmental Clearance';
    item.bottlenecks[b] = (item.bottlenecks[b] || 0) + 1;
  }

  return Object.entries(map).map(([districtKey, data]) => {
    const districtName = districtKey.split(' (')[0];
    const topB = Object.entries(data.bottlenecks).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Clearance Pending';
    return {
      district: districtName,
      state: data.state,
      projectsCount: data.count,
      avgDelayDays: Math.round(data.delays.reduce((a, b) => a + b, 0) / Math.max(data.delays.length, 1)),
      topBottleneck: topB,
      avgRiskScore: Math.round(data.riskScores.reduce((a, b) => a + b, 0) / Math.max(data.riskScores.length, 1)),
      totalDisputedParcels: data.disputedParcels
    };
  }).sort((a, b) => b.avgRiskScore - a.avgRiskScore);
}

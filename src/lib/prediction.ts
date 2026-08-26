import {
  HISTORICAL_PROJECTS,
  STAGES,
  haversineKm,
  totalDelay,
  type HistoricalProject,
  type ProjectMode,
  type StageKey,
} from "./acquisition-data";

export type LatLng = { lat: number; lng: number };

export type CorridorInput = {
  waypoints: LatLng[];
  mode: ProjectMode;
  urbanShare: number; // 0-1
  hectaresPerKm: number;
  tribalShare: number; // 0-1
};

export type StagePrediction = {
  key: StageKey;
  label: string;
  statute: string;
  predictedMonths: number;
  p50: number;
  p90: number;
  probabilityOfDelay: number; // 0-1
  risk: RiskLevel;
  drivers: string[];
};

export type RiskLevel = "low" | "moderate" | "high" | "severe";

export type Prediction = {
  lengthKm: number;
  hectares: number;
  neighbours: Array<HistoricalProject & { distanceKm: number; weight: number }>;
  stages: StagePrediction[];
  totalMonths: number;
  totalP90: number;
  overallProbability: number;
  risk: RiskLevel;
  confidence: number; // 0-1
  baselineMonths: number;
};

const MODE_FACTOR: Record<ProjectMode, number> = {
  metro: 0.92,
  railway: 1.06,
  highway: 1.0,
  expressway: 0.95,
};

// Stage sensitivity to each corridor driver.
const URBAN_SENS: Record<StageKey, number> = {
  notification: 0.25,
  sia: 0.1,
  declaration: 0.4,
  compensation: 0.55,
  possession: 0.6,
  litigation: 0.8,
};
const TRIBAL_SENS: Record<StageKey, number> = {
  notification: 0.2,
  sia: 0.9,
  declaration: 0.35,
  compensation: 0.3,
  possession: 0.5,
  litigation: 0.55,
};
const SCALE_SENS: Record<StageKey, number> = {
  notification: 0.3,
  sia: 0.35,
  declaration: 0.4,
  compensation: 0.45,
  possession: 0.4,
  litigation: 0.3,
};

export function riskFromMonths(months: number): RiskLevel {
  if (months < 24) return "low";
  if (months < 45) return "moderate";
  if (months < 70) return "high";
  return "severe";
}

export function riskFromProbability(p: number): RiskLevel {
  if (p < 0.35) return "low";
  if (p < 0.6) return "moderate";
  if (p < 0.8) return "high";
  return "severe";
}

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Low risk",
  moderate: "Moderate risk",
  high: "High risk",
  severe: "Severe risk",
};

export function corridorLengthKm(points: LatLng[]) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += haversineKm(points[i - 1]!, points[i]!);
  return total;
}

function logistic(x: number) {
  return 1 / (1 + Math.exp(-x));
}

export function predict(input: CorridorInput): Prediction | null {
  const { waypoints } = input;
  if (waypoints.length < 2) return null;

  const lengthKm = corridorLengthKm(waypoints);
  const hectares = lengthKm * input.hectaresPerKm;

  // Distance of each historical project to the nearest corridor waypoint.
  const scored = HISTORICAL_PROJECTS.map((prj) => {
    const distanceKm = Math.min(...waypoints.map((w) => haversineKm(w, prj)));
    return { ...prj, distanceKm };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const radius = 400;
  const pool = scored.filter((s) => s.distanceKm <= radius).slice(0, 12);
  const neighboursRaw = pool.length >= 4 ? pool : scored.slice(0, 6);

  const neighbours = neighboursRaw.map((n) => {
    const spatial = 1 / (1 + (n.distanceKm / 150) ** 2);
    const modeMatch = n.mode === input.mode ? 1.35 : 1;
    const recency = 1 + (n.year - 2015) * 0.04;
    return { ...n, weight: spatial * modeMatch * recency };
  });
  const wSum = neighbours.reduce((a, b) => a + b.weight, 0) || 1;

  const scaleRef =
    neighbours.reduce((a, n) => a + n.weight * n.hectares, 0) / wSum || hectares;
  const scaleRatio = Math.max(0.4, Math.min(2.5, hectares / Math.max(scaleRef, 1)));
  const scaleAdj = Math.log2(scaleRatio + 1) - 1; // -0.5 .. +0.8

  const urbanRef = neighbours.reduce((a, n) => a + n.weight * n.urbanShare, 0) / wSum;
  const tribalRef = neighbours.reduce((a, n) => a + n.weight * n.tribalShare, 0) / wSum;

  const stages: StagePrediction[] = STAGES.map((stage) => {
    const base = neighbours.reduce((a, n) => a + n.weight * n.stageDelays[stage.key], 0) / wSum;

    const urbanDelta = (input.urbanShare - urbanRef) * URBAN_SENS[stage.key];
    const tribalDelta = (input.tribalShare - tribalRef) * TRIBAL_SENS[stage.key] * 1.6;
    const scaleDelta = scaleAdj * SCALE_SENS[stage.key];
    const multiplier =
      MODE_FACTOR[input.mode] * (1 + urbanDelta + tribalDelta + scaleDelta);

    const predictedMonths = Math.max(1, base * multiplier);

    // Dispersion from the neighbourhood spread.
    const variance =
      neighbours.reduce(
        (a, n) => a + n.weight * (n.stageDelays[stage.key] - base) ** 2,
        0,
      ) / wSum;
    const sd = Math.sqrt(variance) * multiplier;

    const probabilityOfDelay = logistic((predictedMonths - 5) / 3.2);

    const drivers: string[] = [];
    if (urbanDelta > 0.05) drivers.push("Dense built-up parcels");
    if (tribalDelta > 0.05) drivers.push("Scheduled-area consent (PESA)");
    if (scaleDelta > 0.05) drivers.push("Large land footprint");
    if (stage.key === "litigation" && input.urbanShare > 0.6)
      drivers.push("High compensation-reference filings");
    if (stage.key === "sia" && input.tribalShare > 0.15)
      drivers.push("Gram Sabha consent cycles");
    if (!drivers.length) drivers.push("Comparable to regional benchmark");

    return {
      key: stage.key,
      label: stage.label,
      statute: stage.statute,
      predictedMonths: round1(predictedMonths),
      p50: round1(predictedMonths * 0.88),
      p90: round1(predictedMonths + 1.28 * Math.max(sd, predictedMonths * 0.25)),
      probabilityOfDelay,
      risk: riskFromProbability(probabilityOfDelay),
      drivers,
    };
  });

  const totalMonths = stages.reduce((a, s) => a + s.predictedMonths, 0);
  const totalP90 = stages.reduce((a, s) => a + s.p90, 0);
  const baselineMonths =
    neighbours.reduce((a, n) => a + n.weight * n.plannedMonths, 0) / wSum;

  const overallProbability = logistic((totalMonths - baselineMonths * 0.4) / 8);

  const avgDist = neighbours.reduce((a, n) => a + n.distanceKm, 0) / neighbours.length;
  const confidence = Math.max(
    0.28,
    Math.min(0.94, 0.95 - avgDist / 700 - (neighbours.length < 6 ? 0.12 : 0)),
  );

  return {
    lengthKm,
    hectares,
    neighbours: neighbours.sort((a, b) => a.distanceKm - b.distanceKm),
    stages,
    totalMonths: round1(totalMonths),
    totalP90: round1(totalP90),
    overallProbability,
    risk: riskFromMonths(totalMonths),
    confidence,
    baselineMonths: round1(baselineMonths),
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function stateTrends() {
  const map = new Map<string, { state: string; total: number; count: number; litigation: number }>();
  for (const prj of HISTORICAL_PROJECTS) {
    const e = map.get(prj.state) ?? { state: prj.state, total: 0, count: 0, litigation: 0 };
    e.total += totalDelay(prj);
    e.litigation += prj.stageDelays.litigation;
    e.count += 1;
    map.set(prj.state, e);
  }
  return [...map.values()]
    .map((e) => ({
      state: e.state,
      avgDelay: round1(e.total / e.count),
      avgLitigation: round1(e.litigation / e.count),
      projects: e.count,
    }))
    .sort((a, b) => b.avgDelay - a.avgDelay);
}

export function districtTrends(state?: string) {
  return HISTORICAL_PROJECTS.filter((p) => !state || p.state === state)
    .map((p) => ({
      district: p.district,
      state: p.state,
      delay: totalDelay(p),
      project: p.name,
    }))
    .sort((a, b) => b.delay - a.delay);
}

export function yearTrends() {
  const map = new Map<number, { year: number; total: number; count: number }>();
  for (const prj of HISTORICAL_PROJECTS) {
    const e = map.get(prj.year) ?? { year: prj.year, total: 0, count: 0 };
    e.total += totalDelay(prj);
    e.count += 1;
    map.set(prj.year, e);
  }
  return [...map.values()]
    .map((e) => ({ year: e.year, avgDelay: round1(e.total / e.count) }))
    .sort((a, b) => a.year - b.year);
}

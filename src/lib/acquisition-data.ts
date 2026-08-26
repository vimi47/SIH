// Historical land acquisition dataset (MVP: curated synthetic records modelled
// on typical RFCTLARR-era Indian infrastructure corridors).

export type ProjectMode = "railway" | "metro" | "highway" | "expressway";

export const STAGES = [
  { key: "notification", label: "Preliminary Notification", statute: "Sec. 11 / 3A" },
  { key: "sia", label: "Social Impact Assessment", statute: "Sec. 4-7" },
  { key: "declaration", label: "Declaration & Award", statute: "Sec. 19 / 23" },
  { key: "compensation", label: "Compensation Disbursal", statute: "Sec. 77-80" },
  { key: "possession", label: "Possession & Handover", statute: "Sec. 38" },
  { key: "litigation", label: "Litigation / Objections", statute: "Sec. 64" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

export type HistoricalProject = {
  id: string;
  name: string;
  mode: ProjectMode;
  state: string;
  district: string;
  lat: number;
  lng: number;
  year: number;
  lengthKm: number;
  hectares: number;
  urbanShare: number; // 0-1 share of urban / built-up land
  tribalShare: number; // 0-1 share of scheduled-area land
  parcels: number;
  plannedMonths: number;
  actualMonths: number;
  /** Delay in months attributable to each acquisition stage. */
  stageDelays: Record<StageKey, number>;
  litigationCases: number;
};

function p(
  id: string,
  name: string,
  mode: ProjectMode,
  state: string,
  district: string,
  lat: number,
  lng: number,
  year: number,
  lengthKm: number,
  hectares: number,
  urbanShare: number,
  tribalShare: number,
  parcels: number,
  plannedMonths: number,
  d: [number, number, number, number, number, number],
  litigationCases: number,
): HistoricalProject {
  const stageDelays: Record<StageKey, number> = {
    notification: d[0],
    sia: d[1],
    declaration: d[2],
    compensation: d[3],
    possession: d[4],
    litigation: d[5],
  };
  const totalDelay = d.reduce((a, b) => a + b, 0);
  return {
    id,
    name,
    mode,
    state,
    district,
    lat,
    lng,
    year,
    lengthKm,
    hectares,
    urbanShare,
    tribalShare,
    parcels,
    plannedMonths,
    actualMonths: plannedMonths + totalDelay,
    stageDelays,
    litigationCases,
  };
}

export const HISTORICAL_PROJECTS: HistoricalProject[] = [
  p("MH-01", "Mumbai Metro Line 3 – Colaba Reach", "metro", "Maharashtra", "Mumbai City", 18.93, 72.83, 2016, 12, 34, 0.96, 0, 1420, 18, [5, 3, 9, 11, 8, 14], 62),
  p("MH-02", "Mumbai–Ahmedabad HSR Thane Section", "railway", "Maharashtra", "Thane", 19.21, 72.98, 2018, 38, 210, 0.62, 0.04, 3100, 24, [7, 9, 14, 12, 15, 22], 148),
  p("MH-03", "Pune Metro Purple Line Extension", "metro", "Maharashtra", "Pune", 18.53, 73.86, 2017, 16, 48, 0.88, 0, 890, 18, [4, 3, 7, 6, 6, 9], 31),
  p("MH-04", "Samruddhi Expressway – Nashik Leg", "expressway", "Maharashtra", "Nashik", 20.0, 73.79, 2017, 92, 1180, 0.14, 0.11, 6400, 30, [4, 6, 8, 7, 9, 11], 96),
  p("MH-05", "Nagpur–Nagbhid Gauge Conversion", "railway", "Maharashtra", "Nagpur", 21.15, 79.09, 2019, 106, 420, 0.18, 0.22, 2200, 24, [5, 8, 9, 10, 11, 13], 44),
  p("GJ-01", "Ahmedabad Metro Phase 2", "metro", "Gujarat", "Ahmedabad", 23.03, 72.58, 2019, 28, 62, 0.83, 0, 720, 18, [3, 2, 5, 4, 5, 6], 18),
  p("GJ-02", "Surat–Bharuch HSR Alignment", "railway", "Gujarat", "Surat", 21.19, 72.83, 2018, 62, 340, 0.31, 0.05, 2850, 24, [3, 4, 6, 5, 7, 8], 52),
  p("GJ-03", "Delhi–Mumbai Expressway Vadodara Leg", "expressway", "Gujarat", "Vadodara", 22.31, 73.18, 2019, 84, 960, 0.11, 0.02, 4100, 24, [2, 3, 5, 4, 5, 6], 27),
  p("GJ-04", "Rajkot–Kanalus Doubling", "railway", "Gujarat", "Rajkot", 22.3, 70.8, 2020, 74, 260, 0.16, 0, 1500, 20, [3, 3, 4, 5, 5, 5], 12),
  p("DL-01", "Delhi Metro Phase IV Magenta Extension", "metro", "Delhi", "South West Delhi", 28.55, 77.09, 2019, 29, 74, 0.98, 0, 980, 18, [4, 3, 8, 7, 9, 12], 58),
  p("DL-02", "RRTS Delhi–Meerut Sarai Kale Khan", "railway", "Delhi", "South East Delhi", 28.59, 77.26, 2019, 14, 55, 0.97, 0, 640, 18, [5, 4, 7, 6, 8, 10], 41),
  p("UP-01", "RRTS Meerut Corridor", "railway", "Uttar Pradesh", "Meerut", 28.98, 77.71, 2019, 42, 190, 0.47, 0, 2400, 24, [6, 7, 11, 10, 12, 16], 88),
  p("UP-02", "Ganga Expressway – Hardoi Package", "expressway", "Uttar Pradesh", "Hardoi", 27.42, 80.13, 2020, 118, 1420, 0.07, 0, 7800, 30, [5, 7, 10, 12, 11, 14], 132),
  p("UP-03", "Kanpur Metro Corridor 1", "metro", "Uttar Pradesh", "Kanpur Nagar", 26.45, 80.33, 2019, 24, 58, 0.91, 0, 810, 18, [5, 4, 8, 9, 8, 11], 39),
  p("UP-04", "Varanasi Ring Road Phase 2", "highway", "Uttar Pradesh", "Varanasi", 25.32, 82.97, 2017, 29, 340, 0.38, 0, 2600, 24, [7, 8, 13, 14, 13, 19], 121),
  p("UP-05", "Jewar Airport Rail Link", "railway", "Uttar Pradesh", "Gautam Buddha Nagar", 28.24, 77.56, 2021, 35, 280, 0.44, 0, 1900, 24, [6, 6, 10, 11, 10, 13], 74),
  p("BR-01", "Patna Metro Corridor 2", "metro", "Bihar", "Patna", 25.6, 85.13, 2019, 18, 46, 0.9, 0, 690, 18, [8, 6, 12, 14, 13, 17], 66),
  p("BR-02", "Kosi Rail Mahasetu Approach", "railway", "Bihar", "Supaul", 26.12, 86.6, 2016, 22, 130, 0.09, 0, 1750, 24, [9, 8, 14, 16, 15, 18], 83),
  p("BR-03", "Buxar–Bhagalpur Expressway Leg", "expressway", "Bihar", "Bhagalpur", 25.24, 86.98, 2021, 96, 1050, 0.12, 0.03, 6100, 30, [8, 9, 13, 15, 14, 20], 141),
  p("WB-01", "Kolkata East–West Metro Bowbazar", "metro", "West Bengal", "Kolkata", 22.57, 88.36, 2015, 9, 26, 0.99, 0, 540, 18, [9, 6, 14, 15, 16, 24], 97),
  p("WB-02", "Kharagpur–Salboni Rail Link", "railway", "West Bengal", "Paschim Medinipur", 22.34, 87.32, 2018, 48, 210, 0.14, 0.17, 2300, 24, [10, 11, 15, 14, 17, 21], 108),
  p("WB-03", "Barasat–Barrackpore Metro Extension", "metro", "West Bengal", "North 24 Parganas", 22.72, 88.48, 2017, 12, 38, 0.86, 0, 720, 18, [11, 8, 16, 15, 18, 23], 114),
  p("KA-01", "Bengaluru Metro Phase 2A ORR", "metro", "Karnataka", "Bengaluru Urban", 12.95, 77.7, 2018, 20, 52, 0.95, 0, 860, 18, [4, 3, 7, 6, 7, 10], 34),
  p("KA-02", "Bengaluru Suburban Rail Corridor 2", "railway", "Karnataka", "Bengaluru Rural", 13.16, 77.6, 2020, 25, 145, 0.52, 0, 1400, 24, [5, 5, 9, 8, 9, 12], 47),
  p("KA-03", "Hubballi–Ankola Rail Alignment", "railway", "Karnataka", "Uttara Kannada", 14.63, 74.5, 2015, 164, 590, 0.05, 0.19, 2900, 30, [12, 15, 18, 14, 20, 28], 176),
  p("KA-04", "Mysuru Ring Road Widening", "highway", "Karnataka", "Mysuru", 12.3, 76.64, 2019, 42, 260, 0.36, 0, 1800, 20, [4, 4, 6, 6, 7, 8], 23),
  p("TN-01", "Chennai Metro Phase 2 Corridor 3", "metro", "Tamil Nadu", "Chennai", 13.05, 80.24, 2019, 45, 96, 0.94, 0, 1250, 18, [4, 3, 6, 6, 7, 9], 36),
  p("TN-02", "Chennai–Salem Expressway", "expressway", "Tamil Nadu", "Salem", 11.66, 78.15, 2018, 78, 890, 0.09, 0.02, 5300, 30, [8, 12, 14, 11, 16, 26], 168),
  p("TN-03", "Madurai–Thoothukudi Doubling", "railway", "Tamil Nadu", "Madurai", 9.93, 78.12, 2020, 84, 260, 0.15, 0, 1600, 24, [3, 4, 6, 5, 6, 7], 19),
  p("TN-04", "Coimbatore Bypass Phase 2", "highway", "Tamil Nadu", "Coimbatore", 11.02, 76.96, 2021, 32, 210, 0.42, 0, 1450, 20, [4, 4, 7, 7, 8, 9], 29),
  p("TG-01", "Hyderabad Metro Old City Stretch", "metro", "Telangana", "Hyderabad", 17.36, 78.47, 2016, 6, 22, 0.99, 0, 480, 18, [7, 5, 11, 10, 12, 18], 71),
  p("TG-02", "Regional Ring Road North Segment", "expressway", "Telangana", "Medak", 17.99, 78.27, 2021, 62, 720, 0.1, 0, 3900, 30, [4, 5, 8, 7, 9, 10], 45),
  p("AP-01", "Amaravati Outer Ring Rail", "railway", "Andhra Pradesh", "Guntur", 16.31, 80.44, 2018, 54, 320, 0.22, 0, 2600, 24, [7, 8, 12, 13, 12, 15], 79),
  p("AP-02", "Visakhapatnam Metro Corridor 1", "metro", "Andhra Pradesh", "Visakhapatnam", 17.72, 83.3, 2020, 34, 78, 0.87, 0.03, 940, 18, [6, 5, 9, 9, 10, 12], 43),
  p("KL-01", "Kochi Metro Phase 2 Kakkanad", "metro", "Kerala", "Ernakulam", 10.01, 76.35, 2019, 11, 30, 0.92, 0, 610, 18, [6, 5, 10, 9, 11, 14], 52),
  p("KL-02", "Thiruvananthapuram Outer Ring Road", "highway", "Kerala", "Thiruvananthapuram", 8.52, 76.94, 2020, 78, 420, 0.48, 0, 5200, 24, [9, 9, 15, 14, 17, 22], 138),
  p("RJ-01", "Delhi–Mumbai Expressway Dausa Leg", "expressway", "Rajasthan", "Dausa", 26.89, 76.34, 2018, 88, 940, 0.07, 0.01, 3800, 24, [2, 3, 4, 4, 5, 5], 16),
  p("RJ-02", "Jaipur Metro Phase 1C", "metro", "Rajasthan", "Jaipur", 26.92, 75.79, 2019, 8, 24, 0.93, 0, 430, 18, [3, 3, 5, 5, 6, 7], 21),
  p("MP-01", "Bhopal Metro Orange Line", "metro", "Madhya Pradesh", "Bhopal", 23.25, 77.4, 2019, 17, 44, 0.85, 0.02, 620, 18, [4, 4, 7, 6, 7, 9], 26),
  p("MP-02", "Indore–Manmad New Rail Line", "railway", "Madhya Pradesh", "Khargone", 21.82, 75.61, 2020, 96, 480, 0.08, 0.28, 3100, 30, [7, 11, 12, 11, 14, 17], 97),
  p("OD-01", "Talcher–Bimlagarh Rail Link", "railway", "Odisha", "Sundargarh", 22.12, 84.86, 2016, 154, 620, 0.04, 0.41, 3400, 30, [11, 16, 17, 15, 21, 27], 164),
  p("OD-02", "Bhubaneswar Metro Line 1", "metro", "Odisha", "Khordha", 20.29, 85.82, 2022, 26, 66, 0.82, 0.03, 780, 18, [5, 6, 9, 8, 10, 11], 37),
  p("JH-01", "Ranchi Ring Road Phase 7", "highway", "Jharkhand", "Ranchi", 23.36, 85.33, 2018, 34, 240, 0.29, 0.34, 2100, 24, [10, 14, 15, 13, 18, 22], 126),
  p("CG-01", "Raipur–Kharsia Rail Corridor", "railway", "Chhattisgarh", "Raigarh", 21.9, 83.4, 2019, 68, 310, 0.06, 0.37, 1900, 24, [9, 13, 13, 12, 16, 19], 88),
  p("PB-01", "Ludhiana–Bathinda Expressway Leg", "expressway", "Punjab", "Ludhiana", 30.9, 75.86, 2020, 74, 690, 0.13, 0, 4600, 24, [8, 8, 12, 13, 15, 18], 119),
  p("HR-01", "Gurugram Metro Extension", "metro", "Haryana", "Gurugram", 28.45, 77.03, 2021, 29, 68, 0.94, 0, 840, 18, [4, 4, 7, 6, 8, 10], 33),
  p("HR-02", "KMP Orbital Rail Corridor", "railway", "Haryana", "Palwal", 28.14, 77.33, 2020, 121, 640, 0.15, 0, 3600, 30, [5, 6, 9, 8, 10, 12], 58),
  p("AS-01", "Guwahati Ring Road", "highway", "Assam", "Kamrup", 26.14, 91.66, 2019, 56, 380, 0.35, 0.09, 2700, 24, [8, 10, 13, 12, 15, 18], 92),
  p("UK-01", "Rishikesh–Karnaprayag Rail Line", "railway", "Uttarakhand", "Tehri Garhwal", 30.28, 78.48, 2017, 125, 480, 0.11, 0.05, 2400, 30, [7, 9, 12, 11, 14, 16], 71),
];

export const MODE_LABEL: Record<ProjectMode, string> = {
  railway: "Railway",
  metro: "Metro",
  highway: "Highway",
  expressway: "Expressway",
};

export function totalDelay(pr: HistoricalProject) {
  return Object.values(pr.stageDelays).reduce((a, b) => a + b, 0);
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

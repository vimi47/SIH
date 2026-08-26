import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  HISTORICAL_PROJECTS,
  MODE_LABEL,
  totalDelay,
  type ProjectMode,
} from "@/lib/acquisition-data";
import {
  districtTrends,
  predict,
  RISK_LABEL,
  riskFromMonths,
  stateTrends,
  yearTrends,
  type LatLng,
  type RiskLevel,
} from "@/lib/prediction";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CorridorMap = lazy(() => import("@/components/CorridorMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bhoomi Sanket — India Land Acquisition Delay Predictor" },
      {
        name: "description",
        content:
          "Draw a rail, metro or highway alignment on the map and forecast phase-wise land acquisition delay, risk category and district-level trends from historical Indian projects.",
      },
      { property: "og:title", content: "Bhoomi Sanket — Land Acquisition Delay Predictor" },
      {
        property: "og:description",
        content:
          "Map-first MVP that predicts stage-wise land acquisition delays for Indian rail, metro and highway corridors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const RISK_BG: Record<RiskLevel, string> = {
  low: "bg-risk-low/15 text-risk-low border-risk-low/40",
  moderate: "bg-risk-moderate/20 text-risk-moderate border-risk-moderate/50",
  high: "bg-risk-high/15 text-risk-high border-risk-high/40",
  severe: "bg-risk-severe/15 text-risk-severe border-risk-severe/40",
};
const RISK_FILL: Record<RiskLevel, string> = {
  low: "var(--risk-low)",
  moderate: "var(--risk-moderate)",
  high: "var(--risk-high)",
  severe: "var(--risk-severe)",
};

function RiskPill({ risk }: { risk: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${RISK_BG[risk]}`}
    >
      {RISK_LABEL[risk]}
    </span>
  );
}

function Index() {
  const [waypoints, setWaypoints] = useState<LatLng[]>([]);
  const [mode, setMode] = useState<ProjectMode>("railway");
  const [urbanShare, setUrbanShare] = useState(45);
  const [tribalShare, setTribalShare] = useState(5);
  const [hectaresPerKm, setHectaresPerKm] = useState(8);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>("all");

  const prediction = useMemo(
    () =>
      predict({
        waypoints,
        mode,
        urbanShare: urbanShare / 100,
        tribalShare: tribalShare / 100,
        hectaresPerKm,
      }),
    [waypoints, mode, urbanShare, tribalShare, hectaresPerKm],
  );

  const selected = HISTORICAL_PROJECTS.find((p) => p.id === selectedId) ?? null;
  const states = useMemo(
    () => [...new Set(HISTORICAL_PROJECTS.map((p) => p.state))].sort(),
    [],
  );
  const stateData = useMemo(() => stateTrends(), []);
  const districtData = useMemo(
    () => districtTrends(stateFilter === "all" ? undefined : stateFilter).slice(0, 14),
    [stateFilter],
  );
  const yearData = useMemo(() => yearTrends(), []);

  const stageChart =
    prediction?.stages.map((s) => ({
      name: s.label.split(" ")[0],
      months: s.predictedMonths,
      p90: s.p90,
      risk: s.risk,
    })) ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          RFCTLARR 2013 · Corridor intelligence MVP
        </p>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">
          <span className="text-gradient-ink">Bhoomi Sanket</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Plot a railway, metro or highway alignment across India, pull in nearby
          historical land acquisitions, and forecast phase-wise delay, delay probability
          and risk category before the first notification is issued.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="surface-panel overflow-hidden p-3">
          <Suspense
            fallback={
              <div className="flex h-[520px] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                Loading base map…
              </div>
            }
          >
            <CorridorMap
              waypoints={waypoints}
              onAddWaypoint={(p) => setWaypoints((w) => [...w, p])}
              onSelectProject={(id) => setSelectedId(id)}
              highlightIds={prediction?.neighbours.slice(0, 6).map((n) => n.id) ?? []}
            />
          </Suspense>
          <div className="flex flex-wrap items-center gap-2 px-1 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWaypoints((w) => w.slice(0, -1))}
              disabled={!waypoints.length}
            >
              Undo point
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWaypoints([])}
              disabled={!waypoints.length}
            >
              Clear alignment
            </Button>
            <span className="ml-auto text-sm text-muted-foreground">
              {waypoints.length} point{waypoints.length === 1 ? "" : "s"} ·{" "}
              {prediction ? `${prediction.lengthKm.toFixed(1)} km` : "draw ≥ 2 points"}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-panel space-y-5 p-5">
            <h2 className="text-lg font-semibold">Corridor parameters</h2>
            <div className="space-y-2">
              <Label>Project type</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as ProjectMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MODE_LABEL) as ProjectMode[]).map((m) => (
                    <SelectItem key={m} value={m}>
                      {MODE_LABEL[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SliderRow
              label="Urban / built-up land share"
              value={urbanShare}
              onChange={setUrbanShare}
              suffix="%"
            />
            <SliderRow
              label="Scheduled-area (tribal) land share"
              value={tribalShare}
              onChange={setTribalShare}
              max={60}
              suffix="%"
            />
            <SliderRow
              label="Land take intensity"
              value={hectaresPerKm}
              onChange={setHectaresPerKm}
              min={2}
              max={20}
              suffix=" ha/km"
            />
            {prediction && (
              <p className="text-xs text-muted-foreground">
                Estimated acquisition footprint:{" "}
                <strong>{Math.round(prediction.hectares)} hectares</strong> across{" "}
                {prediction.neighbours.length} comparable historical projects.
              </p>
            )}
          </div>

          <div className="surface-panel p-5">
            <h2 className="text-lg font-semibold">Delay outlook</h2>
            {!prediction ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Drop at least two points on the map to generate a forecast.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Expected acquisition delay
                    </p>
                    <p className="text-4xl font-bold">
                      {prediction.totalMonths}
                      <span className="ml-1 text-base font-medium text-muted-foreground">
                        months
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      P90 worst case {prediction.totalP90} months · statutory baseline{" "}
                      {prediction.baselineMonths} months
                    </p>
                  </div>
                  <RiskPill risk={prediction.risk} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Probability of material delay</span>
                    <span className="font-semibold text-foreground">
                      {Math.round(prediction.overallProbability * 100)}%
                    </span>
                  </div>
                  <Progress value={prediction.overallProbability * 100} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Model confidence (spatial coverage)</span>
                    <span className="font-semibold text-foreground">
                      {Math.round(prediction.confidence * 100)}%
                    </span>
                  </div>
                  <Progress value={prediction.confidence * 100} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {prediction && (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="surface-panel p-5">
            <h2 className="text-lg font-semibold">Phase-wise delay prediction</h2>
            <p className="text-sm text-muted-foreground">
              Each acquisition stage under the RFCTLARR / National Highways Act timeline.
            </p>
            <div className="mt-4 space-y-3">
              {prediction.stages.map((s) => (
                <div key={s.key} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.statute}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        P50 {s.p50} · P90 {s.p90} mo
                      </span>
                      <span className="text-lg font-bold">{s.predictedMonths} mo</span>
                      <RiskPill risk={s.risk} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={s.probabilityOfDelay * 100} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {Math.round(s.probabilityOfDelay * 100)}% chance of slipping ·{" "}
                      {s.drivers.join(" · ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" fontSize={11} stroke="var(--muted-foreground)" />
                  <YAxis fontSize={11} stroke="var(--muted-foreground)" unit="m" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="months" radius={[4, 4, 0, 0]}>
                    {stageChart.map((s, i) => (
                      <Cell key={i} fill={RISK_FILL[s.risk as RiskLevel]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="surface-panel p-5">
            <h2 className="text-lg font-semibold">Nearby historical acquisitions</h2>
            <p className="text-sm text-muted-foreground">
              Weighted comparables driving this forecast.
            </p>
            <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {prediction.neighbours.map((n) => {
                const d = totalDelay(n);
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedId(n.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted ${
                      selectedId === n.id ? "border-primary bg-muted" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{n.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {MODE_LABEL[n.mode]} · {n.district}, {n.state} · {n.year} ·{" "}
                          {Math.round(n.distanceKm)} km away
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{d} mo</p>
                        <RiskPill risk={riskFromMonths(d)} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {selected && (
        <section className="surface-panel mt-6 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{selected.name}</h2>
              <p className="text-sm text-muted-foreground">
                {MODE_LABEL[selected.mode]} · {selected.district}, {selected.state} ·{" "}
                {selected.lengthKm} km · {selected.hectares} ha · {selected.parcels}{" "}
                parcels · {selected.litigationCases} litigation cases
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
              Close
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(selected.stageDelays).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border p-3">
                <p className="text-xs capitalize text-muted-foreground">{k}</p>
                <p className="text-2xl font-bold">{v}</p>
                <p className="text-xs text-muted-foreground">months slipped</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Planned {selected.plannedMonths} months → actual {selected.actualMonths}{" "}
            months ({totalDelay(selected)} months of acquisition delay).
          </p>
        </section>
      )}

      <section className="surface-panel mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Delay trend dashboard</h2>
            <p className="text-sm text-muted-foreground">
              {HISTORICAL_PROJECTS.length} historical corridors across {states.length}{" "}
              states.
            </p>
          </div>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="state" className="mt-5">
          <TabsList>
            <TabsTrigger value="state">State-wise</TabsTrigger>
            <TabsTrigger value="district">District-wise</TabsTrigger>
            <TabsTrigger value="year">Year trend</TabsTrigger>
          </TabsList>

          <TabsContent value="state" className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} margin={{ bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="state"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" unit="m" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="avgDelay" name="Avg delay (months)" radius={[4, 4, 0, 0]}>
                  {stateData.map((s, i) => (
                    <Cell key={i} fill={RISK_FILL[riskFromMonths(s.avgDelay * 1.6)]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="district" className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" fontSize={11} stroke="var(--muted-foreground)" unit="m" />
                <YAxis
                  type="category"
                  dataKey="district"
                  width={130}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="delay" name="Total delay (months)" radius={[0, 4, 4, 0]}>
                  {districtData.map((d, i) => (
                    <Cell key={i} fill={RISK_FILL[riskFromMonths(d.delay)]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="year" className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" unit="m" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgDelay"
                  name="Avg delay (months)"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </section>

      <footer className="mt-10 text-xs text-muted-foreground">
        MVP forecasts use a distance-weighted analogue model over a curated historical
        corridor dataset. Connect live revenue/court records to move from indicative to
        operational estimates.
      </footer>
    </main>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-semibold">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(v) => onChange(v[0] ?? value)}
      />
    </div>
  );
}

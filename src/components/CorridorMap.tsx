import { useEffect, useRef } from "react";
import type * as L from "leaflet";
import { HISTORICAL_PROJECTS, MODE_LABEL, totalDelay } from "@/lib/acquisition-data";
import type { LatLng } from "@/lib/prediction";
import { riskFromMonths } from "@/lib/prediction";

const RISK_COLOR: Record<string, string> = {
  low: "#2f9e5f",
  moderate: "#d9a520",
  high: "#e06a1b",
  severe: "#c1272d",
};

type Props = {
  waypoints: LatLng[];
  onAddWaypoint: (p: LatLng) => void;
  onSelectProject: (id: string) => void;
  highlightIds: string[];
};

export default function CorridorMap({
  waypoints,
  onAddWaypoint,
  onSelectProject,
  highlightIds,
}: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const addRef = useRef(onAddWaypoint);
  const selectRef = useRef(onSelectProject);
  addRef.current = onAddWaypoint;
  selectRef.current = onSelectProject;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = (await import("leaflet")) as unknown as typeof L;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !container.current || mapRef.current) return;
      leafletRef.current = leaflet;
      const map = leaflet.map(container.current, {
        center: [22.6, 79.2],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      leaflet
        .tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: "&copy; OpenStreetMap &copy; CARTO",
          maxZoom: 19,
        })
        .addTo(map);
      map.on("click", (e: L.LeafletMouseEvent) => {
        addRef.current({ lat: +e.latlng.lat.toFixed(4), lng: +e.latlng.lng.toFixed(4) });
      });
      mapRef.current = map;
      layerRef.current = leaflet.layerGroup().addTo(map);
      setTimeout(() => map.invalidateSize(), 200);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw historical markers + corridor whenever inputs change.
  useEffect(() => {
    const leaflet = leafletRef.current;
    const layer = layerRef.current;
    if (!leaflet || !layer) return;
    layer.clearLayers();

    for (const prj of HISTORICAL_PROJECTS) {
      const delay = totalDelay(prj);
      const risk = riskFromMonths(delay);
      const active = highlightIds.includes(prj.id);
      leaflet
        .circleMarker([prj.lat, prj.lng], {
          radius: active ? 10 : 6,
          color: RISK_COLOR[risk],
          weight: active ? 3 : 1.5,
          fillColor: RISK_COLOR[risk],
          fillOpacity: active ? 0.85 : 0.45,
        })
        .bindTooltip(
          `<strong>${prj.name}</strong><br/>${MODE_LABEL[prj.mode]} · ${prj.district}, ${prj.state}<br/>Total acquisition delay: ${delay} months`,
          { direction: "top" },
        )
        .on("click", (e: L.LeafletMouseEvent) => {
          e.originalEvent.stopPropagation();
          selectRef.current(prj.id);
        })
        .addTo(layer);
    }

    if (waypoints.length) {
      const latlngs = waypoints.map((w) => [w.lat, w.lng]) as [number, number][];
      if (waypoints.length > 1) {
        leaflet
          .polyline(latlngs, { color: "#1b3a6b", weight: 5, opacity: 0.9 })
          .addTo(layer);
        leaflet
          .polyline(latlngs, { color: "#1b3a6b", weight: 26, opacity: 0.12 })
          .addTo(layer);
      }
      waypoints.forEach((w, i) => {
        leaflet
          .marker([w.lat, w.lng], {
            icon: leaflet.divIcon({
              className: "",
              html: `<div class="corridor-pin">${i + 1}</div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            }),
          })
          .addTo(layer);
      });
    }
  }, [waypoints, highlightIds]);

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-border">
      <div ref={container} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-md bg-card/90 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
        Click the map to drop alignment points · click a dot to inspect a past acquisition
      </div>
    </div>
  );
}

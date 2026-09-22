import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { backendApi } from '../services/api';

const RISK_COLOR: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH:     '#f97316',
  MEDIUM:   '#eab308',
  LOW:      '#16a34a',
};

export const GISMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef   = useRef<L.Map | null>(null);
  const markerLayerRef   = useRef<L.FeatureGroup | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  /* Initialise map — StrictMode-safe: clear _leaflet_id before each init */
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // React 18 StrictMode mounts → unmounts → remounts. After map.remove()
    // Leaflet leaves _leaflet_id on the DOM node, causing the second mount to
    // throw silently. Deleting it lets Leaflet reinitialise cleanly.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (container as any)._leaflet_id;

    const map = L.map(container, {
      zoomControl:     true,
      scrollWheelZoom: false,
      preferCanvas:    true,
    }).setView([22.9734, 78.6569], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
    markerLayerRef.current = L.featureGroup().addTo(map);

    // Tell Leaflet the real rendered container size after the browser paints
    const t = setTimeout(() => map.invalidateSize(), 300);

    return () => {
      clearTimeout(t);
      map.remove();
      mapInstanceRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  /* Fetch project locations */
  useEffect(() => {
    backendApi.getProjectLocations().then(res => {
      if (Array.isArray(res)) setProjects(res);
      setLoading(false);
    });
  }, []);

  /* Add / refresh markers whenever projects change */
  useEffect(() => {
    const map   = mapInstanceRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer || projects.length === 0) return;

    layer.clearLayers();
    const bounds = L.latLngBounds([]);

    projects.slice(0, 500).forEach(project => {
      const lat = project.latitude;
      const lng = project.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number') return;

      const latlng: L.LatLngExpression = [lat, lng];
      bounds.extend(latlng as [number, number]);

      const color = RISK_COLOR[project.risk_category] ?? '#64748b';

      L.circleMarker(latlng, {
        radius:      8,
        color,
        weight:      2,
        fillColor:   color,
        fillOpacity: 0.55,
      })
        .bindPopup(
          `<div style="min-width:180px">
            <strong style="font-size:13px">${project.project_name}</strong><br/>
            <span style="color:#64748b;font-size:12px">${project.district}, ${project.state}</span><br/>
            <span style="color:${color};font-weight:600">${project.risk_category}</span>
            &nbsp;&middot;&nbsp;${project.predicted_delay_days} day delay
          </div>`,
        )
        .addTo(layer);
    });

    if (bounds.isValid()) map.fitBounds(bounds.pad(0.1));
  }, [projects]);

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">GIS map</div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Project locations and risk distribution</h1>
          <p className="text-sm leading-6 text-slate-600">
            The map uses the latitude and longitude already stored with each project record to show where delays and risks are concentrated.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Map panel — overflow:hidden must be on the outer wrapper, NOT on the div Leaflet mounts into */}
        <div
          className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden"
          style={{ height: '640px' }}
        >
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Map legend</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {Object.entries(RISK_COLOR).map(([label, color]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: color }} />
                {label.charAt(0) + label.slice(1).toLowerCase()}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
            {loading
              ? 'Loading project data…'
              : `Showing ${Math.min(projects.length, 500).toLocaleString()} of ${projects.length.toLocaleString()} projects on the map.`}
          </div>

          <div className="mt-6 space-y-3 max-h-[340px] overflow-auto pr-1">
            {projects.slice(0, 12).map(project => (
              <div key={project.project_id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <div className="font-medium text-slate-900 truncate text-sm">{project.project_name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{project.district}, {project.state}</div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: RISK_COLOR[project.risk_category] ?? '#64748b' }}
                  />
                  <span className="text-slate-600">{project.risk_category} · {project.predicted_delay_days} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
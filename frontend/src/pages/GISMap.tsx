import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { backendApi } from '../services/api';

export const GISMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    backendApi.getProjectLocations().then(res => {
      if (Array.isArray(res)) setProjects(res);
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([22.9734, 78.6569], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || projects.length === 0) return;

    const map = leafletMapRef.current;
    const bounds = L.latLngBounds([]);

    projects.slice(0, 250).forEach(project => {
      if (typeof project.latitude !== 'number' || typeof project.longitude !== 'number') return;
      const coordinates: L.LatLngExpression = [project.latitude, project.longitude];
      bounds.extend(coordinates as [number, number]);

      const severity = project.risk_category === 'CRITICAL' ? '#dc2626' : project.risk_category === 'HIGH' ? '#f97316' : project.risk_category === 'MEDIUM' ? '#eab308' : '#16a34a';

      L.circleMarker(coordinates, {
        radius: 7,
        color: severity,
        weight: 2,
        fillColor: severity,
        fillOpacity: 0.35,
      })
        .bindPopup(
          `<strong>${project.project_name}</strong><br/>${project.district}, ${project.state}<br/>Risk: ${project.risk_category}<br/>Delay: ${project.predicted_delay_days} days`,
        )
        .addTo(map);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.15));
    }
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
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div ref={mapRef} className="h-[600px] w-full rounded-[20px] overflow-hidden" />
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Map legend</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-red-600" /> Critical</div>
            <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-orange-500" /> High</div>
            <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-amber-500" /> Medium</div>
            <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-green-600" /> Low</div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
            The map layer is driven by live project coordinates from the backend, so geographic position and risk can be reviewed together.
          </div>

          <div className="mt-6 space-y-3 max-h-[320px] overflow-auto pr-1">
            {projects.slice(0, 12).map(project => (
              <div key={project.project_id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <div className="font-medium text-slate-900 truncate">{project.project_name}</div>
                <div className="text-xs text-slate-500">{project.district}, {project.state}</div>
                <div className="mt-1 text-xs text-slate-600">{project.risk_category} · {project.predicted_delay_days} days</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
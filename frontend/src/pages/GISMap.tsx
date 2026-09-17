import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { Layers, MapPin, Eye, ExternalLink, ShieldAlert } from 'lucide-react';
import { ALL_PROJECTS } from '../data/projects';
import { calculateRiskPrediction } from '../data/intelligence';
import { Project } from '../data/types';

export const GISMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedProject, setSelectedProject] = useState<Project | null>(ALL_PROJECTS[0]);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterAgency, setFilterAgency] = useState<string>('ALL');

  const projectsWithRisk = React.useMemo(() => {
    return ALL_PROJECTS.map(p => ({
      ...p,
      risk: calculateRiskPrediction(p)
    }));
  }, []);

  const agencies = React.useMemo(() => {
    return ['ALL', ...Array.from(new Set(ALL_PROJECTS.map(p => p.implementing_agency)))];
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = projectsWithRisk.filter(p => {
      const matchRisk = filterRisk === 'ALL' || p.risk.riskCategory === filterRisk;
      const matchAgency = filterAgency === 'ALL' || p.implementing_agency === filterAgency;
      return matchRisk && matchAgency;
    });

    filtered.forEach(p => {
      const color =
        p.risk.riskCategory === 'CRITICAL' ? '#ef4444' :
        p.risk.riskCategory === 'HIGH' ? '#f97316' :
        p.risk.riskCategory === 'MEDIUM' ? '#eab308' :
        '#10b981';

      const circle = L.circleMarker([p.latitude, p.longitude], {
        radius: p.risk.riskCategory === 'CRITICAL' ? 8 : 6,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      });

      const popupContent = `
        <div style="font-family: inherit; min-width: 180px; padding: 4px;">
          <div style="font-size: 11px; font-weight: bold; color: ${color}; text-transform: uppercase;">
            ${p.risk.riskCategory} RISK (+${p.risk.predictedDelayDays}d)
          </div>
          <div style="font-size: 13px; font-weight: bold; margin: 3px 0; color: #1e293b;">
            ${p.project_name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            ${p.district}, ${p.state}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #3b82f6;">
            Sanction: ₹${Math.round(p.sanction_amount / 100)} Cr
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.on('click', () => {
        setSelectedProject(p);
      });

      circle.addTo(markersLayerRef.current!);
    });
  }, [projectsWithRisk, filterRisk, filterAgency]);

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
      {/* Map Header & Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              BHUVAN & OPENSTREETMAP GIS
            </span>
            <span className="text-xs text-gray-500 font-medium">Spatial Land Acquisition Corridors</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900 mt-0.5">National Infrastructure GIS Risk Explorer</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Risk Filter */}
          <select
            value={filterRisk}
            onChange={e => setFilterRisk(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk Only</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk Only</option>
            <option value="LOW">Low Risk Only</option>
          </select>

          {/* Agency Filter */}
          <select
            value={filterAgency}
            onChange={e => setFilterAgency(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
          >
            {agencies.map(a => (
              <option key={a} value={a}>{a === 'ALL' ? 'All Agencies' : a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map & Selected Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
          <div ref={mapContainerRef} className="w-full h-full" />
          {/* Map Legend Floating */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-md text-xs space-y-1.5">
            <div className="font-bold text-gray-800 text-[11px] mb-1">Delay Risk Levels</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span>Critical Risk (&gt;180d delay)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span>High Risk (90-180d)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Medium Risk (30-90d)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Low Risk (&lt;30d)</span>
            </div>
          </div>
        </div>

        {/* Selected Project Info Card */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm overflow-y-auto flex flex-col justify-between">
          {selectedProject ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-gray-400 font-bold">{selectedProject.project_id}</span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{selectedProject.project_name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedProject.village}, {selectedProject.district}, {selectedProject.state}
                </p>
              </div>

              {/* Status Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Land Required</div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">{selectedProject.land_required_ha} Ha</div>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Budget</div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">₹{Math.round(selectedProject.sanction_amount / 100)} Cr</div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">Acquisition Progress</span>
                  <span className="font-bold text-gray-900">{selectedProject.acquisition_progress_pct}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${selectedProject.acquisition_progress_pct}%` }}></div>
                </div>
              </div>

              {/* Delay & Risk */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Predicted Schedule Slippage</span>
                </div>
                <div className="text-sm font-extrabold text-amber-700">
                  +{calculateRiskPrediction(selectedProject).predictedDelayDays} Days
                </div>
                <div className="text-[11px] text-amber-800">
                  Bottleneck: {selectedProject.administrative_bottleneck || 'Environmental & Forest Clearance'}
                </div>
              </div>

              {/* Legal & Ownership */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Disputed Parcels:</span>
                  <strong className="text-gray-900">{selectedProject.disputed_land_parcels}</strong>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Active Court Cases:</span>
                  <strong className="text-gray-900">{selectedProject.active_case_count}</strong>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Pending Beneficiaries:</span>
                  <strong className="text-gray-900">{selectedProject.beneficiaries_pending}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              Click any project marker on the map to inspect
            </div>
          )}

          {selectedProject && (
            <Link
              to={`/projects/${selectedProject.project_id}`}
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Full Project Dossier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

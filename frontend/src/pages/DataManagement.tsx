import React, { useState } from 'react';
import { Database, UploadCloud, CheckCircle2, RefreshCw, Server, FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import { ALL_PROJECTS } from '../data/projects';

export const DataManagement: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('2026-09-16 11:30:15');

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date().toISOString().replace('T', ' ').substring(0, 19));
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              NATIONAL INTEGRATION BUS
            </span>
            <span className="text-xs text-gray-500 font-medium">BhoomiRashi, PFMS & State RoR Ingestion</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Data Pipeline & Ingestion Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage automated sync feeds from the Ministry of Road Transport & Highways and manual corridor data imports.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Feeds...' : 'Trigger National Sync'}</span>
        </button>
      </div>

      {/* Integration Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">BhoomiRashi Ingestion</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">2,540 Records</div>
          <div className="text-xs text-gray-500 mt-1">Section 3a/3A/3D Gazettes synced</div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
            Endpoint: <code className="font-mono text-gray-700">bhoomirashi.gov.in/api/v2</code>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">PFMS Disbursement Feed</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">₹18,420 Cr</div>
          <div className="text-xs text-gray-500 mt-1">Award compensation verified</div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
            Last Batch: <span className="font-semibold text-gray-700">{lastSync}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Bhuvan Spatial Sync</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">100% Synced</div>
          <div className="text-xs text-gray-500 mt-1">Digital village boundary maps active</div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
            Cadastral Coverage: <span className="font-semibold text-gray-700">ISRO / NRSC</span>
          </div>
        </div>
      </div>

      {/* Manual Upload Area */}
      <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-gray-900">Import Corridor Alignment or Gazette Dataset</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Upload CSV (`bhoomirashi_projects_clean.csv`), GeoJSON alignment traces, or Section 3D notification tables to evaluate delay risk.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm">
            <span>Browse CSV File</span>
            <input type="file" accept=".csv,.json,.geojson" className="hidden" onChange={(e) => {
              if (e.target.files?.[0]) alert(`File "${e.target.files[0].name}" loaded successfully into memory!`);
            }} />
          </label>
        </div>
      </div>
    </div>
  );
};

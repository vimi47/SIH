import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, CheckCircle2, Filter, Search, UserCheck, ArrowRight, Database } from 'lucide-react';
import { ALL_PROJECTS } from '../data/projects';
import { generateEarlyWarnings } from '../data/intelligence';
import { EarlyWarning } from '../data/types';
import { backendApi } from '../services/api';

export const EarlyWarnings: React.FC = () => {
  const [warnings, setWarnings] = useState<EarlyWarning[]>(() => generateEarlyWarnings(ALL_PROJECTS));
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    backendApi.getEarlyWarnings().then(res => {
      if (res && Array.isArray(res) && res.length > 0) {
        setWarnings(res);
        setIsBackendConnected(true);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    return warnings.filter(w => {
      const matchSev = selectedSeverity === 'ALL' || w.severity === selectedSeverity;
      const matchSearch =
        w.projectName.toLowerCase().includes(search.toLowerCase()) ||
        w.trigger.toLowerCase().includes(search.toLowerCase()) ||
        w.district.toLowerCase().includes(search.toLowerCase());
      return matchSev && matchSearch;
    });
  }, [warnings, selectedSeverity, search]);

  const handleAcknowledge = (id: string) => {
    setWarnings(prev => prev.map(w => w.id === id ? { ...w, status: w.status === 'ACTIVE' ? 'ACKNOWLEDGED' : 'RESOLVED' } : w));
  };

  const criticalCount = warnings.filter(w => w.severity === 'CRITICAL').length;
  const highCount = warnings.filter(w => w.severity === 'HIGH').length;
  const mediumCount = warnings.filter(w => w.severity === 'MEDIUM').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
              REAL-TIME ALERT FEED
            </span>
            <span className="text-xs text-gray-500 font-medium">Automated Delay Threshold Monitors</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Impending Delay & Breach Early Warnings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Automated alerts triggered when litigation age, compensation backlogs, or approval stalls cross critical limits.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold">
            {criticalCount} Critical
          </div>
          <div className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg font-bold">
            {highCount} High
          </div>
          <div className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold">
            {mediumCount} Medium
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(s => (
            <button
              key={s}
              onClick={() => setSelectedSeverity(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedSeverity === s
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'ALL' ? `All Alerts (${warnings.length})` : s}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter warnings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Warnings Stream */}
      <div className="space-y-3">
        {filtered.map(w => (
          <div
            key={w.id}
            className={`bg-white p-5 rounded-xl border shadow-sm transition-all ${
              w.severity === 'CRITICAL' ? 'border-l-4 border-l-red-500 border-gray-200' :
              w.severity === 'HIGH' ? 'border-l-4 border-l-orange-500 border-gray-200' :
              'border-l-4 border-l-amber-500 border-gray-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  w.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  w.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {w.severity} SEVERITY
                </span>
                <span className="text-[11px] font-mono text-gray-400 font-semibold">{w.id}</span>
                <span className="text-[11px] text-gray-500">· Detected: {w.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  w.status === 'ACTIVE' ? 'bg-red-50 text-red-600 border border-red-200' :
                  w.status === 'ACKNOWLEDGED' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                  'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {w.status}
                </span>
                <button
                  onClick={() => handleAcknowledge(w.id)}
                  className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded transition-colors"
                >
                  {w.status === 'ACTIVE' ? 'Acknowledge' : 'Mark Resolved'}
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-900 mb-1">
              <Link to={`/projects/${w.projectId}`} className="hover:text-blue-600 hover:underline">
                {w.projectName}
              </Link>
            </h3>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mt-2 space-y-2 text-xs">
              <div>
                <span className="font-semibold text-gray-700">Trigger Condition: </span>
                <span className="text-gray-900">{w.trigger}</span>
              </div>
              <div>
                <span className="font-semibold text-blue-700">Prescribed Intervention: </span>
                <span className="text-gray-900 font-medium">{w.action}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Assigned Stakeholder: <strong className="text-gray-800">{w.responsibleStakeholder || 'District Collectorate Desk'}</strong></span>
              </div>
              <Link
                to={`/projects/${w.projectId}`}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                Inspect Corridor <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

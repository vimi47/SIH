import React, { useState, useMemo } from 'react';
import { BarChart3, Search, AlertTriangle, Building2, ChevronRight } from 'lucide-react';
import { getDistrictAnalytics } from '../data/analytics';

export const DistrictAnalytics: React.FC = () => {
  const [search, setSearch] = useState('');
  const data = getDistrictAnalytics();

  const filtered = useMemo(() => {
    return data.filter(d =>
      d.district.toLowerCase().includes(search.toLowerCase()) ||
      d.state.toLowerCase().includes(search.toLowerCase()) ||
      d.topBottleneck.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              LOCAL JURISDICTION INTEL
            </span>
            <span className="text-xs text-gray-500 font-medium">District Collectorate Bottleneck Diagnosis</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">District Hotspots & Bottleneck Analysis</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Identify specific districts where title disputes, environmental approvals, or compensation award strikes concentrate.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search district or bottleneck..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* District Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, 15).map(d => (
          <div key={`${d.district}-${d.state}`} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-900">{d.district}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  d.avgRiskScore >= 70 ? 'bg-red-100 text-red-700' :
                  d.avgRiskScore >= 50 ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  Risk Score: {d.avgRiskScore}/100
                </span>
              </div>
              <div className="text-[11px] text-gray-500 mb-3">{d.state} · {d.projectsCount} Corridors Active</div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Primary Bottleneck:</span>
                  <span className="font-bold text-red-600 truncate max-w-[150px]">{d.topBottleneck}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Avg Schedule Delay:</span>
                  <span className="font-semibold text-amber-600">+{d.avgDelayDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Disputed Parcels:</span>
                  <span className="font-semibold text-gray-900">{d.totalDisputedParcels}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] flex items-center justify-between text-blue-600 font-semibold">
              <span>Inspect District Projects</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

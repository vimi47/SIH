import React, { useState, useEffect } from 'react';
import { Building2, TrendingDown, ArrowUpDown, ChevronRight, Database } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getStateAnalytics } from '../data/analytics';
import { backendApi } from '../services/api';

export const StateAnalytics: React.FC = () => {
  const [data, setData] = useState<any[]>(() => getStateAnalytics());
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    backendApi.getStateAnalytics().then(res => {
      if (res && Array.isArray(res) && res.length > 0) {
        setData(res);
        setIsBackendConnected(true);
      }
    });
  }, []);

  const chartData = data.slice(0, 10).map(s => ({
    state: s.state.length > 12 ? s.state.substring(0, 10) + '..' : s.state,
    avgDelay: s.avgDelayDays,
    critical: s.criticalRiskCount,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              REGIONAL INTELLIGENCE
            </span>
            <span className="text-xs text-gray-500 font-medium">State-Level Performance Benchmark</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">State Land Acquisition Delay Comparisons</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Comparative performance, critical project density, and average acquisition schedule slippage across 20+ states.
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm mb-3">Top States by Average Acquisition Delay (Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="state" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="avgDelay" fill="#3b82f6" name="Avg Delay (Days)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 font-bold text-sm text-gray-900">
          State Ranking & Performance Ledger
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">State / UT</th>
                <th className="px-4 py-3">Total Projects</th>
                <th className="px-4 py-3">Critical Risk Corridors</th>
                <th className="px-4 py-3">Average Delay</th>
                <th className="px-4 py-3">Total Land Required</th>
                <th className="px-4 py-3">Total Sanctioned Budget</th>
                <th className="px-4 py-3">Avg Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(s => (
                <tr key={s.state} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-900">{s.state}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{s.totalProjects}</td>
                  <td className="px-4 py-3 font-bold text-red-600">{s.criticalRiskCount}</td>
                  <td className="px-4 py-3 font-semibold text-amber-600">+{s.avgDelayDays} Days</td>
                  <td className="px-4 py-3 text-gray-700">{s.totalLandHa.toLocaleString()} Ha</td>
                  <td className="px-4 py-3 font-medium text-gray-900">₹{s.totalSanctionCr.toLocaleString()} Cr</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${s.avgProgressPct}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">{s.avgProgressPct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

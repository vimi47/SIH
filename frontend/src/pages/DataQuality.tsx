import React from 'react';
import { CheckCircle2, AlertTriangle, FileCheck, ShieldCheck } from 'lucide-react';
import { DATA_QUALITY_STATS } from '../data/reports';

export const DataQuality: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              AUDIT & INTEGRITY
            </span>
            <span className="text-xs text-gray-500 font-medium">BhoomiRashi Ingestion Quality Health</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Data Completeness & Gazette Quality Audit</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Validation of statutory notification timestamps, Section 3D awards, and parcel geometry completeness.
          </p>
        </div>

        <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Overall Health: {DATA_QUALITY_STATS.overallCompletenessPct}% Valid</span>
        </div>
      </div>

      {/* Field Health Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 font-bold text-sm text-gray-900">
          Field Completeness & Validation Checks
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Statutory Field</th>
                <th className="px-4 py-3">Completeness</th>
                <th className="px-4 py-3">Missing Records</th>
                <th className="px-4 py-3">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DATA_QUALITY_STATS.fieldHealth.map((f, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">{f.field}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 w-32">
                      <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${f.completenessPct}%` }} />
                      </div>
                      <span className="font-bold text-gray-800">{f.completenessPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{f.missingCount} records</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      f.status === 'OPTIMAL' ? 'bg-emerald-100 text-emerald-800' :
                      f.status === 'ACCEPTABLE' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {f.status}
                    </span>
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

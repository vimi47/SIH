import React from 'react';
import { History, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { AUDIT_LOGS } from '../data/reports';

export const AuditLogs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
              SECURITY & COMPLIANCE
            </span>
            <span className="text-xs text-gray-500 font-medium">Immutable Activity Trail</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">System Audit & Traceability Logs</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cryptographically timestamped record of model runs, data ingestion batches, and stakeholder intervention decisions.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Log ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User / System Agent</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {AUDIT_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{log.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-700">{log.timestamp}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{log.user}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{log.target}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {log.status}
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

import React, { useEffect, useState } from 'react';
import { backendApi } from '../services/api';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    backendApi.getAuditLogs(200).then(res => {
      if (res?.items) setLogs(res.items);
    });
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Audit trail</div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Action log and access history</h1>
          <p className="text-sm leading-6 text-slate-600">
            Review login, simulation, and download events in one place for traceability.
          </p>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map(log => (
                <tr key={`${log.timestamp}-${log.action}`}>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{log.actorName}</div>
                    <div className="text-xs text-slate-500">{log.actorRole}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{log.action}</td>
                  <td className="px-4 py-3 text-slate-700">{log.entityType || '—'} {log.entityId ? `· ${log.entityId}` : ''}</td>
                  <td className="px-4 py-3 text-slate-600">{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
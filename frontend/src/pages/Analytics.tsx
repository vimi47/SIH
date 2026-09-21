import React, { useEffect, useState } from 'react';
import { backendApi } from '../services/api';

export const Analytics: React.FC = () => {
  const [stateAnalytics, setStateAnalytics] = useState<any[]>([]);
  const [districtAnalytics, setDistrictAnalytics] = useState<any[]>([]);

  useEffect(() => {
    backendApi.getStateAnalytics().then(res => {
      if (Array.isArray(res)) setStateAnalytics(res.slice(0, 6));
    });
    backendApi.getDistrictAnalytics().then(res => {
      if (Array.isArray(res)) setDistrictAnalytics(res.slice(0, 6));
    });
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Analytics</div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">State and district comparison</h1>
          <p className="text-sm leading-6 text-slate-600">
            Compare states and districts to see where delays, risk, and bottlenecks are concentrated.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">State summary</h2>
            <p className="text-xs text-slate-500">Top six states by risk concentration</p>
          </div>
          <div className="divide-y divide-slate-100">
            {stateAnalytics.map(state => (
              <div key={state.state} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-900">{state.state}</div>
                    <div className="text-xs text-slate-500">{state.totalProjects} projects · {state.avgProgressPct}% average progress</div>
                  </div>
                  <div className="text-right text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">{state.criticalRiskCount} critical</div>
                    <div>{state.avgDelayDays} days delay</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">District watchlist</h2>
            <p className="text-xs text-slate-500">Districts with higher average risk scores</p>
          </div>
          <div className="divide-y divide-slate-100">
            {districtAnalytics.map(district => (
              <div key={`${district.district}-${district.state}`} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-900">{district.district}</div>
                    <div className="text-xs text-slate-500">{district.state} · {district.projectsCount} projects</div>
                  </div>
                  <div className="text-right text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">Risk {district.avgRiskScore}</div>
                    <div>{district.topBottleneck}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
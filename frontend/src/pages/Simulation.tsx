import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { backendApi } from '../services/api';

export const Simulation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('project') || '';
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [legalCases, setLegalCases] = useState(2);
  const [compensationProgress, setCompensationProgress] = useState(45);
  const [approvalDays, setApprovalDays] = useState(60);
  const [rrProgress, setRrProgress] = useState(40);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    backendApi.getProjectLocations().then(res => {
      if (Array.isArray(res)) {
        setProjects(res);
        if (!projectId && res[0]?.project_id) {
          setProjectId(res[0].project_id);
        }
      }
    });
  }, []);

  const selectedProject = useMemo(() => projects.find(project => project.project_id === projectId), [projects, projectId]);

  const runSimulation = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const response = await backendApi.simulateWhatIf({
        project_id: projectId,
        legal_cases: legalCases,
        compensation_progress: compensationProgress,
        approval_days: approvalDays,
        rr_progress: rrProgress,
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">What-if analysis</div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Run a delay-reduction simulation</h1>
          <p className="text-sm leading-6 text-slate-600">
            Change legal, compensation, approval, and rehabilitation progress to see how the predicted delay changes for a selected project.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Project</label>
            <select
              value={projectId}
              onChange={event => setProjectId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              {projects.map(project => (
                <option key={project.project_id} value={project.project_id}>{project.project_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Legal cases</label>
            <input type="range" min="0" max="10" value={legalCases} onChange={event => setLegalCases(Number(event.target.value))} className="mt-2 w-full" />
            <div className="text-xs text-slate-500">{legalCases} cases</div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Compensation progress</label>
            <input type="range" min="0" max="100" value={compensationProgress} onChange={event => setCompensationProgress(Number(event.target.value))} className="mt-2 w-full" />
            <div className="text-xs text-slate-500">{compensationProgress}%</div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Approval days</label>
            <input type="range" min="10" max="180" value={approvalDays} onChange={event => setApprovalDays(Number(event.target.value))} className="mt-2 w-full" />
            <div className="text-xs text-slate-500">{approvalDays} days</div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">RR progress</label>
            <input type="range" min="0" max="100" value={rrProgress} onChange={event => setRrProgress(Number(event.target.value))} className="mt-2 w-full" />
            <div className="text-xs text-slate-500">{rrProgress}%</div>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading || !projectId}
            className="rounded-full bg-[#0b4ea2] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#083a7a] disabled:opacity-70"
          >
            {loading ? 'Running...' : 'Run simulation'}
          </button>

          {selectedProject && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
              Selected project: <span className="font-semibold text-slate-900">{selectedProject.project_name}</span><br />
              Current delay: <span className="font-semibold text-slate-900">{selectedProject.predicted_delay_days} days</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Baseline</div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">{result?.baseline?.predicted_delay_days ?? selectedProject?.predicted_delay_days ?? '—'} days</div>
              <div className="mt-2 text-sm text-slate-500">{result?.baseline?.risk_category ?? selectedProject?.risk_category ?? '—'}</div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Simulated</div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">{result?.simulated?.predicted_delay_days ?? '—'} days</div>
              <div className="mt-2 text-sm text-slate-500">{result?.simulated?.risk_category ?? '—'}</div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Impact summary</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">Days saved: <span className="font-semibold text-slate-900">{result?.days_saved ?? '—'}</span></div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">Score change: <span className="font-semibold text-slate-900">{result?.score_diff ?? '—'}</span></div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">Priority after change: <span className="font-semibold text-slate-900">{result?.simulated?.risk_score ?? '—'}</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
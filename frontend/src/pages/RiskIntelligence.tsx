import React, { useState, useMemo, useEffect } from 'react';
import { ShieldAlert, Sliders, Play, RefreshCw, CheckCircle, TrendingDown, ArrowRight, Cpu, Check } from 'lucide-react';
import { ALL_PROJECTS } from '../data/projects';
import { calculateRiskPrediction } from '../data/intelligence';
import { Project } from '../data/types';
import { backendApi } from '../services/api';

export const RiskIntelligence: React.FC = () => {
  const [projectList, setProjectList] = useState<any[]>(ALL_PROJECTS.slice(0, 30));
  const [selectedProjectId, setSelectedProjectId] = useState<string>(ALL_PROJECTS[0].project_id);
  const [backendSim, setBackendSim] = useState<any | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Fetch initial project choices from backend if available
  useEffect(() => {
    backendApi.getProjects({ page: 1, page_size: 40 }).then(res => {
      if (res && res.items && res.items.length > 0) {
        setProjectList(res.items);
        setIsBackendConnected(true);
      }
    });
  }, []);

  const baseProject = useMemo(() => {
    return projectList.find(p => p.project_id === selectedProjectId) || ALL_PROJECTS[0];
  }, [projectList, selectedProjectId]);

  // Simulation Overrides
  const [legalCases, setLegalCases] = useState<number>(baseProject.active_case_count ?? 2);
  const [compProgress, setCompProgress] = useState<number>(baseProject.compensation_progress_pct ?? 50);
  const [approvalDays, setApprovalDays] = useState<number>(baseProject.approval_pending_days ?? 45);
  const [rrProgress, setRrProgress] = useState<number>(baseProject.rr_progress_pct ?? 50);

  // Sync sliders when project changes
  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    const p = projectList.find(x => x.project_id === projId) || ALL_PROJECTS[0];
    setLegalCases(p.active_case_count ?? 2);
    setCompProgress(p.compensation_progress_pct ?? 50);
    setApprovalDays(p.approval_pending_days ?? 45);
    setRrProgress(p.rr_progress_pct ?? 50);
  };

  // Trigger real backend ML simulation on slider or project changes
  useEffect(() => {
    setIsSimulating(true);
    const timer = setTimeout(() => {
      backendApi.simulateWhatIf({
        project_id: selectedProjectId,
        legal_cases: legalCases,
        compensation_progress: compProgress,
        approval_days: approvalDays,
        rr_progress: rrProgress,
      }).then(res => {
        if (res && res.baseline && res.simulated) {
          setBackendSim(res);
          setIsBackendConnected(true);
        }
        setIsSimulating(false);
      }).catch(() => {
        setIsSimulating(false);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedProjectId, legalCases, compProgress, approvalDays, rrProgress]);

  const baselineRisk = useMemo(() => {
    return calculateRiskPrediction(baseProject);
  }, [baseProject]);

  const simulatedProject: Project = useMemo(() => {
    return {
      ...baseProject,
      active_case_count: legalCases,
      unresolved_objection_count: Math.round(legalCases * 3),
      compensation_progress_pct: compProgress,
      approval_pending_days: approvalDays,
      rr_progress_pct: rrProgress
    };
  }, [baseProject, legalCases, compProgress, approvalDays, rrProgress]);

  const localSimulatedRisk = useMemo(() => {
    return calculateRiskPrediction(simulatedProject);
  }, [simulatedProject]);

  // Use backend ML predictions when available, with graceful local fallback
  const finalBaseline = {
    riskScore: backendSim ? backendSim.baseline.risk_score : baselineRisk.riskScore,
    predictedDelayDays: backendSim ? Math.round(backendSim.baseline.predicted_delay_days) : baselineRisk.predictedDelayDays,
    predictedDelayMonths: backendSim ? backendSim.baseline.predicted_delay_months : baselineRisk.predictedDelayMonths,
    riskCategory: backendSim ? backendSim.baseline.risk_category : baselineRisk.riskCategory,
  };

  const finalSimulated = {
    riskScore: backendSim ? backendSim.simulated.risk_score : localSimulatedRisk.riskScore,
    predictedDelayDays: backendSim ? Math.round(backendSim.simulated.predicted_delay_days) : localSimulatedRisk.predictedDelayDays,
    predictedDelayMonths: backendSim ? backendSim.simulated.predicted_delay_months : localSimulatedRisk.predictedDelayMonths,
    riskCategory: backendSim ? backendSim.simulated.risk_category : localSimulatedRisk.riskCategory,
    estimatedCompletionDate: localSimulatedRisk.estimatedCompletionDate,
  };

  const daysSaved = backendSim
    ? Math.round(backendSim.days_saved)
    : (baselineRisk.predictedDelayDays - localSimulatedRisk.predictedDelayDays);
  const scoreDiff = backendSim
    ? Math.round(backendSim.score_diff)
    : (baselineRisk.riskScore - localSimulatedRisk.riskScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              PRESCRIPTIVE AI ENGINE
            </span>
            <span className="text-xs text-gray-500 font-medium">Scenario Modeling & Counter-Factual Simulation</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">What-If Delay Mitigation Simulator</h1>
          <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
            Simulate administrative interventions, out-of-court dispute settlements, and fast-track clearance accelerations to quantify project timeline savings.
          </p>
        </div>

        <div className="w-full md:w-80">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Corridor Alignment:
            </label>
            {isBackendConnected && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-600" />
                {isSimulating ? 'Computing ML...' : 'Python ML Active'}
              </span>
            )}
          </div>
          <select
            value={selectedProjectId}
            onChange={e => handleProjectChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
          >
            {projectList.map(p => (
              <option key={p.project_id} value={p.project_id}>
                {p.project_name.length > 50 ? p.project_name.substring(0, 48) + '...' : p.project_name} ({p.project_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm">Adjustment Parameters</h3>
            </div>
            <button
              onClick={() => handleProjectChange(selectedProjectId)}
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Slider 1: Legal Disputes */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-gray-800">Active High Court / Tribunal Legal Objections</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{legalCases} cases</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={legalCases}
              onChange={e => setLegalCases(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0 (All Settled)</span>
              <span>15 (Severe Litigation Block)</span>
            </div>
          </div>

          {/* Slider 2: Compensation Disbursal */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-gray-800">Direct PFMS Compensation Disbursal Progress</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{compProgress}% Paid</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={compProgress}
              onChange={e => setCompProgress(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>10% (Major Backlog)</span>
              <span>100% (Full Disbursal Complete)</span>
            </div>
          </div>

          {/* Slider 3: Approval Days */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-gray-800">Inter-Ministerial Statutory Approval Latency</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{approvalDays} days</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              value={approvalDays}
              onChange={e => setApprovalDays(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0 days (Fast-Track Single Window)</span>
              <span>180 days (Inter-Departmental Stall)</span>
            </div>
          </div>

          {/* Slider 4: R&R Resettlement */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-gray-800">Rehabilitation & Resettlement (R&R) Execution</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{rrProgress}% Complete</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={rrProgress}
              onChange={e => setRrProgress(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>10% (High Resistance)</span>
              <span>100% (Complete Resettlement Handover)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Impact Result Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl border border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Simulated Forecast Comparison
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {backendSim ? 'ML Model v1.0.0' : 'Local Heuristic'}
              </span>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Baseline Status</div>
                <div className="text-2xl font-bold text-slate-200 mt-1">{finalBaseline.riskScore}/100</div>
                <div className="text-[11px] text-amber-400 mt-0.5 font-medium">+{finalBaseline.predictedDelayDays} days</div>
                <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase">{finalBaseline.riskCategory} RISK</div>
              </div>

              <div className="p-3 bg-blue-950/40 rounded-lg border border-blue-800/50">
                <div className="text-[10px] text-blue-300 uppercase font-semibold">Simulated Outcome</div>
                <div className="text-2xl font-bold text-blue-400 mt-1">{finalSimulated.riskScore}/100</div>
                <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">+{finalSimulated.predictedDelayDays} days</div>
                <div className="mt-2 text-[10px] font-bold text-emerald-400 uppercase">{finalSimulated.riskCategory} RISK</div>
              </div>
            </div>

            {/* Impact Highlights */}
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>Intervention Impact Assessment</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {daysSaved > 0 ? (
                  <>
                    By enacting these policy adjustments, you can recover approximately{' '}
                    <strong className="text-emerald-400 font-bold">{daysSaved} Days (~{Math.round(daysSaved / 30)} Months)</strong> of
                    critical corridor delay and lower risk by <strong>{scoreDiff} points</strong>.
                  </>
                ) : daysSaved < 0 ? (
                  <>
                    Worsening these conditions introduces an additional{' '}
                    <strong className="text-red-400 font-bold">{Math.abs(daysSaved)} Days</strong> of acquisition delay.
                  </>
                ) : (
                  <>Parameters align with current baseline metrics.</>
                )}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span>New Target Handover:</span>
              <span className="font-bold text-white">{finalSimulated.estimatedCompletionDate}</span>
            </div>
          </div>

          {/* Quick Intervention Blueprint */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-xs">
            <h4 className="font-bold text-gray-900 mb-2">Recommended Standard Operating Procedures</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Deploy Special Land Acquisition Officer (SLAO) for direct negotiation on high-value parcels.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Trigger fast-track single-window review for pending forest / wildlife clearance certificates.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Establish automated PFMS batch disbursement to eliminate bank validation latency.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

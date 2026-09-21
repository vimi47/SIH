import React, { useEffect, useState } from 'react';
import { backendApi } from '../services/api';
import { Download, FileDown, ShieldCheck, Database } from 'lucide-react';

export const Reports: React.FC = () => {
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [provenance, setProvenance] = useState<any>(null);

  useEffect(() => {
    backendApi.getDataQuality().then(setDataQuality);
    backendApi.getModelMetrics().then(setModelMetrics);
    backendApi.getProvenance().then(setProvenance);
  }, []);

  const downloadFile = async (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const exportProjects = async () => {
    const blob = await backendApi.downloadProjectsCsv();
    await downloadFile(blob, 'bhoomiraksha_projects.csv');
  };

  const exportAudit = async () => {
    const blob = await backendApi.downloadAuditCsv();
    await downloadFile(blob, 'bhoomiraksha_audit.csv');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Reports</div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Data quality and model status</h1>
          <p className="text-sm leading-6 text-slate-600">
            Review data completeness and model output quality before acting on a project record.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <button onClick={exportProjects} className="rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-200">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-700"><Download className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold text-slate-900">Download project register</div>
              <div className="text-sm text-slate-500">CSV export of all project records</div>
            </div>
          </div>
        </button>

        <button onClick={exportAudit} className="rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-200">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><FileDown className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold text-slate-900">Download audit log</div>
              <div className="text-sm text-slate-500">CSV export of user actions</div>
            </div>
          </div>
        </button>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold text-slate-900">Model quality</div>
              <div className="text-sm text-slate-500">Hold-out metrics reported separately from live records</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Data quality</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div>Overall completeness: <span className="font-semibold text-slate-900">{dataQuality?.overallCompletenessPct ?? '—'}%</span></div>
            <div>Total records checked: <span className="font-semibold text-slate-900">{dataQuality?.totalRecordsChecked ?? '—'}</span></div>
            <div>Validated records: <span className="font-semibold text-slate-900">{dataQuality?.validRecordsCount ?? '—'}</span></div>
            <div>Anomalies detected: <span className="font-semibold text-slate-900">{dataQuality?.recordsWithAnomalies ?? '—'}</span></div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Model metrics</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div>MAE: <span className="font-semibold text-slate-900">{modelMetrics?.mae ?? '—'}</span></div>
            <div>RMSE: <span className="font-semibold text-slate-900">{modelMetrics?.rmse ?? '—'}</span></div>
            <div>R² score: <span className="font-semibold text-slate-900">{modelMetrics?.r2_score ?? '—'}</span></div>
            <div>ROC-AUC: <span className="font-semibold text-slate-900">{modelMetrics?.roc_auc ?? '—'}</span></div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Data provenance</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Operational source</div>
              <div className="mt-1 font-medium text-slate-900">{provenance?.operationalDataSource?.name || '—'}</div>
              <div className="mt-1 text-slate-600">{provenance?.operationalDataSource?.usage || '—'}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Model source</div>
              <div className="mt-1 font-medium text-slate-900">{provenance?.modelTrainingSource?.name || '—'}</div>
              <div className="mt-1 text-slate-600">{provenance?.validationStrategy?.riskControl || '—'}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Circular validation control</div>
              <div className="mt-1 text-slate-600">{provenance?.validationStrategy?.notes || '—'}</div>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Model summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div>Algorithm: <span className="font-semibold text-slate-900">{provenance?.modelSummary?.algorithm ?? '—'}</span></div>
            <div>Evaluation: <span className="font-semibold text-slate-900">{provenance?.validationStrategy?.split ?? '—'}</span></div>
            <div>Reported from: <span className="font-semibold text-slate-900">hold-out test records</span></div>
            <div>Last reviewed: <span className="font-semibold text-slate-900">{provenance?.lastReviewed ?? '—'}</span></div>
          </div>
        </div>
      </section>
    </div>
  );
};
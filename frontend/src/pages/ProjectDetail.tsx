import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Building2, ShieldAlert, Download, ExternalLink, MapPinned, PlaySquare } from 'lucide-react';
import { backendApi } from '../services/api';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any | null>(null);

  useEffect(() => {
    if (id) {
      backendApi.getProjectById(id).then(res => {
        if (res) {
          setProject(res);
        }
      });
    }
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {project?.project_id || 'Loading'}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
              {project?.project_number || 'Project number'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-slate-50 text-slate-700 border-slate-200">
              {project?.risk_category || 'Pending'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{project?.project_name || 'Project detail'}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {project?.village}, {project?.district}, {project?.state}
            </span>
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              {project?.implementing_agency || '-'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Last updated: <strong className="text-gray-800">{project?.last_updated || '-'}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {project?.source_url && (
            <a
              href={project.source_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Official Portal</span>
            </a>
          )}
          <Link
            to="/projects"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Back to list</span>
          </Link>
          <Link
            to={`/simulate?project=${project?.project_id || ''}`}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PlaySquare className="w-3.5 h-3.5" />
            <span>What-if</span>
          </Link>
          <Link
            to={`/map?project=${project?.project_id || ''}`}
            className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <MapPinned className="w-3.5 h-3.5" />
            <span>Map</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Land Acquired</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            {project?.land_acquired_till_now_ha || 0} <span className="text-xs text-gray-500 font-normal">/ {project?.land_required_ha || 0} Ha</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${project?.acquisition_progress_pct || 0}%` }}></div>
          </div>
          <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
            <span>{project?.acquisition_progress_pct || 0}% completed</span>
            <span>{project?.land_remaining_ha || 0} Ha remaining</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Sanction Capital</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            ₹{Math.round((project?.sanction_amount || 0) / 100)} <span className="text-xs text-gray-500 font-normal">Cr</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-2">
            Sanction No: <span className="font-mono text-gray-800">{project?.sanction_number || '-'}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Predicted Delay</div>
          <div className="text-xl font-bold text-amber-600 mt-1">
            +{project?.predicted_delay_days || 0} Days
          </div>
          <div className="text-[10px] text-gray-500 mt-2">
            Estimated ~{project?.predicted_delay_months || 0} months delay impact
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Model Confidence</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">92%</div>
          <div className="text-[10px] text-gray-500 mt-2">
            Based on {project?.data_completeness_pct || 0}% verified data quality
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm mb-3">Project summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
            <div className="text-gray-500 text-xs">Agency</div>
            <div className="font-semibold text-gray-900">{project?.implementing_agency || '-'}</div>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
            <div className="text-gray-500 text-xs">Risk category</div>
            <div className="font-semibold text-gray-900">{project?.risk_category || '-'}</div>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
            <div className="text-gray-500 text-xs">Project type</div>
            <div className="font-semibold text-gray-900">{project?.project_type || '-'}</div>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
            <div className="text-gray-500 text-xs">Administrative bottleneck</div>
            <div className="font-semibold text-gray-900">{project?.administrative_bottleneck || 'None'}</div>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 md:col-span-2">
            <div className="text-gray-500 text-xs">Source record</div>
            <div className="font-semibold text-gray-900 break-all">{project?.source_url || '-'}</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <strong>Simple takeaway:</strong> this screen gives only the core record, risk, and ownership details. Use the project list for comparison when you need more context.
      </div>
    </div>
  );
};
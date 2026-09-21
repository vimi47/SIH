import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { backendApi } from '../services/api';

export const Projects: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [backendResult, setBackendResult] = useState<{ items: any[]; total: number; total_pages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 12;

  // Fetch paginated real records from backend
  useEffect(() => {
    setIsLoading(true);
    backendApi.getProjects({
      search: search || undefined,
      risk: selectedRisk,
      page: currentPage,
      page_size: pageSize,
    }).then(res => {
      if (res && Array.isArray(res.items)) {
        setBackendResult(res);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, [search, selectedRisk, currentPage]);

  const totalCount = backendResult ? backendResult.total : 0;
  const totalPages = backendResult ? backendResult.total_pages : 1;

  const displayedProjects = useMemo(() => {
    if (backendResult && backendResult.items) {
      return backendResult.items.map(p => ({
        ...p,
        risk: p.risk || {
          predictedDelayDays: p.predicted_delay_days,
          predictedDelayMonths: p.predicted_delay_months,
          riskCategory: p.risk_category,
          riskScore: p.risk_score
        }
      }));
    }
    return [];
  }, [backendResult]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Project list</h1>
          <p className="text-xs text-slate-500 mt-0.5">Search the record, filter by risk, and open one project at a time.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, district..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <select
            value={selectedRisk}
            onChange={e => { setSelectedRisk(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium"
          >
            <option value="ALL">All Risk Categories</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <div>
            Showing <span className="font-bold text-gray-900">{displayedProjects.length}</span> of <span className="font-bold text-gray-900">{totalCount.toLocaleString()}</span> projects
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedProjects.map(p => (
                <tr key={p.project_id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/projects/${p.project_id}`} className="font-bold text-blue-600 hover:text-blue-800 truncate block max-w-[220px]">
                      {p.project_name}
                    </Link>
                    <div className="text-[10px] text-gray-500 mt-0.5">{p.project_id} · {p.project_number}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.district}</div>
                    <div className="text-[10px] text-gray-500">{p.state}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-28">
                      <div className="flex justify-between text-[10px] mb-1 font-semibold text-gray-700">
                        <span>{p.acquisition_progress_pct}%</span>
                        <span className="text-gray-400">{p.land_acquired_till_now_ha} Ha</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${p.acquisition_progress_pct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      p.risk.riskCategory === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' :
                      p.risk.riskCategory === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      p.risk.riskCategory === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {p.risk.riskCategory}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/projects/${p.project_id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600 bg-gray-50">
          <div>
            Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-md font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-md font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

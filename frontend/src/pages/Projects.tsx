import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Download, ExternalLink, Database, Cpu } from 'lucide-react';
import { ALL_PROJECTS } from '../data/projects';
import { calculateRiskPrediction } from '../data/intelligence';
import { backendApi } from '../services/api';

export const Projects: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [backendResult, setBackendResult] = useState<{ items: any[]; total: number; total_pages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 12;

  const projectsWithRisk = useMemo(() => {
    return ALL_PROJECTS.map(p => ({
      ...p,
      risk: calculateRiskPrediction(p)
    }));
  }, []);

  const states = useMemo(() => {
    return [
      'ALL',
      'Jammu and Kashmir',
      'Maharashtra',
      'Uttar Pradesh',
      'Gujarat',
      'Tamil Nadu',
      'Karnataka',
      'Rajasthan',
      'Punjab',
      'Haryana',
      'Bihar',
      'Madhya Pradesh',
      'West Bengal',
      'Andhra Pradesh',
      'Telangana',
      'Kerala',
      'Odisha',
      'Assam',
      'Uttarakhand'
    ];
  }, []);

  const types = useMemo(() => {
    return ['ALL', 'National Highway (NH)', 'Expressway Corridor', 'Economic Corridor', 'Strategic Bypass'];
  }, []);

  // Fetch paginated real records from backend
  useEffect(() => {
    setIsLoading(true);
    backendApi.getProjects({
      search: search || undefined,
      state: selectedState,
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
  }, [search, selectedState, selectedRisk, currentPage]);

  const localFiltered = useMemo(() => {
    return projectsWithRisk.filter(p => {
      const matchSearch =
        p.project_name.toLowerCase().includes(search.toLowerCase()) ||
        p.project_id.toLowerCase().includes(search.toLowerCase()) ||
        p.district.toLowerCase().includes(search.toLowerCase()) ||
        p.project_number.toLowerCase().includes(search.toLowerCase());

      const matchState = selectedState === 'ALL' || p.state === selectedState;
      const matchType = selectedType === 'ALL' || p.project_type === selectedType;
      const matchRisk = selectedRisk === 'ALL' || p.risk.riskCategory === selectedRisk;

      return matchSearch && matchState && matchType && matchRisk;
    });
  }, [projectsWithRisk, search, selectedState, selectedType, selectedRisk]);

  const totalCount = backendResult ? backendResult.total : localFiltered.length;
  const totalPages = backendResult ? backendResult.total_pages : (Math.ceil(localFiltered.length / pageSize) || 1);

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
    return localFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [backendResult, localFiltered, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">National Infrastructure Corridor Catalog</h1>
            {backendResult && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-700" />
                Live BhoomiRashi Engine ({backendResult.total.toLocaleString()} Projects)
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Active acquisition projects tracked across BhoomiRashi, PFMS, and State Revenue Portals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const jsonStr = JSON.stringify(displayedProjects, null, 2);
              const blob = new Blob([jsonStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'bhoomiraksha_projects_export.json';
              a.click();
            }}
            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Catalog ({totalCount})</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
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

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={e => { setSelectedState(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium"
          >
            {states.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All States & UTs' : s}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => { setSelectedType(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium"
          >
            {types.map(t => (
              <option key={t} value={t}>{t === 'ALL' ? 'All Project Types' : t}</option>
            ))}
          </select>

          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={e => { setSelectedRisk(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium"
          >
            <option value="ALL">All Risk Categories</option>
            <option value="CRITICAL">Critical Risk Only</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk Only</option>
            <option value="LOW">Low Risk Only</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
          <div>
            Showing <span className="font-bold text-gray-900">{displayedProjects.length}</span> of <span className="font-bold text-gray-900">{totalCount.toLocaleString()}</span> matching projects
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Critical</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low</span>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Project ID & Title</th>
                <th className="px-4 py-3">State & Location</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Acquisition Progress</th>
                <th className="px-4 py-3">Land Required</th>
                <th className="px-4 py-3">Sanction</th>
                <th className="px-4 py-3">Predicted Delay</th>
                <th className="px-4 py-3">Risk Category</th>
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
                    <div className="font-medium text-gray-800 truncate max-w-[140px]" title={p.implementing_agency}>
                      {p.implementing_agency}
                    </div>
                    <div className="text-[10px] text-gray-500">{p.project_type}</div>
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
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.land_required_ha} Ha
                    <div className="text-[10px] text-gray-500">{p.number_of_land_parcels} Parcels</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    ₹{Math.round(p.sanction_amount / 100)} Cr
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-800">+{p.risk.predictedDelayDays}d</span>
                    <div className="text-[10px] text-gray-500">~{p.risk.predictedDelayMonths} mos</div>
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

        {/* Pagination Footer */}
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

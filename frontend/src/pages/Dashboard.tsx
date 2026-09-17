import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  AlertTriangle,
  Landmark,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  MapPin,
  FileCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ALL_PROJECTS } from '../data/projects';
import { calculateRiskPrediction, generateEarlyWarnings } from '../data/intelligence';

export const Dashboard: React.FC = () => {
  const projectsWithRisk = React.useMemo(() => {
    return ALL_PROJECTS.map(p => ({
      ...p,
      risk: calculateRiskPrediction(p)
    }));
  }, []);

  const totalProjects = projectsWithRisk.length;
  const criticalProjects = projectsWithRisk.filter(p => p.risk.riskCategory === 'CRITICAL');
  const highRiskProjects = projectsWithRisk.filter(p => p.risk.riskCategory === 'HIGH');
  const mediumRiskProjects = projectsWithRisk.filter(p => p.risk.riskCategory === 'MEDIUM');
  const lowRiskProjects = projectsWithRisk.filter(p => p.risk.riskCategory === 'LOW');

  const totalLandHa = Math.round(projectsWithRisk.reduce((a, b) => a + b.land_required_ha, 0));
  const totalSanctionCr = Math.round(projectsWithRisk.reduce((a, b) => a + b.sanction_amount, 0) / 100);
  const avgDelayDays = Math.round(
    projectsWithRisk.reduce((a, b) => a + b.risk.predictedDelayDays, 0) / Math.max(totalProjects, 1)
  );

  const warnings = generateEarlyWarnings(ALL_PROJECTS).slice(0, 4);

  const riskData = [
    { name: 'Critical', value: criticalProjects.length, color: '#ef4444' },
    { name: 'High', value: highRiskProjects.length, color: '#f97316' },
    { name: 'Medium', value: mediumRiskProjects.length, color: '#eab308' },
    { name: 'Low', value: lowRiskProjects.length, color: '#10b981' },
  ];

  const driverData = [
    { driver: 'Legal Disputes', count: 42 },
    { driver: 'Compensation Disbursal', count: 35 },
    { driver: 'Environmental & Forest', count: 28 },
    { driver: 'R&R Grievance', count: 22 },
    { driver: 'Title Disputes', count: 18 },
    { driver: 'Survey Gaps', count: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wide bg-blue-500/20 text-blue-300 border border-blue-400/30">
              NATIONAL MONITORING COCKPIT
            </span>
            <span className="text-xs text-slate-400 font-medium">RFCTLARR 2013 Compliance</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">Executive Land Acquisition Delay Intelligence</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time multi-factor delay forecasting across National Highways, High-Speed Rail corridors, and freight alignments.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/risk-intelligence"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Run What-If Simulator</span>
          </Link>
          <Link
            to="/gis"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>GIS Map</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Projects</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{totalProjects}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Active monitoring</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Critical & High Risk</span>
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">{criticalProjects.length + highRiskProjects.length}</div>
          <div className="mt-1 text-[11px] text-gray-500 font-medium">
            {criticalProjects.length} Critical · {highRiskProjects.length} High
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Land Required</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{totalLandHa.toLocaleString()} <span className="text-sm font-normal text-gray-500">Ha</span></div>
          <div className="mt-1 text-[11px] text-gray-500 font-medium">Across 20+ States</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sanctioned Budget</span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">₹{totalSanctionCr.toLocaleString()} <span className="text-sm font-normal text-gray-500">Cr</span></div>
          <div className="mt-1 text-[11px] text-gray-500 font-medium">Government Outlay</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Predicted Delay</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{avgDelayDays} <span className="text-sm font-normal text-gray-500">Days</span></div>
          <div className="mt-1 text-[11px] text-gray-500 font-medium">~{Math.round(avgDelayDays / 30)} Months across corridors</div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Portfolio Risk Breakdown</h3>
              <p className="text-[11px] text-gray-500">Categorized by multi-factor risk score</p>
            </div>
            <Link to="/risk-intelligence" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center">
              Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 text-xs">
            {riskData.map((d, i) => (
              <div key={i} className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-gray-600 font-medium">{d.name}</span>
                </div>
                <span className="font-bold text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Delay Drivers */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Primary Delay Drivers Across Projects</h3>
              <p className="text-[11px] text-gray-500">Frequency of root bottlenecks causing schedule slippage</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium border border-gray-200">
              National Summary
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={driverData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis dataKey="driver" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Flagship Projects Watchlist & Early Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Critical Infrastructure Watchlist</h3>
              <p className="text-[11px] text-gray-500">National corridors requiring active inter-ministerial intervention</p>
            </div>
            <Link to="/projects" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
              View All {totalProjects} <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5">Project Name</th>
                  <th className="px-4 py-2.5">State / District</th>
                  <th className="px-4 py-2.5">Progress</th>
                  <th className="px-4 py-2.5">Predicted Delay</th>
                  <th className="px-4 py-2.5">Risk Category</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projectsWithRisk.slice(0, 6).map(p => (
                  <tr key={p.project_id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 truncate max-w-[220px]">{p.project_name}</div>
                      <div className="text-[10px] text-gray-500">{p.project_number} · {p.project_type}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-800 font-medium">{p.district}</div>
                      <div className="text-[10px] text-gray-500">{p.state}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-24">
                        <div className="flex justify-between text-[10px] mb-1 font-medium">
                          <span>{p.acquisition_progress_pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${p.acquisition_progress_pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      +{p.risk.predictedDelayDays}d
                      <div className="text-[10px] text-gray-500 font-normal">~{p.risk.predictedDelayMonths} mos</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
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
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Early Warning Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Active Early Warnings</h3>
              </div>
              <Link to="/early-warnings" className="text-xs text-blue-600 font-medium">
                All Alerts
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {warnings.map(w => (
                <div key={w.id} className="p-3 rounded-lg border border-red-100 bg-red-50/30 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-red-700">{w.severity} SEVERITY</span>
                    <span className="text-[10px] text-gray-500">{w.date}</span>
                  </div>
                  <div className="font-medium text-gray-900 truncate mb-1">{w.projectName}</div>
                  <p className="text-gray-600 text-[11px] line-clamp-2 leading-relaxed">{w.trigger}</p>
                  <div className="mt-2 pt-1.5 border-t border-red-100 flex items-center justify-between text-[10px] text-gray-500">
                    <span>{w.district}, {w.state}</span>
                    <span className="font-medium text-blue-600">Officer Assigned</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/interventions"
            className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold text-center block transition-colors border border-gray-200"
          >
            Review Recommended Interventions
          </Link>
        </div>
      </div>
    </div>
  );
};

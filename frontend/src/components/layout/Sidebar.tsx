import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  MapPin,
  Building2,
  BarChart3,
  Database,
  CheckCircle2,
  Cpu,
  FileText,
  History,
  Settings,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { ALL_PROJECTS } from '../../data/projects';
import { generateEarlyWarnings, generateInterventions } from '../../data/intelligence';

export const Sidebar: React.FC = () => {
  const warnings = generateEarlyWarnings(ALL_PROJECTS);
  const interventions = generateInterventions(ALL_PROJECTS);
  const criticalWarnings = warnings.filter(w => w.severity === 'CRITICAL').length;
  const pendingInterventions = interventions.filter(i => i.status === 'PENDING').length;

  const navGroups = [
    {
      group: "Core Modules",
      items: [
        { name: "Executive Dashboard", path: "/", icon: LayoutDashboard },
        { name: "Project Portfolio", path: "/projects", icon: FolderKanban, badge: ALL_PROJECTS.length },
        { name: "Risk Intelligence", path: "/risk-intelligence", icon: ShieldAlert },
        { name: "Early Warning Alerts", path: "/early-warnings", icon: AlertTriangle, badge: criticalWarnings, badgeColor: "bg-red-500" },
        { name: "Intervention Center", path: "/interventions", icon: Lightbulb, badge: pendingInterventions, badgeColor: "bg-amber-500" },
        { name: "GIS Intelligence Map", path: "/gis", icon: MapPin },
      ]
    },
    {
      group: "Spatial & Regional",
      items: [
        { name: "State Analytics", path: "/state-analytics", icon: Building2 },
        { name: "District Hotspots", path: "/district-analytics", icon: BarChart3 },
      ]
    },
    {
      group: "Data & ML Platform",
      items: [
        { name: "BhoomiRashi Ingestion", path: "/data-management", icon: Database },
        { name: "Data Quality & Audits", path: "/data-quality", icon: CheckCircle2 },
        { name: "AI/ML Model Intel", path: "/model-intelligence", icon: Cpu },
      ]
    },
    {
      group: "Governance & Reports",
      items: [
        { name: "Executive Reports", path: "/reports", icon: FileText },
        { name: "System Audit Logs", path: "/audit-logs", icon: History },
        { name: "System Settings", path: "/settings", icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-white tracking-wide flex items-center gap-1.5 text-base">
            BhoomiRaksha <span className="text-xs bg-blue-600/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">AI</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate max-w-[150px]">
            MoRTH · Land Delay Intel
          </p>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          item.badgeColor || "bg-slate-800 text-slate-300"
                        } text-white`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            RK
          </div>
          <div>
            <div className="text-xs font-medium text-white flex items-center gap-1">
              Rajesh Kumar <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-[10px] text-slate-400">CENTRAL_ADMIN</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

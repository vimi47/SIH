import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogOut, Search, Shield, LayoutDashboard, FolderKanban, ChartColumnBig, FileText, MapPinned, PlaySquare, BookA } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, roles: ['ADMIN', 'ANALYST', 'OFFICER', 'VIEWER'] as const },
    { to: '/projects', label: 'Projects', icon: FolderKanban, roles: ['ADMIN', 'ANALYST', 'OFFICER', 'VIEWER'] as const },
    { to: '/map', label: 'Map', icon: MapPinned, roles: ['ADMIN', 'ANALYST', 'OFFICER', 'VIEWER'] as const },
    { to: '/simulate', label: 'Simulation', icon: PlaySquare, roles: ['ADMIN', 'ANALYST', 'OFFICER'] as const },
    { to: '/analytics', label: 'Analytics', icon: ChartColumnBig, roles: ['ADMIN', 'ANALYST', 'OFFICER', 'VIEWER'] as const },
    { to: '/reports', label: 'Reports', icon: FileText, roles: ['ADMIN', 'ANALYST', 'OFFICER', 'VIEWER'] as const },
    { to: '/audit', label: 'Audit', icon: BookA, roles: ['ADMIN'] as const },
  ].filter(item => user ? item.roles.includes(user.role as any) : false);

  return (
    <header className="sticky top-0 z-20 px-4 pt-4 md:px-8 md:pt-6 flex-shrink-0">
      <div className="rounded-[24px] border border-white/70 bg-white/92 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] px-4 py-3 md:px-5 md:py-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white border border-blue-100 shadow-sm shadow-blue-100 flex items-center justify-center overflow-hidden p-1.5">
                  <img
                    src="/indian-emblem.png"
                    alt="State Emblem of India"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 font-semibold">Government portal</div>
                  <div className="text-base font-semibold tracking-tight text-slate-900">BhoomiRaksha</div>
                  <div className="text-[11px] text-slate-500">Land acquisition and project monitoring</div>
                </div>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              {user && (
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">{user.name}</span> · {user.role}
                </div>
              )}
              <a
                href="https://bhoomirashi.gov.in"
                target="_blank"
                rel="noreferrer"
                title="BhoomiRashi Official MoRTH Portal"
                className="inline-flex items-center gap-2 rounded-full bg-[#0b4ea2] px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#083a7a]"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">MoRTH</span>
              </a>
              {user && (
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex flex-wrap items-center gap-2">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${isActive ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'}`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search project, district, or ID..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

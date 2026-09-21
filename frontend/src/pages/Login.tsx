import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, LockKeyhole } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('officer');
  const [password, setPassword] = useState('officer123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 md:py-12 flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(13,71,161,0.08),transparent_35%),linear-gradient(180deg,#ffffff_0%,#f5f8fc_100%)]">
      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-[#0b4ea2] px-6 py-10 md:px-10 md:py-12 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90">
            <Shield className="w-3.5 h-3.5" />
            Land acquisition monitor
          </div>
          <h1 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight">Secure access for project review, analytics, and reporting</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/85">
            Sign in with your assigned role to open the project register, run what-if checks, view the GIS map, and download reports.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/85">
            <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3">Role-based access for officers, analysts, viewers, and administrators.</div>
            <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3">Audit logging captures logins, simulations, and downloads.</div>
            <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3">Provenance details separate live records from model evaluation.</div>
          </div>
        </div>

        <div className="px-6 py-10 md:px-10 md:py-12">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl border border-blue-100 bg-blue-50 p-1.5">
              <img src="/indian-emblem.png" alt="State Emblem of India" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold">BhoomiRaksha</div>
              <div className="text-lg font-semibold text-slate-900">Sign in to continue</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Username</span>
              <input
                value={username}
                onChange={event => setUsername(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/15"
                placeholder="admin / analyst / officer / viewer"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/15">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="ml-3 w-full bg-transparent text-sm outline-none"
                  placeholder="Enter password"
                />
              </div>
            </label>

            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b4ea2] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#083a7a] disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Default accounts are available for internal access control: admin, analyst, officer, and viewer.
          </div>
        </div>
      </div>
    </div>
  );
};
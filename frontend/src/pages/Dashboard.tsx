import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  AlertTriangle,
  FolderKanban,
  Clock3,
  ShieldCheck,
  BadgeInfo,
  ArrowRightLeft,
  FileText,
  Scale,
  Users,
} from 'lucide-react';
import { backendApi } from '../services/api';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    backendApi.getSummary().then((res) => {
      if (res) {
        setSummary(res);
      }
    });
  }, []);

  const kpis = summary?.kpis || {};
  const priorityProjects = summary?.priority_projects || [];
  const warnings = summary?.warnings || [];
  const interventions = summary?.interventions || [];

  const stats = [
    {
      label: 'Projects monitored',
      value: kpis.total_projects ?? '—',
      helper: 'Live project register',
      icon: FolderKanban,
    },
    {
      label: 'High priority cases',
      value: (kpis.critical_risk ?? 0) + (kpis.high_risk ?? 0),
      helper: 'Needs direct follow-up',
      icon: AlertTriangle,
    },
    {
      label: 'Average delay',
      value: `${kpis.avg_delay_days ?? '—'} days`,
      helper: 'Predicted by the model',
      icon: Clock3,
    },
    {
      label: 'Sanction value',
      value: `₹${kpis.total_sanction_cr ?? '—'} Cr`,
      helper: 'Aggregate sanctioned amount',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero Section */}
      <section className="overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">

          {/* Left side */}
          <div className="p-6 md:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
              <BadgeInfo className="w-3.5 h-3.5" />
              Land acquisition monitoring
            </div>

            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
              Predict delays early and give officers one clear action path.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Review the project register, identify statutory and compensation
              bottlenecks, inspect a project record, and take the next action
              from one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-[#0b4ea2] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#083a7a]"
              >
                Open project register
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700"
              >
                View analytics
                <ArrowRightLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Scale className="w-3.5 h-3.5 text-blue-700" />
                  Legal delay
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  Track approval, award, and dispute bottlenecks.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Users className="w-3.5 h-3.5 text-blue-700" />
                  Field coordination
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  See the stakeholders that need follow-up.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  Action notes
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  Use the report view for operational checks.
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="border-t border-slate-100 bg-slate-50/70 p-6 md:p-8 lg:border-l lg:border-t-0">

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                User workflow
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  1. Review the project register and filter by risk, state, or
                  district.
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  2. Open one project record to inspect delay drivers and land
                  status.
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  3. Use analytics and reports for a structured follow-up
                  decision.
                </div>
              </div>
            </div>

            {/* Blue information box */}
            <div className="mt-4 rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                <ShieldCheck className="h-4 w-4 text-blue-700" />
                Early intervention
              </div>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Focus attention on projects where predicted delays,
                statutory bottlenecks, or compensation issues require
                follow-up.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {stat.label}
                  </div>

                  <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                    {stat.value}
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-500">
                {stat.helper}
              </div>
            </div>
          );
        })}
      </section>

      {/* Priority + Alerts */}
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">

        {/* Priority Projects */}
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Priority projects
              </h2>

              <p className="text-xs text-slate-500">
                The most delayed records at the top
              </p>
            </div>

            <Link
              to="/projects"
              className="text-sm font-semibold text-blue-700"
            >
              Open register
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {priorityProjects.slice(0, 5).map((project: any) => (
              <Link
                key={project.project_id}
                to={`/projects/${project.project_id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-900">
                    {project.project_name}
                  </div>

                  <div className="text-xs text-slate-500">
                    {project.state} · {project.district}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    {project.risk_category}
                  </div>

                  <div className="text-xs text-slate-500">
                    +{project.predicted_delay_days} days
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* How to use */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              How to use
            </h2>

            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                1. Overview page gives the current status.
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                2. Projects page works like the register.
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                3. Analytics and reports show supporting details.
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Alerts
            </h2>

            <div className="mt-3 space-y-3">
              {warnings.slice(0, 2).map((warning: any) => (
                <Link
                  key={warning.id}
                  to={`/projects/${warning.projectId}`}
                  className="block rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:bg-white"
                >
                  <div className="truncate text-sm font-medium text-slate-900">
                    {warning.projectName}
                  </div>

                  <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {warning.trigger}
                  </div>
                </Link>
              ))}

              {interventions.length > 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-600">
                  {interventions.length} intervention records available.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
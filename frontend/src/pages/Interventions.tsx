import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, CheckCircle2, Clock, UserCheck, ArrowRight, ShieldCheck, Plus, Database } from 'lucide-react';
import { ALL_PROJECTS } from '../data/projects';
import { generateInterventions } from '../data/intelligence';
import { Intervention } from '../data/types';
import { backendApi } from '../services/api';

export const Interventions: React.FC = () => {
  const [interventions, setInterventions] = useState<Intervention[]>(() => generateInterventions(ALL_PROJECTS));
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  useEffect(() => {
    backendApi.getInterventions().then(res => {
      if (res && Array.isArray(res) && res.length > 0) {
        setInterventions(res);
        setIsBackendConnected(true);
      }
    });
  }, []);

  const filtered = interventions.filter(item => {
    if (selectedTab === 'ALL') return true;
    return item.status === selectedTab;
  });

  const handleStatusChange = (id: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') => {
    setInterventions(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
  };

  const pendingCount = interventions.filter(i => i.status === 'PENDING').length;
  const inProgressCount = interventions.filter(i => i.status === 'IN_PROGRESS').length;
  const resolvedCount = interventions.filter(i => i.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ACTION RESOLUTION CENTER
            </span>
            <span className="text-xs text-gray-500 font-medium">Standard Operating Procedures & Remediation</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Intervention Recommendations & Action Tracker</h1>
          <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
            Targeted legal, administrative, and compensation interventions to de-bottleneck delayed land acquisition proceedings.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-bold">
            {pendingCount} Pending
          </div>
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 font-bold">
            {inProgressCount} In Progress
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold">
            {resolvedCount} Resolved
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-xs">
        {(['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Interventions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-gray-400 font-semibold">{item.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  item.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                  item.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {item.priority} PRIORITY
                </span>
              </div>

              <h3 className="text-sm font-bold text-gray-900 mb-2">
                <Link to={`/projects/${item.projectId}`} className="hover:text-blue-600">
                  {item.projectName}
                </Link>
              </h3>

              <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                <div>
                  <span className="font-semibold text-gray-700">Identified Bottleneck: </span>
                  <span className="text-gray-900">{item.problem}</span>
                </div>
                <div>
                  <span className="font-semibold text-emerald-700">Recommended Action: </span>
                  <span className="text-gray-900 font-medium">{item.recommendedAction}</span>
                </div>
                <div className="text-[11px] text-blue-700 font-medium pt-1 border-t border-gray-200">
                  Expected Impact: {item.expectedImpact}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
              <div className="flex items-center justify-between text-gray-500">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{item.responsibleStakeholder}</span>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Deadline: {item.deadline}</span>
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-gray-500">Status:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStatusChange(item.id, 'PENDING')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusChange(item.id, 'IN_PROGRESS')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(item.id, 'RESOLVED')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar, HelpCircle, ExternalLink, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { backendApi } from '../../services/api';

export const Header: React.FC = () => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    backendApi.getHealth().then(res => {
      setBackendOnline(res?.status === 'HEALTHY');
    });
  }, []);
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 flex-shrink-0">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, districts, national highways, notification IDs..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${
          backendOnline
            ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
            : 'text-amber-800 bg-amber-50 border-amber-200'
        }`}>
          <Server className="w-3.5 h-3.5" />
          <span>Backend ML Engine: {backendOnline ? 'ONLINE (:8000)' : 'CONNECTING...'}</span>
          <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
          <span>BhoomiRashi (2,540 Projects)</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>16 Sep 2026</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
          <span className="text-[10px] text-emerald-700 font-semibold">LIVE</span>
        </div>

        <Link
          to="/early-warnings"
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </Link>

        <a
          href="https://bhoomirashi.gov.in"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded"
        >
          <span>BhoomiRashi Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </header>
  );
};

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BhoomiCopilot } from '../copilot/BhoomiCopilot';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.6)),radial-gradient(circle_at_top_left,rgba(13,71,161,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(2,132,199,0.06),transparent_22%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 px-4 pb-6 pt-3 md:px-8 md:pb-10 md:pt-5">
          <Outlet />
        </main>
        <BhoomiCopilot />
      </div>
    </div>
  );
};

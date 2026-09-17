import React from 'react';
import { FileText, Download, Printer, CheckCircle, ExternalLink } from 'lucide-react';

export const Reports: React.FC = () => {
  const reportsList = [
    {
      id: "REP-2026-Q3-EXEC",
      title: "Executive Portfolio Risk Dossier - Q3 2026",
      desc: "Comprehensive macro risk analysis across all active National Highway and High-Speed Rail alignments.",
      type: "EXECUTIVE_BRIEF",
      date: "16 Sep 2026",
      pages: 14,
    },
    {
      id: "REP-2026-CRIT-01",
      title: "Critical Corridors Inter-Ministerial Escalation Memo",
      desc: "Flagged projects with impending Section 3D deadline breaches requiring Union Cabinet Committee attention.",
      type: "ESCALATION_MEMO",
      date: "15 Sep 2026",
      pages: 8,
    },
    {
      id: "REP-2026-COMP-AUD",
      title: "Compensation Disbursal & PFMS Audit Report",
      desc: "State-by-state audit of pending beneficiary compensations and bank verification blockages.",
      type: "FINANCIAL_AUDIT",
      date: "10 Sep 2026",
      pages: 22,
    },
    {
      id: "REP-2026-ML-VAL",
      title: "Predictive AI Model Validation & Calibration Report",
      desc: "Quarterly validation testing on regression accuracy, feature weights, and calibration matrices.",
      type: "TECHNICAL_VALIDATION",
      date: "05 Sep 2026",
      pages: 18,
    }
  ];

  const handlePrint = (title: string) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              GOVERNANCE ARCHIVE
            </span>
            <span className="text-xs text-gray-500 font-medium">Ministerial Briefs & Statutory Reports</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Executive Risk Reports & Dossiers</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Download or generate official RFCTLARR compliance and delay intelligence dossiers for MoRTH and NHAI reviews.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Executive Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsList.map(rep => (
          <div key={rep.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-gray-400 font-semibold">{rep.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                  {rep.type}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{rep.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{rep.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>{rep.date} · {rep.pages} Pages</span>
              <button
                onClick={() => handlePrint(rep.title)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

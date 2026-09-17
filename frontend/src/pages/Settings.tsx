import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, Shield, Sliders } from 'lucide-react';

export const Settings: React.FC = () => {
  const [criticalThreshold, setCriticalThreshold] = useState(75);
  const [highThreshold, setHighThreshold] = useState(55);
  const [autoAlerts, setAutoAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">System Preferences & Alert Thresholds</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure risk classification boundaries, automated email triggers, and ML inference frequency.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saved ? 'Saved Successfully!' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Model Thresholds */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <span>Risk Classification Thresholds</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700">Critical Risk Cutoff Score (0-100)</label>
            <input
              type="number"
              value={criticalThreshold}
              onChange={e => setCriticalThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold text-red-600 bg-gray-50"
            />
            <p className="text-[11px] text-gray-400">Projects scoring above this score trigger immediate ministerial alerts.</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700">High Risk Cutoff Score (0-100)</label>
            <input
              type="number"
              value={highThreshold}
              onChange={e => setHighThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold text-orange-600 bg-gray-50"
            />
            <p className="text-[11px] text-gray-400">Projects flagged for monthly district collector review meetings.</p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600" />
          <span>Automated Notifications</span>
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoAlerts}
              onChange={e => setAutoAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <div>
              <div className="font-semibold text-gray-900">Broadcast Instant Early Warning SMS / Email</div>
              <div className="text-[11px] text-gray-500">Dispatch SMS to Special Land Acquisition Officer when court stays are filed.</div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={e => setEmailDigest(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <div>
              <div className="font-semibold text-gray-900">Weekly Executive Portfolio Risk Digest</div>
              <div className="text-[11px] text-gray-500">Generate automated Monday morning digest for Central MoRTH Admin.</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

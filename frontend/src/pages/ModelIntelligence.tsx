import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, TrendingUp, BarChart2, Zap, Database } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ML_MODEL_METRICS } from '../data/reports';
import { backendApi } from '../services/api';

export const ModelIntelligence: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(ML_MODEL_METRICS);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    backendApi.getModelMetrics().then(res => {
      if (res && res.r2Score !== undefined) {
        setMetrics(res);
        setIsBackendConnected(true);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-violet-100 text-violet-800 border border-violet-200">
              AI / ML INFERENCE PIPELINE
            </span>
            <span className="text-xs text-gray-500 font-medium">Predictive Delay Modeling Engine</span>
            {isBackendConnected && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-600" />
                Live Trained Python Model
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Machine Learning Model Performance & Metrics</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Validation scores, ROC-AUC curves, and feature importance rankings from 2,540 BhoomiRashi infrastructure acquisitions.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-mono font-semibold text-gray-700">
          Model Version: {metrics.version || 'v1.0.0-bhoomirashi'}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Model R² Accuracy</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{metrics.r2Score}</div>
          <div className="text-[11px] text-gray-500 mt-1">Variance explained on test split</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">ROC-AUC Classification</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{metrics.rocAuc}</div>
          <div className="text-[11px] text-gray-500 mt-1">Critical delay breach detection</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Root Mean Squared Error</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{metrics.rmseDays} <span className="text-sm font-normal text-gray-500">Days</span></div>
          <div className="text-[11px] text-gray-500 mt-1">Mean deviation on schedule</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Training Samples</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.trainSamples}</div>
          <div className="text-[11px] text-gray-500 mt-1">BhoomiRashi validated records</div>
        </div>
      </div>

      {/* Feature Importance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Model Feature Importance (SHAP Normalized)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.featureImportances} layout="vertical" margin={{ left: 50, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" width={140} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="importancePct" fill="#8b5cf6" name="Importance %" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-1">Delay Classification Confusion Matrix</h3>
          <p className="text-xs text-gray-500 mb-4">Predicted vs Actual risk classifications across test partition</p>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-2 text-left text-gray-500">Actual \ Predicted</th>
                  {metrics.confusionMatrix.labels.map((l: string) => (
                    <th key={l} className="p-2 font-bold text-gray-700">{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.confusionMatrix.matrix.map((row: number[], rIdx: number) => (
                  <tr key={rIdx} className="border-b border-gray-100">
                    <td className="p-2 text-left font-bold text-gray-700">
                      {metrics.confusionMatrix.labels[rIdx]}
                    </td>
                    {row.map((cell: number, cIdx: number) => (
                      <td
                        key={cIdx}
                        className={`p-2 font-mono font-bold ${
                          rIdx === cIdx ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'text-gray-500'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-100">
            <strong>Architecture Note:</strong> {metrics.algorithm || 'RandomForestRegressor + GradientBoostingClassifier Ensemble trained on 2,540 BhoomiRashi project records with calibrated scoring.'}
          </div>
        </div>
      </div>
    </div>
  );
};

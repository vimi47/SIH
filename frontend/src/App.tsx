import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { RiskIntelligence } from './pages/RiskIntelligence';
import { EarlyWarnings } from './pages/EarlyWarnings';
import { Interventions } from './pages/Interventions';
import { GISMap } from './pages/GISMap';
import { StateAnalytics } from './pages/StateAnalytics';
import { DistrictAnalytics } from './pages/DistrictAnalytics';
import { DataManagement } from './pages/DataManagement';
import { DataQuality } from './pages/DataQuality';
import { ModelIntelligence } from './pages/ModelIntelligence';
import { Reports } from './pages/Reports';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="risk-intelligence" element={<RiskIntelligence />} />
          <Route path="early-warnings" element={<EarlyWarnings />} />
          <Route path="interventions" element={<Interventions />} />
          <Route path="gis" element={<GISMap />} />
          <Route path="state-analytics" element={<StateAnalytics />} />
          <Route path="district-analytics" element={<DistrictAnalytics />} />
          <Route path="data-management" element={<DataManagement />} />
          <Route path="data-quality" element={<DataQuality />} />
          <Route path="model-intelligence" element={<ModelIntelligence />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;

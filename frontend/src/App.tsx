import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Login } from './pages/Login';
import { GISMap } from './pages/GISMap';
import { Simulation } from './pages/Simulation';
import { AuditLogs } from './pages/AuditLogs';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './components/auth/RequireAuth';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="map" element={<GISMap />} />
            <Route path="simulate" element={<Simulation />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route
              path="audit"
              element={
                <RequireAuth roles={['ADMIN']}>
                  <AuditLogs />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;

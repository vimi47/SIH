# BhoomiRaksha AI Repo Notes

## Current Product Features

### Frontend
- React + Vite app with a full dashboard shell.
- Router exposes many screens: dashboard, projects, project detail, risk intelligence, early warnings, interventions, GIS, state analytics, district analytics, data management, data quality, model intelligence, reports, audit logs, and settings.
- Sidebar currently groups those screens into four sections and shows live badge counts.
- Header shows backend health, date, alerts, and a portal link.
- Dashboard contains KPI cards, charts, a watchlist table, and quick links.
- Projects page supports search, filters, pagination, export, and a table view.
- Frontend currently also has a large static data layer in `src/data` that mirrors backend behavior for analytics and predictions.

### Backend
- FastAPI service with CORS enabled for the frontend.
- Core endpoints:
  - `GET /api/health`
  - `GET /api/kpis`
  - `GET /api/projects`
  - `GET /api/projects/{project_id}`
  - `POST /api/predict`
  - `POST /api/simulate`
  - `GET /api/early-warnings`
  - `GET /api/interventions`
  - `GET /api/analytics/state`
  - `GET /api/analytics/district`
  - `GET /api/model/metrics`
  - `GET /api/data-quality`
- Backend data comes from `backend/data/bhoomirashi_projects_clean.csv` and is cached in memory.
- Backend computes project risk, summary KPIs, analytics, early warnings, and interventions.

## Coding Details
- Frontend API client lives in `src/services/api.ts` and talks to the backend under `/api`.
- The app uses `HashRouter` and nested routes inside `Layout`.
- Most visual complexity is in the current sidebar and dashboard pages, not in the data layer.
- The backend already contains enough data and aggregation logic to support a simpler product flow without adding new raw data sources.

## Simplification Target

### Minimal Workflow
1. Open the dashboard and see only the most important KPI summary.
2. Search and filter projects from a single projects list.
3. Open one project detail page for the action required.
4. Keep advanced analytics hidden or removed from the primary navigation.

### Minimal UI
- Reduce sidebar navigation to a small set of core pages.
- Replace multiple dense cards and charts with one clean summary section.
- Keep only the core health indicator, search, KPIs, and action items.

### Optional Backend Support
- Add one compact summary endpoint if the frontend needs a single response for the simplified home view.
- Reuse existing project, KPI, warning, and intervention logic rather than duplicating calculations in the client.

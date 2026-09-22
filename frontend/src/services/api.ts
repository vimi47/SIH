const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = `${rawBase.replace(/\/+$/, '')}/api`;

const SESSION_STORAGE_KEY = 'bhoomiraksha.session';

function getSessionHeaders(): Record<string, string> {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return {};
    const session = JSON.parse(stored) as { user?: { name?: string; role?: string } };
    if (!session?.user) return {};
    return {
      'X-User-Name': session.user.name || 'Guest',
      'X-User-Role': session.user.role || 'VIEWER',
    };
  } catch {
    return {};
  }
}

export async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getSessionHeaders(),
        ...options?.headers,
      },
    });
    if (!res.ok) {
      console.warn(`API Error [${res.status}] for ${endpoint}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`Failed to connect to backend at ${API_BASE_URL}${endpoint}:`, err);
    return null;
  }
}

export const backendApi = {
  getHealth: () => fetchFromApi<{ status: string; engine: string }>('/health'),
  getSummary: async () => {
    const direct = await fetchFromApi<any>('/summary');
    if (direct) return direct;
    // Fallback: If deployed backend is still on previous version without /api/summary
    try {
      const [kpis, projectsRes, warnings, interventions] = await Promise.all([
        fetchFromApi<any>('/kpis'),
        fetchFromApi<any>('/projects?page=1&page_size=5'),
        fetchFromApi<any[]>('/early-warnings'),
        fetchFromApi<any[]>('/interventions'),
      ]);
      if (kpis || projectsRes) {
        return {
          health: { status: 'HEALTHY' },
          kpis: kpis || {},
          priority_projects: projectsRes?.items || projectsRes?.projects || [],
          warnings: (warnings || []).slice(0, 5),
          interventions: (interventions || []).slice(0, 5),
        };
      }
    } catch {
      // ignore
    }
    return null;
  },
  getKpis: () => fetchFromApi<any>('/kpis'),
  getProjects: (params: { search?: string; state?: string; agency?: string; risk?: string; page?: number; page_size?: number }) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.state && params.state !== 'ALL') query.append('state', params.state);
    if (params.agency && params.agency !== 'ALL') query.append('agency', params.agency);
    if (params.risk && params.risk !== 'ALL') query.append('risk', params.risk);
    if (params.page) query.append('page', String(params.page));
    if (params.page_size) query.append('page_size', String(params.page_size));
    return fetchFromApi<any>(`/projects?${query.toString()}`);
  },
  getProjectById: (id: string) => fetchFromApi<any>(`/projects/${id}`),
  getProjectLocations: async () => {
    const direct = await fetchFromApi<any[]>('/map/projects');
    if (Array.isArray(direct) && direct.length > 0) return direct;
    // Fallback: If deployed backend lacks /api/map/projects, pull from /api/projects
    try {
      const fallback = await fetchFromApi<any>('/projects?page_size=500');
      if (fallback?.items && Array.isArray(fallback.items)) {
        return fallback.items;
      }
      if (Array.isArray(fallback)) {
        return fallback;
      }
    } catch {
      // ignore
    }
    return [];
  },
  simulateWhatIf: (payload: { project_id: string; legal_cases: number; compensation_progress: number; approval_days: number; rr_progress: number }) => {
    return fetchFromApi<any>('/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  recordAuditEvent: (payload: { action: string; entity_type?: string; entity_id?: string; details?: string; metadata?: Record<string, any> }) => {
    return fetchFromApi<any>('/audit/logs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getAuditLogs: (limit = 100) => fetchFromApi<{ items: any[]; total: number }>(`/audit/logs?limit=${limit}`),
  getProvenance: () => fetchFromApi<any>('/provenance'),
  getEarlyWarnings: () => fetchFromApi<any[]>('/early-warnings'),
  getInterventions: () => fetchFromApi<any[]>('/interventions'),
  getStateAnalytics: () => fetchFromApi<any[]>('/analytics/state'),
  getDistrictAnalytics: () => fetchFromApi<any[]>('/analytics/district'),
  getModelMetrics: () => fetchFromApi<any>('/model/metrics'),
  getDataQuality: () => fetchFromApi<any>('/data-quality'),
  downloadProjectsCsv: async () => {
    const response = await fetch(`${API_BASE_URL}/export/projects.csv`, {
      headers: {
        ...getSessionHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to download projects CSV');
    const blob = await response.blob();
    return blob;
  },
  downloadAuditCsv: async () => {
    const response = await fetch(`${API_BASE_URL}/export/audit.csv`, {
      headers: {
        ...getSessionHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to download audit CSV');
    const blob = await response.blob();
    return blob;
  },
};

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = `${rawBase.replace(/\/+$/, '')}/api`;

export async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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
  simulateWhatIf: (payload: { project_id: string; legal_cases: number; compensation_progress: number; approval_days: number; rr_progress: number }) => {
    return fetchFromApi<any>('/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getEarlyWarnings: () => fetchFromApi<any[]>('/early-warnings'),
  getInterventions: () => fetchFromApi<any[]>('/interventions'),
  getStateAnalytics: () => fetchFromApi<any[]>('/analytics/state'),
  getDistrictAnalytics: () => fetchFromApi<any[]>('/analytics/district'),
  getModelMetrics: () => fetchFromApi<any>('/model/metrics'),
  getDataQuality: () => fetchFromApi<any>('/data-quality'),
};

//
// Lightweight API client for the FastAPI backend on port 3001
//

const DEFAULT_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

/**
 * Build absolute URL with optional query params
 */
function buildUrl(path, query) {
  const url = new URL(path.startsWith('http') ? path : `${DEFAULT_BASE}${path}`);
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

/**
 * Core request wrapper with JSON handling and standardized errors.
 */
async function request(path, { method = 'GET', headers = {}, body, query } = {}) {
  const url = buildUrl(path, query);
  const init = {
    method,
    headers: {
      'Accept': 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    mode: 'cors',
    credentials: 'omit',
    ...(body ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  };

  const res = await fetch(url, init);
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const errPayload = isJson ? await res.json() : await res.text();
      message = typeof errPayload === 'string' ? errPayload : (errPayload.detail || JSON.stringify(errPayload));
    } catch (_) {
      // ignore
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  if (isJson) {
    return res.json();
  }
  return res.text();
}

// PUBLIC_INTERFACE
export const api = {
  /** Projects CRUD */
  projects: {
    // PUBLIC_INTERFACE
    list: () => request('/projects'),
    // PUBLIC_INTERFACE
    create: (data) => request('/projects', { method: 'POST', body: data }),
    // PUBLIC_INTERFACE
    update: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: data }),
    // PUBLIC_INTERFACE
    remove: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  },
  /** Tasks CRUD */
  tasks: {
    // PUBLIC_INTERFACE
    list: () => request('/tasks'),
    // PUBLIC_INTERFACE
    create: (data) => request('/tasks', { method: 'POST', body: data }),
    // PUBLIC_INTERFACE
    update: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: data }),
    // PUBLIC_INTERFACE
    remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  },
  /** Sessions CRUD and controls */
  sessions: {
    // PUBLIC_INTERFACE
    list: (query) => request('/sessions', { query }),
    // PUBLIC_INTERFACE
    create: (data) => request('/sessions', { method: 'POST', body: data }),
    // PUBLIC_INTERFACE
    update: (id, data) => request(`/sessions/${id}`, { method: 'PUT', body: data }),
    // PUBLIC_INTERFACE
    remove: (id) => request(`/sessions/${id}`, { method: 'DELETE' }),
    // PUBLIC_INTERFACE
    start: (data) => request('/sessions/start', { method: 'POST', body: data }),
    // PUBLIC_INTERFACE
    stop: (id) => request(`/sessions/${id}/stop`, { method: 'POST' }),
  },
  /** Analytics - summaries */
  analytics: {
    // PUBLIC_INTERFACE
    summary: (range = 'daily') => request(`/analytics/${range}`),
  },
  /** Reports */
  reports: {
    // PUBLIC_INTERFACE
    exportPdf: (query) => request('/reports/export', { query }),
  },
};

export default api;

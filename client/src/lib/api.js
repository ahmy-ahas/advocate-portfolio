const BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`;
const TOKEN_KEY = 'advocate_token';

export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ } };

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

async function request(path, { method = 'GET', body, form, signal } = {}) {
  const headers = {};
  if (body && !form) headers['Content-Type'] = 'application/json';
  const needsAuth = path.startsWith('/admin') || path.startsWith('/auth');
  const token = getToken();
  if (needsAuth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, signal, body: form ? body : body ? JSON.stringify(body) : undefined });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    if (res.status === 401 && path.startsWith('/admin')) window.dispatchEvent(new Event('auth:expired'));
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status);
  }
  return data;
}

export const api = {
  get: (p, o) => request(p, o),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
  upload: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request('/admin/upload', { method: 'POST', body: fd, form: true });
  },
};

export const qs = (obj) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, v); });
  return p.toString();
};

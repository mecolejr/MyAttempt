const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) || 'http://localhost:4000'

export async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  if (path.startsWith('/api')) {
    const absolute = `${API_BASE}${path}`
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('tp_auth_token') : null
    const headers = new Headers(init?.headers || {})
    if (token) headers.set('x-auth-token', token)
    const res = await fetch(absolute, { ...init, headers })
    if (res.status === 401) {
      try { localStorage.removeItem('tp_auth_token') } catch {}
    }
    return res
  }
  return fetch(path, init)
}



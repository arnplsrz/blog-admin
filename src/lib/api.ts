const API_URL = import.meta.env.VITE_API_URL

export interface User {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'AUTHOR'
}

let token: string | null = null
let refreshing: Promise<{ accessToken: string; user: User } | null> | null = null

export const setToken = (t: string | null) => {
  token = t
}

export const refresh = () => {
  refreshing ??= fetch(`${API_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then(async (r) => (r.ok ? await r.json() : null))
    .catch(() => null)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

export const apiFetch = async <T = unknown>(path: string, init: RequestInit = {}): Promise<T> => {
  const send = () =>
    fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

  let res = await send()
  if (res.status === 401) {
    const data = await refresh()
    if (data) {
      token = data.accessToken
      res = await send()
    }
  }
  const body = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`)
  return body as T
}

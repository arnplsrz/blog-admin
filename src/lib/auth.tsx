import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router'
import { apiFetch, refresh, setToken, type User } from './api'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState>(null!)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refresh().then((data) => {
      if (data) {
        setToken(data.accessToken)
        setUser(data.user)
      }
      setLoading(false)
    })
  }, [])

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ accessToken: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data.user.role !== 'AUTHOR') throw new Error('AUTHOR role required')
    setToken(data.accessToken)
    setUser(data.user)
  }

  const logout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setToken(null)
    setUser(null)
  }

  return <AuthContext value={{ user, loading, login, logout }}>{children}</AuthContext>
}

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user?.role === 'AUTHOR' ? <Outlet /> : <Navigate to="/login" replace />
}

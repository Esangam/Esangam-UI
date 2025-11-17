import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../api/client'

export type Role = 'ES_ADMIN' | 'ADMIN' | 'MEMBER'

export type UserInfo = {
  mobile: string
  role: Role
  societyId?: number
  societyName?: string
}

type AuthContextType = {
  user: UserInfo | null
  token: string | null
  loading: boolean
  login: (mobile: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'esangam_token'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const setAuthToken = (t: string | null) => {
    if (t) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${t}`
    } else {
      delete apiClient.defaults.headers.common['Authorization']
    }
  }

  const fetchMe = async (): Promise<UserInfo | null> => {
    try {
      const res = await apiClient.get('/auth/me')
      const data = res.data
      const info: UserInfo = {
        mobile: data.mobile,
        role: data.role,
        societyId: data.societyId,
        societyName: data.societyName
      }
      setUser(info)
      return info
    } catch {
      setUser(null)
      return null
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY)
    if (saved) {
      setToken(saved)
      setAuthToken(saved)
      fetchMe().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (mobile: string, password: string) => {
    const res = await apiClient.post('/auth/login', { mobileNumber: mobile, password })
    const t = res.data.token as string
    setToken(t)
    window.localStorage.setItem(TOKEN_KEY, t)
    setAuthToken(t)
    const info = await fetchMe()
    if (!info) throw new Error('Failed to load user details')
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    window.localStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

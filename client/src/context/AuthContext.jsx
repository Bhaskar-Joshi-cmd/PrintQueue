import { createContext, useContext, useState, useEffect } from 'react'
import { apiFetch, setAuthToken } from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAuthToken(token)
    if (token && !user) {
      const fetchUser = async () => {
        try {
          const data = await apiFetch('/auth/me')
          setUser(data.data.user)
        } catch (error) {
          localStorage.removeItem('token')
          setToken(null)
          setAuthToken(null)
        } finally {
          setLoading(false)
        }
      }
      fetchUser()
    } else if (token) {
      setLoading(false)
    }
  }, [token, user])

  const register = async (formData) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
    return data
  }

  const login = async (formData) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
    const { token: newToken, user: userData } = data.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setAuthToken(newToken)
    setUser(userData)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setAuthToken(null)
    setUser(null)
  }

  const value = { user, token, loading, register, login, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth

// api.js — Thin fetch wrapper for the PrintQueue API.
// Reads the auth token from localStorage and sends it as a Bearer header.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

let token = null

export function setAuthToken(newToken) {
  token = newToken
}

export function apiFetch(path, options = {}) {
  // Read token from localStorage directly to avoid async state update race condition
  // This ensures the current token is always used, regardless of setToken() call timing
  const storedToken = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const error = new Error(data.message || 'Request failed')
      error.status = response.status
      error.data = data
      throw error
    }
    return data
  })
}

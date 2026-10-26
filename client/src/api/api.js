const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

let token = null

export function setAuthToken(newToken) {
  token = newToken
}

export function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
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

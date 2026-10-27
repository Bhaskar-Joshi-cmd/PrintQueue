// Login.jsx — Log in form. On success stores the token and goes to /dashboard.
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)
    try {
      await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      })
      // Both student and staff go to the same dashboard
      navigate('/dashboard')
    } catch {
      setMessage('Email or password is incorrect.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='page auth-page'>
      <div className='auth-card'>
        <h2>Log in</h2>
        {message && <p className='message error'>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className='field'>
            <label>Email</label>
            <input
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
              placeholder='aman@example.com'
              required
            />
          </div>
          <div className='field'>
            <label>Password</label>
            <input
              name='password'
              type='password'
              value={formData.password}
              onChange={handleChange}
              placeholder='••••••••'
              required
            />
          </div>
          <button type='submit' className='btn btn-primary' disabled={submitting}>
            {submitting ? 'Signing in...' : 'Log in'}
          </button>
        </form>
        <p className='auth-switch'>
          Don't have an account?{' '}
          <Link to='/register' className='link'>
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login

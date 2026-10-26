import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, loading: authLoading, _login } = useAuth()
  const navigate = useNavigate()

  // Auth guard: redirect to login if not authenticated
  if (!authLoading && user) {
    if (user.role === 'staff') {
      navigate('/staff/queue')
    } else {
      navigate('/dashboard')
    }
    return null
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({})
  }

  const validate = () => {
    const errs = {}
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required.'
    else if (formData.fullName.trim().length < 2 || formData.fullName.trim().length > 100)
      errs.fullName = 'Full name must be 2–100 characters.'
    if (!formData.email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = 'Enter a valid email address.'
    if (!formData.password) errs.password = 'Password is required.'
    else if (formData.password.length < 8)
      errs.password = 'Password must be at least 8 characters.'
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      })
      setMessage('Account created successfully. You can now log in.')
      setFormData({ fullName: '', email: '', password: '', confirmPassword: '' })
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }
      setMessage(err.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='page auth-page'>
      <div className='auth-card'>
        <h2>Create an account</h2>
        {message && <p className='message success'>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className='field'>
            <label>Full name</label>
            <input
              name='fullName'
              value={formData.fullName}
              onChange={handleChange}
              placeholder='Aman Sharma'
              required
            />
            {errors.fullName && <span className='error'>{errors.fullName}</span>}
          </div>
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
            {errors.email && <span className='error'>{errors.email}</span>}
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
            {errors.password && <span className='error'>{errors.password}</span>}
          </div>
          <div className='field'>
            <label>Confirm password</label>
            <input
              name='confirmPassword'
              type='password'
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder='••••••••'
              required
            />
            {errors.confirmPassword && <span className='error'>{errors.confirmPassword}</span>}
          </div>
          <button type='submit' className='btn btn-primary' disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className='auth-switch'>
          Already have an account?{' '}
          <Link to='/login' className='link'>
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register

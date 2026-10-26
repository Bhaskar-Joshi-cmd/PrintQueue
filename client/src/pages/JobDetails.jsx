import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/api'
import { useNavigate, useParams, Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import ErrorMessage from '../components/ErrorMessage'
import LoadingMessage from '../components/LoadingMessage'

function JobDetails() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')

  // Auth guard: redirect to login if not authenticated
  if (!authLoading && !user) {
    navigate('/login')
    return null
  }

  useEffect(() => {
    if (user) {
      fetchJob()
    }
  }, [id, user, fetchJob])

  const fetchJob = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch(`/jobs/${id}`)
      setJob(data.data.job || data.data)
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }
      setError(err.message || 'Failed to load job.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this job?')) return
    try {
      await apiFetch(`/jobs/${id}/cancel`, { method: 'PATCH' })
      setMessage('Job cancelled.')
      fetchJob()
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }
      setError(err.message || 'Failed to cancel job.')
    }
  }

  const isOwner = job && user && job.userId === user.id
  const isStaff = user && user.role === 'staff'

  let nextStatus = null
  let nextActionLabel = ''
  if (isStaff && job) {
    switch (job.status) {
      case 'queued':
        nextStatus = 'printing'
        nextActionLabel = 'Start printing'
        break
      case 'printing':
        nextStatus = 'ready_for_pickup'
        nextActionLabel = 'Mark ready for pickup'
        break
      case 'ready_for_pickup':
        nextStatus = 'completed'
        nextActionLabel = 'Mark completed'
        break
      default:
        break
    }
  }

  const handleStaffStatusUpdate = async () => {
    if (!nextStatus) return
    setError(null)
    try {
      await apiFetch(`/jobs/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      fetchJob()
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }
      setError(err.message || 'Failed to update status.')
    }
  }

  if (loading) {
    return <LoadingMessage message='Loading job details...' />
  }

  if (error || !job) {
    return (
      <div className='page job-detail'>
        {error && <ErrorMessage message={error} onRetry={fetchJob} />}
        {!error && <p>Job not found.</p>}
        <button className='btn btn-primary' onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className='page job-detail'>
      <div className='page-header'>
        <h1>Job details</h1>
        <Link to='/dashboard' className='btn btn-ghost'>Back</Link>
      </div>

      {message && <p className='message success'>{message}</p>}
      {error && <ErrorMessage message={error} onRetry={fetchJob} />}

      <div className='job-detail-card'>
        <div className='detail-row'>
          <span className='label'>Document label</span>
          <span className='value'>{job.documentName}</span>
        </div>
        <div className='detail-row'>
          <span className='label'>Pages</span>
          <span className='value'>{job.pages}</span>
        </div>
        <div className='detail-row'>
          <span className='label'>Copies</span>
          <span className='value'>{job.copies}</span>
        </div>
        <div className='detail-row'>
          <span className='label'>Print mode</span>
          <span className='value'>{job.printMode}</span>
        </div>
        <div className='detail-row'>
          <span className='label'>Sides</span>
          <span className='value'>{job.sides}-sided</span>
        </div>
        {job.notes && (
          <div className='detail-row'>
            <span className='label'>Note</span>
            <span className='value'>{job.notes}</span>
          </div>
        )}
        <div className='detail-row'>
          <span className='label'>Status</span>
          <span className='value'>
            <StatusBadge status={job.status} />
          </span>
        </div>
        <div className='detail-row'>
          <span className='label'>Submitted</span>
          <span className='value'>{new Date(job.createdAt).toLocaleString()}</span>
        </div>
        <div className='detail-row'>
          <span className='label'>Updated</span>
          <span className='value'>{new Date(job.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      <div className='job-actions'>
        {job.status === 'queued' && isOwner && (
          <>
            <button className='btn btn-outline' onClick={handleCancel}>
              Cancel job
            </button>
          </>
        )}
        {isStaff && nextStatus && (
          <button
            className='btn btn-primary'
            onClick={handleStaffStatusUpdate}
            disabled={job.status === 'completed' || job.status === 'cancelled'}
          >
            {nextActionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default JobDetails

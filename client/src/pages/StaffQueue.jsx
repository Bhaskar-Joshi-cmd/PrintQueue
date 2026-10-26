import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/api'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import LoadingMessage from '../components/LoadingMessage'
import ErrorMessage from '../components/ErrorMessage'

function StaffQueue() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  // Auth guard: redirect to login if not authenticated
  if (!authLoading && !user) {
    navigate('/login')
    return null
  }

  // Staff guard: redirect students to dashboard
  if (!authLoading && user && user.role !== 'staff') {
    navigate('/dashboard')
    return null
  }

  useEffect(async () => {
    if (user) {
      setLoading(true)
      setError(null)
      try {
        const url = `/jobs/queue${filterStatus ? `?status=${filterStatus}` : ''}`
        const data = await apiFetch(url)
        setJobs(data.data.jobs || data.data || [])
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          localStorage.removeItem('token')
          navigate('/login')
          return
        }
        setError(err.message || 'Failed to load queue.')
      } finally {
        setLoading(false)
      }
    }
  }, [filterStatus])

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = `/jobs/queue${filterStatus ? `?status=${filterStatus}` : ''}`
      const data = await apiFetch(url)
      setJobs(data.data.jobs || data.data || [])
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }
      setError(err.message || 'Failed to load queue.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (jobId, newStatus) => {
    setError(null)
    try {
      await apiFetch(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      fetchJobs()
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }
      setError(err.message || 'Failed to update job status.')
    }
  }

  const nextAction = (status) => {
    switch (status) {
      case 'queued':
        return { next: 'printing', label: 'Start printing' }
      case 'printing':
        return { next: 'ready_for_pickup', label: 'Mark ready for pickup' }
      case 'ready_for_pickup':
        return { next: 'completed', label: 'Mark completed' }
      default:
        return null
    }
  }

  const activeJobs = jobs.filter(
    (j) => j.status !== 'completed' && j.status !== 'cancelled'
  )

  return (
    <div className='page staff-queue'>
      <div className='page-header'>
        <h1>Staff queue</h1>
        <span className='role-badge'>Staff</span>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchJobs} />}

      {loading ? (
        <LoadingMessage message='Loading queue...' />
      ) : (
        <>
          <div className='filters'>
            <label>Filter by status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value=''>All active</option>
              <option value='queued'>Queued</option>
              <option value='printing'>Printing</option>
              <option value='ready_for_pickup'>Ready for pickup</option>
              <option value='completed'>Completed</option>
              <option value='cancelled'>Cancelled</option>
            </select>
          </div>

          <p className='queue-count'>
            {activeJobs.length} active job{activeJobs.length !== 1 ? 's' : ''}
          </p>

          {jobs.length === 0 ? (
            <EmptyState message='No jobs in the queue.' />
          ) : (
            <table className='queue-table'>
              <thead>
                <tr>
                  <th>Document label</th>
                  <th>Pages × Copies</th>
                  <th>Mode / Sides</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const action = nextAction(job.status)
                  return (
                    <tr key={job.id} className='queue-row'>
                      <td>
                        <strong>{job.documentName}</strong>
                      </td>
                      <td>{job.pages} × {job.copies}</td>
                      <td>{job.printMode} / {job.sides}</td>
                      <td>{new Date(job.createdAt).toLocaleString()}</td>
                      <td>
                        <StatusBadge status={job.status} />
                      </td>
                      <td>
                        {action && (
                          <button
                            className='btn btn-sm btn-primary'
                            onClick={() =>
                              handleStatusUpdate(job.id, action.next)
                            }
                          >
                            {action.label}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}

export default StaffQueue

// Dashboard.jsx — Student view (job list + cancel) and staff view (queue table).
// Students see their own jobs; staff see the full print queue.
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/api'
import { Link, useNavigate } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import LoadingMessage from '../components/LoadingMessage'
import ErrorMessage from '../components/ErrorMessage'

function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  const isStaff = user?.role === 'staff'

  // Redirect to login after authentication has been checked.
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [authLoading, user, navigate])

  // Fetch jobs for the staff queue or the logged-in student.
  const fetchJobs = useCallback(async () => {
    if (!user || authLoading) return

    setLoading(true)
    setError(null)

    try {
      const url = isStaff
        ? `/jobs/queue${filterStatus ? `?status=${filterStatus}` : ''}`
        : `/jobs/my${filterStatus ? `?status=${filterStatus}` : ''}`

      const response = await apiFetch(url)
      const result = response?.data

      setJobs(result?.jobs || result || [])
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
        return
      }

      setError(err.message || 'Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }, [user, authLoading, isStaff, filterStatus, navigate])

  // Load jobs when the user, role, or status filter changes.
  useEffect(() => {
    if (!authLoading && user) {
      fetchJobs()
    }
  }, [authLoading, user, fetchJobs])

  // Cancel a queued job.
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this job?')) {
      return
    }

    setError(null)

    try {
      await apiFetch(`/jobs/${id}/cancel`, {
        method: 'PATCH',
      })

      await fetchJobs()
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
        return
      }

      setError(err.message || 'Failed to cancel job.')
    }
  }

  // Update a job's status from the staff dashboard.
  const handleStatusUpdate = async (jobId, newStatus) => {
    setError(null)

    try {
      await apiFetch(`/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })

      await fetchJobs()
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
        return
      }

      setError(err.message || 'Failed to update job status.')
    }
  }

  // Download a job's document from Supabase storage.
  const handleDownload = async (jobId) => {
    setError(null)
    try {
      const data = await apiFetch(`/jobs/${jobId}/download-url`)
      const downloadUrl = data.data.downloadUrl
      window.open(downloadUrl, '_blank')
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
        return
      }
      setError(err.message || 'Failed to download file.')
    }
  }

  // Determine the next permitted action for a job.
  const nextAction = (status) => {
    switch (status) {
      case 'queued':
        return {
          next: 'printing',
          label: 'Start printing',
        }

      case 'printing':
        return {
          next: 'ready_for_pickup',
          label: 'Mark ready for pickup',
        }

      case 'ready_for_pickup':
        return {
          next: 'completed',
          label: 'Mark completed',
        }

      default:
        return null
    }
  }

  // Calculate counts for the status summary.
  const counts = {
    queued: jobs.filter((job) => job.status === 'queued').length,
    printing: jobs.filter((job) => job.status === 'printing').length,
    ready: jobs.filter(
      (job) => job.status === 'ready_for_pickup'
    ).length,
    completed: jobs.filter(
      (job) => job.status === 'completed'
    ).length,
  }

  // Apply the selected status filter to the displayed jobs.
  const filteredJobs = filterStatus
    ? jobs.filter((job) => job.status === filterStatus)
    : jobs

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Wait until authentication has been checked.
  if (authLoading) {
    return <LoadingMessage message='Checking your session...' />
  }

  if (!user) {
    return null
  }

  return (
    <div className='page dashboard'>
      <div className='page-header'>
        <h1>Dashboard</h1>

        <div className='user-greeting'>
          Welcome, {user.fullName}{' '}
          <span className='role-badge'>
            ({user.role})
          </span>
        </div>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchJobs}
        />
      )}

      {loading ? (
        <LoadingMessage message='Loading jobs...' />
      ) : (
        <>
          {/* Job status summary */}
          <div className='status-summary'>
            <div className='summary-card'>
              <span className='count'>{counts.queued}</span>
              <span className='label'>Queued</span>
            </div>

            <div className='summary-card'>
              <span className='count'>{counts.printing}</span>
              <span className='label'>Printing</span>
            </div>

            <div className='summary-card'>
              <span className='count'>{counts.ready}</span>
              <span className='label'>Ready</span>
            </div>

            <div className='summary-card'>
              <span className='count'>{counts.completed}</span>
              <span className='label'>Completed</span>
            </div>
          </div>

          {/* Status filter */}
          <div className='filters'>
            <label htmlFor='status-filter'>
              Filter by status:
            </label>

            <select
              id='status-filter'
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(event.target.value)
              }
            >
              <option value=''>All</option>
              <option value='queued'>Queued</option>
              <option value='printing'>Printing</option>
              <option value='ready_for_pickup'>
                Ready for pickup
              </option>
              <option value='completed'>Completed</option>
              <option value='cancelled'>Cancelled</option>
            </select>
          </div>

          {/* Role-based dashboard */}
          {isStaff ? (
            // STAFF VIEW
            <>
              <p className='queue-count'>
                {filteredJobs.length} job
                {filteredJobs.length !== 1 ? 's' : ''}
              </p>

              <table className='queue-table'>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Document label</th>
                    <th>Pages × Copies</th>
                    <th>Mode / Sides</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Document</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredJobs.map((job) => {
                    const action = nextAction(job.status)

                    return (
                      <tr
                        key={job.id}
                        className='queue-row'
                      >
                        <td>
                          {job.studentName || 'Unknown'}
                          <br />
                          <small>
                            {job.studentEmail || ''}
                          </small>
                        </td>

                        <td>
                          <strong>{job.documentName}</strong>
                        </td>

                        <td>
                          {job.pages} × {job.copies}
                        </td>

                        <td>
                          {job.printMode} / {job.sides}
                        </td>

                        <td>
                          {new Date(
                            job.createdAt
                          ).toLocaleString()}
                        </td>

                        <td>
                          <StatusBadge status={job.status} />
                        </td>

                        <td>
                          {job.documentStoragePath && job.status !== 'completed' ? (
                            <button
                              type='button'
                              className='btn btn-sm btn-outline'
                              onClick={() => handleDownload(job.id)}
                              title='Download document'
                            >
                              ⬇
                            </button>
                          ) : (
                            <span className='hint' style={{ fontSize: '0.75rem' }}>
                              —
                            </span>
                          )}
                        </td>

                        <td>
                          {action && (
                            <button
                              type='button'
                              className='btn btn-sm btn-primary'
                              onClick={() =>
                                handleStatusUpdate(
                                  job.id,
                                  action.next
                                )
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
            </>

          ) : (
            // STUDENT VIEW
            <>
              {filteredJobs.length === 0 ? (
                <EmptyState
                  message='You have no print requests yet.'
                />
              ) : (
                <ul className='job-list'>
                  {filteredJobs.map((job) => (
                    <li
                      key={job.id}
                      className='job-card'
                    >
                      <Link to={`/jobs/${job.id}`}>
                        <div className='job-info'>
                          <h3>{job.documentName}</h3>

                          <p>
                            {job.pages} page
                            {job.pages !== 1 ? 's' : ''} ×{' '}
                            {job.copies} cop
                            {job.copies !== 1 ? 'ies' : 'y'}
                          </p>

                          <p className='job-meta'>
                            {job.printMode} • {job.sides}-sided
                          </p>

                          <p className='job-date'>
                            {new Date(
                              job.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>

                      <div className='job-actions'>
                        <StatusBadge status={job.status} />

                        {job.status === 'queued' && (
                          <button
                            type='button'
                            className='btn btn-sm btn-outline'
                            onClick={() =>
                              handleCancel(job.id)
                            }
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Student actions */}
              <div className='dashboard-actions'>
                <Link
                  to='/jobs/new'
                  className='btn btn-primary'
                >
                  New print request
                </Link>

                <button
                  type='button'
                  className='btn btn-ghost'
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

function JobCard({ job, onCancel }) {
  const canCancel = job.status === 'queued'

  return (
    <div className='job-card'>
      <Link to={`/jobs/${job.id}`}>
        <div className='job-info'>
          <h3>{job.documentName}</h3>
          <p>
            {job.pages} page{job.pages !== 1 ? 's' : ''} ×{' '}
            {job.copies} copy{job.copies !== 1 ? 's' : ''}
          </p>
          <p className='job-meta'>{job.printMode} • {job.sides}-sided</p>
          <p className='job-date'>
            {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
      </Link>
      <div className='job-actions'>
        <StatusBadge status={job.status} />
        {canCancel && onCancel && (
          <button className='btn btn-sm btn-outline' onClick={() => onCancel(job.id)}>
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default JobCard

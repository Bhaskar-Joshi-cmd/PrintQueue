function EmptyState({ message }) {
  return (
    <div className='empty-state'>
      <p>{message || 'No jobs found.'}</p>
    </div>
  )
}

export default EmptyState

function StatusBadge({ status }) {
  const colors = {
    queued: 'status-queued',
    printing: 'status-printing',
    ready_for_pickup: 'status-ready',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  }
  const label = {
    queued: 'Queued',
    printing: 'Printing',
    ready_for_pickup: 'Ready for pickup',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  const cls = colors[status] || 'status-queued'
  const text = label[status] || status

  return (
    <span className={cls}>
      {text}
    </span>
  )
}

export default StatusBadge

// LoadingMessage.jsx — Shown while a request is in progress.
function LoadingMessage({ message }) {
  return (
    <div className='loading-message'>
      <p>{message || 'Loading...'}</p>
    </div>
  )
}

export default LoadingMessage

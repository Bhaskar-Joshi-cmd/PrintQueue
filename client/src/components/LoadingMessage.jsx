function LoadingMessage({ message }) {
  return (
    <div className='loading-message'>
      <p>{message || 'Loading...'}</p>
    </div>
  )
}

export default LoadingMessage

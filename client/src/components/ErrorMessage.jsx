import { useState } from 'react'

function ErrorMessage({ message, onRetry }) {
  const [visible, _setVisible] = useState(!!message)

  if (!visible) return null

  return (
    <div className='error-message'>
      <p>{message}</p>
      {onRetry && (
        <button onClick={() => onRetry()}>Retry</button>
      )}
    </div>
  )
}

export default ErrorMessage

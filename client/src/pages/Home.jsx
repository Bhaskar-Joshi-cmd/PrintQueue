import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Auth guard: redirect logged-in users to their dashboard
  if (!authLoading && user) {
    if (user.role === 'staff') {
      navigate('/staff/queue')
    } else {
      navigate('/dashboard')
    }
    return null
  }

  return (
    <div className='page home'>
      <div className='hero'>
        <h1>PrintQueue</h1>
        <p>Submit a print request and track its progress from your device.</p>
        <p>
          The app tracks your print job status; the physical document is still
          handled by the campus print shop.
        </p>
        <div className='hero-actions'>
          <Link to='/login' className='btn btn-primary'>Log in</Link>
          <Link to='/register' className='btn btn-outline'>Register</Link>
        </div>
      </div>
    </div>
  )
}

export default Home

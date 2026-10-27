// Navbar.jsx — Top navigation: app brand, dashboard/new-job links,
// current user name/role, and logout button.
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className='navbar'>
      <div className='nav-brand'>
        <Link to='/'>PrintQueue</Link>
      </div>
      <div className='nav-links'>
        {user ? (
          <>
            <Link to='/dashboard'>Dashboard</Link>
            {user.role === 'student' && <Link to='/jobs/new'>New Job</Link>}
            <span className='user-name'>
              {user.fullName} ({user.role})
            </span>
            <button className='btn btn-ghost' onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar

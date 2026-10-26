import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className='page not-found'>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to='/' className='btn btn-primary'>Go home</Link>
    </div>
  )
}

export default NotFound

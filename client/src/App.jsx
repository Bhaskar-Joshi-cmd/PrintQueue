import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewJob from './pages/NewJob'
import JobDetails from './pages/JobDetails'
import StaffQueue from './pages/StaffQueue'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <div className='app'>
        <Navbar />
        <main>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/jobs/new' element={<NewJob />} />
            <Route path='/jobs/:id' element={<JobDetails />} />
            <Route path='/staff/queue' element={<StaffQueue />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

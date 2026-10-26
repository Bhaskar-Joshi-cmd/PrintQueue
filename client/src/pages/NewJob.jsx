import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/api'
import { useNavigate } from 'react-router-dom'

function NewJob() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    documentName: '',
    pages: '',
    copies: '1',
    printMode: 'mono',
    sides: 'double',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Auth guard: redirect to login if not authenticated
  if (!authLoading && !user) {
    navigate('/login')
    return null
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    setErrors({})
  }

  const validate = () => {
    const errs = {}
    if (!formData.documentName.trim())
      errs.documentName = 'Document label is required.'
    else if (formData.documentName.trim().length > 120)
      errs.documentName = 'Label must be 120 characters or fewer.'
    const pagesNum = parseInt(formData.pages, 10)
    if (!formData.pages || isNaN(pagesNum) || pagesNum < 1 || pagesNum > 500)
      errs.pages = 'Pages must be between 1 and 500.'
    const copiesNum = parseInt(formData.copies, 10)
    if (!formData.copies || isNaN(copiesNum) || copiesNum < 1 || copiesNum > 20)
      errs.copies = 'Copies must be between 1 and 20.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    try {
      await apiFetch('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          documentName: formData.documentName.trim(),
          pages: parseInt(formData.pages, 10),
          copies: parseInt(formData.copies, 10),
          printMode: formData.printMode,
          sides: formData.sides,
          notes: formData.notes.trim() || null,
        }),
      })
      setMessage('Print request created successfully.')
      setFormData({
        documentName: '',
        pages: '',
        copies: '1',
        printMode: 'mono',
        sides: 'double',
        notes: '',
      })
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }
      setMessage(err.message || 'Failed to create print request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='page new-job'>
      <div className='page-header'>
        <h1>New print request</h1>
      </div>
      {message && <p className='message success'>{message}</p>}
      <form onSubmit={handleSubmit} className='job-form'>
        <div className='field'>
          <label>Document label</label>
          <input
            name='documentName'
            value={formData.documentName}
            onChange={handleChange}
            placeholder='DBMS assignment'
            maxLength='120'
            required
          />
          <p className='hint'>A label only — the document is not uploaded.</p>
          {errors.documentName && <span className='error'>{errors.documentName}</span>}
        </div>
        <div className='field'>
          <label>Number of pages</label>
          <input
            name='pages'
            type='number'
            min='1'
            max='500'
            value={formData.pages}
            onChange={handleChange}
            required
          />
          {errors.pages && <span className='error'>{errors.pages}</span>}
        </div>
        <div className='field'>
          <label>Number of copies</label>
          <input
            name='copies'
            type='number'
            min='1'
            max='20'
            value={formData.copies}
            onChange={handleChange}
            required
          />
          {errors.copies && <span className='error'>{errors.copies}</span>}
        </div>
        <div className='field'>
          <label>Print mode</label>
          <select name='printMode' value={formData.printMode} onChange={handleChange}>
            <option value='mono'>Black and white (mono)</option>
            <option value='color'>Colour (color)</option>
          </select>
        </div>
        <div className='field'>
          <label>Sides</label>
          <select name='sides' value={formData.sides} onChange={handleChange}>
            <option value='single'>Single-sided</option>
            <option value='double'>Double-sided</option>
          </select>
        </div>
        <div className='field'>
          <label>Optional note</label>
          <textarea
            name='notes'
            value={formData.notes}
            onChange={handleChange}
            maxLength='300'
            placeholder='Please staple the pages'
          />
          <p className='hint'>Maximum 300 characters. Do not enter private information.</p>
        </div>
        <div className='form-actions'>
          <button type='submit' className='btn btn-primary' disabled={submitting}>
            {submitting ? 'Creating...' : 'Submit request'}
          </button>
          <button type='button' className='btn btn-ghost' onClick={() => window.history.back()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewJob

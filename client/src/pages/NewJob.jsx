// NewJob.jsx — Student submits a print request (label, pages, copies, etc.)
// and optionally uploads a document file to Supabase storage.
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
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileInputKey, setFileInputKey] = useState(0)

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

  const validateFile = (file) => {
    const errs = {}
    if (!file) {
      // File is optional — no validation errors
      return errs
    } else {
      const fileName = file.name.toLowerCase()
      const allowedExtensions = [
        '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png',
      ]
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
      ]
      const hasValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext))
      if (!hasValidExt) {
        errs.file = 'Only PDF, Word, PowerPoint, and image files are allowed.'
      } else if (file.type && !allowedMimeTypes.includes(file.type)) {
        errs.file = 'Only PDF, Word, PowerPoint, and image files are allowed.'
      } else if (file.size > 10 * 1024 * 1024) {
        errs.file = 'File must be less than 10 MB.'
      }
    }
    return errs
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
    const fileErrs = validateFile(file)
    const { file: _, ...restErrors } = errors
    setErrors({ ...restErrors, ...fileErrs })
    if (file && !fileErrs.file) {
      setMessage(`Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`)
    } else if (file) {
      setMessage('')
    }
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
      // If a file is selected, handle upload workflow
      if (selectedFile) {
        const fileErrs = validateFile(selectedFile)
        if (Object.keys(fileErrs).length > 0) {
          const { file: _, ...restErrors } = errors
          setErrors({ ...restErrors, ...fileErrs })
          setSubmitting(false)
          return
        }
        // Step 1: Get signed upload URL from backend
        // apiFetch already attaches the Authorization header from localStorage
        const uploadResponse = await apiFetch('/jobs/upload-url', {
          method: 'POST',
          body: JSON.stringify({
            mimeType: selectedFile.type,
            fileSize: selectedFile.size,
            originalName: selectedFile.name,
          }),
        })
        if (!uploadResponse || !uploadResponse.data) {
          throw new Error('Invalid response from upload-url endpoint.')
        }
        const { signedUrl: uploadUrl, storagePath } = uploadResponse.data
        // Step 2: Upload the file to Supabase Storage using signed URL
        const upload = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': selectedFile.type,
            'Authorization': `Bearer ${uploadResponse.data.token}`,
          },
          body: selectedFile,
        })
        if (!upload.ok) {
          const body = await upload.text().catch(() => '')
          throw new Error(`File upload to storage failed (${upload.status}): ${body || upload.statusText}`)
        }
        // Step 3: Submit print job with document info
        await apiFetch('/jobs', {
          method: 'POST',
          body: JSON.stringify({
            documentName: formData.documentName.trim(),
            pages: parseInt(formData.pages, 10),
            copies: parseInt(formData.copies, 10),
            printMode: formData.printMode,
            sides: formData.sides,
            notes: formData.notes.trim() || null,
            document_storage_path: storagePath,
            document_original_name: selectedFile.name,
            document_size: selectedFile.size
          }),
        })
        setMessage('Print request created successfully.')
      } else {
        // No PDF - submit job without document (existing behavior)
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
      }
      setFormData({
        documentName: '',
        pages: '',
        copies: '1',
        printMode: 'mono',
        sides: 'double',
        notes: '',
      })
      setSelectedFile(null)
      setFileInputKey((prev) => prev + 1)
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }
      setErrorMessage(String(err.message || 'Failed to create print request.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='page new-job'>
      <div className='page-header'>
        <h1>New print request</h1>
      </div>
      {message && <p className='message success'>{String(message)}</p>}
      {errorMessage && <p className='message error'>{String(errorMessage)}</p>}
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
        <div className='field'>
          <label>Document file (optional)</label>
          <input
            key={fileInputKey}
            type='file'
            accept='.pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png'
            onChange={handleFileChange}
          />
          <p className='hint'>Upload a PDF, Word, PowerPoint, or image file (max 10 MB).</p>
          {errors.file && <span className='error'>{errors.file}</span>}
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

// Job controllers: list my jobs, create job, get job, update job, cancel job,
// list staff queue, update job status, create upload URL, get download URL.
// mapJob converts database snake_case columns to camelCase for the frontend.
const { supabase } = require('../config/supabase')
const { validateJob, validateStatusTransition } = require('../utils/validation')

function mapJob(dbJob) {
  return {
    id: dbJob.id,
    userId: dbJob.user_id,
    documentName: dbJob.document_name,
    pages: dbJob.pages,
    copies: dbJob.copies,
    printMode: dbJob.print_mode,
    sides: dbJob.sides,
    notes: dbJob.notes,
    documentStoragePath: dbJob.document_storage_path,
    documentOriginalName: dbJob.document_original_name,
    documentSize: dbJob.document_size,
    status: dbJob.status,
    createdAt: dbJob.created_at,
    updatedAt: dbJob.updated_at,
  }
}

async function listMyJobs(req, res, next) {
  try {
    const userId = req.user.id
    const { status, search } = req.query

    let query = supabase
      .from('print_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.ilike('document_name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return res.status(200).json({ success: true, data: { jobs: (data || []).map(mapJob) } })
  } catch (err) {
    next(err)
  }
}

async function createJob(req, res, next) {
  try {
    const { errors, documentName, pages, copies, printMode, sides, notes, isValid } = validateJob(req.body)
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Please check the form.', errors })
    }

    const { data, error } = await supabase
      .from('print_jobs')
      .insert([{
        user_id: req.user.id,
        document_name: documentName,
        pages,
        copies,
        print_mode: printMode,
        sides,
        notes: notes || null,
        document_storage_path: req.body.document_storage_path || null,
        document_original_name: req.body.document_original_name || null,
        document_size: req.body.document_size || null,
        status: 'queued',
      }])
      .select()
      .single()

    if (error) throw error

    return res.status(201).json({ success: true, data: { job: mapJob(data) } })
  } catch (err) {
    next(err)
  }
}

async function getJob(req, res, next) {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Job not found.' })
    }

    const isOwner = data.user_id === req.user.id
    const isStaff = req.user.role === 'staff'

    if (!isOwner && !isStaff) {
      return res.status(404).json({ success: false, message: 'Job not found.' })
    }

    return res.status(200).json({ success: true, data: { job: mapJob(data) } })
  } catch (err) {
    next(err)
  }
}

module.exports = { listMyJobs, createJob, getJob }

async function updateJob(req, res, next) {
  try {
    const { id } = req.params
    const { errors, documentName, pages, copies, printMode, sides, notes, isValid } = validateJob(req.body)
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Please check the form.', errors })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Job not found.' })
    }

    if (existing.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Job not found.' })
    }

    if (existing.status !== 'queued') {
      return res.status(409).json({ success: false, message: 'Only queued jobs can be edited.' })
    }

    const { data, error } = await supabase
      .from('print_jobs')
      .update({
        document_name: documentName,
        pages,
        copies,
        print_mode: printMode,
        sides,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({ success: true, data: { job: mapJob(data) } })
  } catch (err) {
    next(err)
  }
}

async function cancelJob(req, res, next) {
  try {
    const { id } = req.params

    const { data: existing, error: fetchError } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Job not found.' })
    }

    if (existing.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Job not found.' })
    }

    if (existing.status !== 'queued') {
      return res.status(409).json({ success: false, message: 'Only queued jobs can be cancelled.' })
    }

    const { data, error } = await supabase
      .from('print_jobs')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({ success: true, data: { job: mapJob(data) } })
  } catch (err) {
    next(err)
  }
}

async function listQueue(req, res, next) {
  try {
    const { status } = req.query

    let query = supabase
      .from('print_jobs')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    const jobs = (data || []).map((row) => {
      const job = mapJob(row)
      job.studentName = row.users?.full_name
      job.studentEmail = row.users?.email
      return job
    })

    return res.status(200).json({ success: true, data: { jobs } })
  } catch (err) {
    next(err)
  }
}

async function updateJobStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status: newStatus } = req.body

    if (!newStatus) {
      return res.status(400).json({ success: false, message: 'Status is required.' })
    }

    const { data: existing, error: fetchError } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({ success: false, message: 'Job not found.' })
    }

    if (!validateStatusTransition(existing.status, newStatus)) {
      return res.status(409).json({
        success: false,
        message: `Cannot move job from ${existing.status} to ${newStatus}.`,
      })
    }

    const { data, error } = await supabase
      .from('print_jobs')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Auto-delete file from Supabase bucket when job is completed
    if (newStatus === 'completed' && existing.document_storage_path) {
      const { supabase } = require('../config/supabase')
      await supabase.storage
        .from('printqueue-documents')
        .remove([existing.document_storage_path])
    }

    return res.status(200).json({ success: true, data: { job: mapJob(data) } })
  } catch (err) {
    next(err)
  }
}

async function createUploadUrl(req, res, next) {
  try {
    // Authenticate student
    const { user } = req

    // Only students can upload PDFs
    if (!user || user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Student access required.' })
    }

    const { mimeType, fileSize, originalName } = req.body

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
    ]
    const mimeToExt = {
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-powerpoint': '.ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
      'image/jpeg': '.jpg',
      'image/png': '.png',
    }
    if (!mimeType || !allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ success: false, message: 'Only PDF, Word, PowerPoint, and image files are allowed.' })
    }

    // Validate file size (10 MB limit)
    const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
    if (!fileSize || fileSize > MAX_SIZE) {
      return res.status(400).json({ success: false, message: 'File must be less than 10 MB.' })
    }

    // Generate unique storage path: <user-id>/<random-unique-id><ext>
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const ext = mimeToExt[mimeType] || '.bin'
    const storagePath = user.id + '/' + randomId + ext

    // Generate Supabase signed upload URL using backend secret key
    const { supabase } = require('../config/supabase')

    const { data, error } = await supabase.storage
      .from('printqueue-documents')
      .createSignedUploadUrl(storagePath)

    if (error) throw error

    return res.status(200).json({
      success: true,
      data: {
        signedUrl: data.signedUrl,
        token: data.token,
        storagePath: storagePath,
        originalName: originalName || 'document.pdf',
        fileSize: fileSize
      }
    })
  } catch (err) {
    next(err)
  }
}

async function getDownloadUrl(req, res, next) {
  try {
    const { id } = req.params

    // Look up the job from PostgreSQL
    const { data: job, error: fetchError } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !job) {
      return res.status(404).json({ success: false, message: 'Job not found.' })
    }

    // Check authentication
    const { user } = req

    if (!user) {
      return res.status(401).json({ success: false, message: 'Access token required.' })
    }

    // Staff can download any job's PDF.
    // A student can only download their own PDF.
    const isStaff = user.role === 'staff'
    const isOwner = job.user_id === user.id

    if (!isStaff && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied.' })
    }

    // Generate a signed download URL (valid for 120 seconds).
    const { data, error } = await supabase.storage
      .from('printqueue-documents')
      .createSignedUrl(job.document_storage_path, 120)

    if (error) {
      if (error.status === 404 || error.statusText === 'Not Found') {
        return res.status(404).json({ success: false, message: 'File not found.' })
      }
      throw error
    }

    return res.status(200).json({
      success: true,
      data: {
        downloadUrl: data.signedUrl,
        storagePath: job.document_storage_path,
        originalName: job.document_original_name
      }
    })
  } catch (err) {
    next(err)
  }
}

module.exports.updateJob = updateJob
module.exports.cancelJob = cancelJob
module.exports.createUploadUrl = createUploadUrl
module.exports.getDownloadUrl = getDownloadUrl
module.exports.listQueue = listQueue
module.exports.updateJobStatus = updateJobStatus


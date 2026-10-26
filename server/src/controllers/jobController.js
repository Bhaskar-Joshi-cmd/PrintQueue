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

    return res.status(200).json({ success: true, data: { job: mapJob(data) } })
  } catch (err) {
    next(err)
  }
}

module.exports.updateJob = updateJob
module.exports.cancelJob = cancelJob
module.exports.listQueue = listQueue
module.exports.updateJobStatus = updateJobStatus


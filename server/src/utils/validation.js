function validateRegistration(body) {
  const errors = {}

  const fullName = String(body.fullName || '').trim()
  if (!fullName) {
    errors.fullName = 'Full name is required.'
  } else if (fullName.length < 2 || fullName.length > 100) {
    errors.fullName = 'Full name must be 2–100 characters.'
  }

  const email = String(body.email || '').trim().toLowerCase()
  if (!email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  const password = String(body.password || '')
  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  return { errors, fullName, email, password, isValid: Object.keys(errors).length === 0 }
}

function validateLogin(body) {
  const errors = {}

  const email = String(body.email || '').trim().toLowerCase()
  if (!email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  const password = String(body.password || '')
  if (!password) {
    errors.password = 'Password is required.'
  }

  return { errors, email, password, isValid: Object.keys(errors).length === 0 }
}

function validateJob(body) {
  const errors = {}

  const documentName = String(body.documentName || '').trim()
  if (!documentName) {
    errors.documentName = 'Document label is required.'
  } else if (documentName.length > 120) {
    errors.documentName = 'Label must be 120 characters or fewer.'
  }

  const pages = parseInt(body.pages, 10)
  if (!body.pages || isNaN(pages) || pages < 1 || pages > 500) {
    errors.pages = 'Pages must be between 1 and 500.'
  }

  const copies = parseInt(body.copies, 10)
  if (!body.copies || isNaN(copies) || copies < 1 || copies > 20) {
    errors.copies = 'Copies must be between 1 and 20.'
  }

  const printMode = body.printMode || 'mono'
  if (!['mono', 'color'].includes(printMode)) {
    errors.printMode = 'Print mode must be mono or color.'
  }

  const sides = body.sides || 'single'
  if (!['single', 'double'].includes(sides)) {
    errors.sides = 'Sides must be single or double.'
  }

  const notes = body.notes ? String(body.notes).trim() : null
  if (notes && notes.length > 300) {
    errors.notes = 'Note must be 300 characters or fewer.'
  }

  return {
    errors,
    documentName,
    pages,
    copies,
    printMode,
    sides,
    notes,
    isValid: Object.keys(errors).length === 0,
  }
}

function validateStatusTransition(currentStatus, newStatus) {
  const allowed = {
    queued: ['printing'],
    printing: ['ready_for_pickup'],
    ready_for_pickup: ['completed'],
  }
  const next = allowed[currentStatus]
  return next && next.includes(newStatus)
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateJob,
  validateStatusTransition,
}

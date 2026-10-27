// Central Express error handler.
// Turns thrown errors into consistent JSON error responses.
function errorMiddleware(err, req, res, next) {
  console.error(err.stack || err.message || err)

  // Already-formatted error responses from controllers
  if (err.status && err.message) {
    return res.status(err.status).json({ success: false, message: err.message })
  }

  // Supabase errors
  if (err.code && err.message) {
    // Duplicate email (unique violation)
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already registered.' })
    }
    return res.status(500).json({ success: false, message: 'Database error.' })
  }

  res.status(500).json({ success: false, message: 'Internal server error.' })
}

module.exports = errorMiddleware

// Auth middleware for Express.
// authenticateToken: verifies the JWT and attaches req.user.
// requireStaff: allows access only when req.user.role is 'staff'.
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET || JWT_SECRET === 'REPLACE_WITH_A_LONG_RANDOM_SECRET') {
  throw new Error('JWT_SECRET must be set in server/.env')
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required.' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' })
    }
    req.user = user // { id, role }
    next()
  })
}

function requireStaff(req, res, next) {
  if (!req.user || req.user.role !== 'staff') {
    return res.status(403).json({ success: false, message: 'Staff access required.' })
  }
  next()
}

module.exports = { authenticateToken, requireStaff }

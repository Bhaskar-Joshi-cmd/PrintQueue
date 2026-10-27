// Auth routes: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me.
const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/authMiddleware')
const { register, login, me } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticateToken, me)

module.exports = router

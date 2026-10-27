// Job routes mounted at /api/jobs:
// GET /my, POST /, POST /upload-url, GET /queue, PATCH /:id/status,
// GET /:id/download-url, GET /:id, PATCH /:id, PATCH /:id/cancel.
const express = require('express')
const router = express.Router()
const { authenticateToken, requireStaff } = require('../middleware/authMiddleware')
const {
  listMyJobs,
  createJob,
  getJob,
  updateJob,
  cancelJob,
  listQueue,
  updateJobStatus,
  createUploadUrl,
  getDownloadUrl,
} = require('../controllers/jobController')

// Student routes — specific routes first, then parameterized
router.get('/my', authenticateToken, listMyJobs)
router.post('/', authenticateToken, createJob)
router.post('/upload-url', authenticateToken, createUploadUrl)

// Staff routes — specific routes first, then parameterized
router.get('/queue', authenticateToken, requireStaff, listQueue)
router.patch('/:id/status', authenticateToken, requireStaff, updateJobStatus)
router.get('/:id/download-url', authenticateToken, getDownloadUrl)

// Parameterized routes (must come after specific routes above)
router.get('/:id', authenticateToken, getJob)
router.patch('/:id', authenticateToken, updateJob)
router.patch('/:id/cancel', authenticateToken, cancelJob)

module.exports = router

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const errorMiddleware = require('./src/middleware/errorMiddleware')
const authRoutes = require('./src/routes/authRoutes')
const jobRoutes = require('./src/routes/jobRoutes')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)

app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`PrintQueue API running on http://localhost:${PORT}`)
})

module.exports = app

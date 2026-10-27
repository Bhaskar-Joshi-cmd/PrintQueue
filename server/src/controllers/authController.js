// Auth controllers: register, login, and me (get current user).
// Hashes passwords with bcrypt, signs JWTs, and talks to Supabase 'users' table.
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { supabase } = require('../config/supabase')
const {
  validateRegistration,
  validateLogin,
} = require('../utils/validation')

const JWT_SECRET = process.env.JWT_SECRET

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '4h',
  })
}

function mapUser(dbUser) {
  return {
    id: dbUser.id,
    fullName: dbUser.full_name,
    email: dbUser.email,
    role: dbUser.role,
    createdAt: dbUser.created_at,
  }
}

async function register(req, res, next) {
  try {
    const { errors, fullName, email, password, isValid } = validateRegistration(req.body)
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Please check the form.', errors })
    }

    // Check for duplicate email
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from('users')
      .insert([{ full_name: fullName, email, password_hash: passwordHash, role: 'student' }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Email already registered.' })
      }
      throw error
    }

    const user = mapUser(data)
    const token = signToken(user)

    return res.status(201).json({ success: true, data: { user, token } })
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { errors, email, password, isValid } = validateLogin(req.body)
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Please check the form.', errors })
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect.' })
    }

    const valid = await bcrypt.compare(password, data.password_hash)
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect.' })
    }

    const user = mapUser(data)
    const token = signToken(user)

    return res.status(200).json({ success: true, data: { token, user } })
  } catch (err) {
    next(err)
  }
}

async function me(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .eq('id', req.user.id)
      .single()

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    const user = mapUser(data)
    return res.status(200).json({ success: true, data: { user } })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, me }

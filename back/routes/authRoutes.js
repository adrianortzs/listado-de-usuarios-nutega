const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { sql } = require('../config/db')

const router = express.Router()
const SECRET_KEY = process.env.SECRET_KEY || 'GoLdEiNiEsTa6'

router.post('/', async (req, res) => {
  const { username, password } = req.body

  try {
    const result = await sql.query`SELECT * FROM Usuarios WHERE email = ${username}`
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Usuario no existe' })
    }

    const user = result.recordset[0]
    const passwordMatch = await bcrypt.compare(password, user.clave)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' })

    res.json({ redirect: user.email === 'admin' ? '/admin-dashboard.html' : '/dashboard.html', token })
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' })
  }
})

module.exports = router

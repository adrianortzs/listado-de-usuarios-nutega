const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { sql } = require('../config/db')

const router = express.Router()
const SECRET_KEY = process.env.SECRET_KEY || 'GoLdEiNiEsTa6'

async function verifyAdmin(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' })

  const token = authHeader.split(' ')[1]
  try {
    const { email } = jwt.verify(token, SECRET_KEY)
    if (email !== 'admin') return res.status(403).json({ error: 'Acceso denegado' })
    next()
  } catch {
    res.status(403).json({ error: 'Token inválido o expirado' })
  }
}

router.get('/', async (req, res) => {
  const authHeader = req.headers['authorization']

  if (!authHeader) {
    return res.status(401).json({ error: 'No se proporcionó el header de autorización' })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Token no presente' })
  }

  try {
    const { username } = jwt.verify(token, SECRET_KEY)

    const result = await sql.query`
      SELECT email, url_logo, url_iframe FROM Usuarios WHERE email = ${username}
    `

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const userData = {
      username: result.recordset[0].email,
      logo: result.recordset[0].url_logo,
      iframeURL: result.recordset[0].url_iframe
    }

    return res.json(userData)
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }
})

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const result = await sql.query`SELECT email, url_logo FROM Usuarios`
    res.json(result.recordset)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
})

router.post('/', verifyAdmin, async (req, res) => {
  const { username, password, url_logo, url_iframe } = req.body

  if (!username || !password || !url_logo || !url_iframe) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    await sql.query`
      INSERT INTO Usuarios (email, clave, url_logo, url_iframe)
      VALUES (${username}, ${hashedPassword}, ${url_logo}, ${url_iframe})
    `

    res.status(201).json({ message: 'Usuario creado correctamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' })
  }
})

router.put('/:user', verifyAdmin, async (req, res) => {
  const { user } = req.params
  const { username, password, url_logo, url_iframe } = req.body
  let hashedPassword = null

  if (password) {
    hashedPassword = await bcrypt.hash(password, 10)
  }

  try {
    await sql.query`
      UPDATE Usuarios
      SET email = COALESCE(${username}, email),
          clave = COALESCE(${hashedPassword}, clave),
          url_logo = COALESCE(${url_logo}, url_logo),
          url_iframe = COALESCE(${url_iframe}, url_iframe)
      WHERE email = ${user}
    `

    res.json({ message: 'Usuario actualizado correctamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
})

router.delete('/:user', verifyAdmin, async (req, res) => {
  const { user } = req.params

  try {
    await sql.query`DELETE FROM Usuarios WHERE email = ${user}`
    res.json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
})

module.exports = router
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { connectDB } = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

app.use('/', authRoutes)
app.use('/usuarios', userRoutes)

connectDB()

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
require('dotenv').config()
const sql = require('mssql')

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
}

async function connectDB() {
  try {
    await sql.connect(dbConfig)
    console.log('🟢 Conectado a SQL Server')
  } catch (error) {
    console.error('🔴 Error conectando a SQL Server:', error)
  }
}

module.exports = { connectDB, sql }
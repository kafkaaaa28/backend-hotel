const mysql = require('mysql2/promise');
require('dotenv').config();
// konek ke db
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : null,
});
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Koneksi ke database berhasil!');
    connection.release();
  } catch (err) {
    console.error('❌ Gagal koneksi ke database:', err.message);
  }
}
testConnection();
module.exports = pool;
// const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//   host: '127.0.0.1',
//   user: 'root',
//   password: '',
//   database: 'auth_system',
//   port: 3306,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   ssl: false,
// });
// async function testConnection() {
//   try {
//     const connection = await pool.getConnection();
//     console.log('✅ Koneksi ke database berhasil!');
//     connection.release();
//   } catch (err) {
//     console.error('❌ Gagal koneksi ke database:', err.message);
//   }
// }
// testConnection();
// module.exports = pool;

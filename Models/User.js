const db = require('../config/db.js');

class User {
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(userData) {
    const { name, email, password, role } = userData;
    const [result] = await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role || 'user']);
    return { id: result.insertId, ...userData };
  }

  static async getAll() {
    const [rows] = await db.query('SELECT id, name, email, role FROM users');
    return rows;
  }

  static async update(id, userData) {
    const { name, email, role } = userData;
    await db.query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [name, email, role, id]);
    return { id, ...userData };
  }

  static async delete(id) {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }
}

module.exports = User;

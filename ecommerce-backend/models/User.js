const db = require('../config/db');
const PUBLIC = 'id, type, name, email, phone, address, city, cnpj, establishment_type, created_at';
module.exports = {
  findByEmail: async (email) => (await db.query('SELECT * FROM users WHERE email = $1', [email])).rows[0],
  findById: async (id) => (await db.query(`SELECT ${PUBLIC} FROM users WHERE id = $1`, [id])).rows[0],
  create: async (u) => (await db.query(
    `INSERT INTO users (type, name, email, password_hash, phone, address, city, cnpj, establishment_type)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${PUBLIC}`,
    [u.type, u.name, u.email, u.password_hash, u.phone, u.address, u.city, u.cnpj || null, u.establishment_type || null])).rows[0],
};

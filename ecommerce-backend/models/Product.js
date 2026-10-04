const db = require('../config/db');
const COLS = ['name','category','description','image_url','quantity','unit','expiry_date','original_price','price','offer_type','pickup_time','is_active'];
module.exports = {
  list: async ({ q, category, offer_type }) => {
    const where = ['p.is_active = TRUE', 'p.quantity > 0', 'p.expiry_date >= CURRENT_DATE'], params = [];
    if (q) { params.push(`%${q}%`); where.push(`p.name ILIKE $${params.length}`); }
    if (category) { params.push(category); where.push(`p.category = $${params.length}`); }
    if (offer_type) { params.push(offer_type); where.push(`p.offer_type = $${params.length}`); }
    return (await db.query(
      `SELECT p.*, u.name AS supplier_name FROM products p JOIN users u ON u.id = p.supplier_id
       WHERE ${where.join(' AND ')} ORDER BY p.expiry_date ASC LIMIT 100`, params)).rows;
  },
  bySupplier: async (id) => (await db.query('SELECT * FROM products WHERE supplier_id = $1 ORDER BY created_at DESC', [id])).rows,
  findById: async (id) => (await db.query('SELECT * FROM products WHERE id = $1', [id])).rows[0],
  create: async (supplierId, d) => (await db.query(
    `INSERT INTO products (supplier_id, ${COLS.join(',')}) VALUES ($1, ${COLS.map((_, i) => `$${i + 2}`).join(',')}) RETURNING *`,
    [supplierId, ...COLS.map((c) => d[c] ?? null)])).rows[0],
  update: async (id, supplierId, d) => (await db.query(
    `UPDATE products SET ${COLS.map((c, i) => `${c} = $${i + 3}`).join(',')} WHERE id = $1 AND supplier_id = $2 RETURNING *`,
    [id, supplierId, ...COLS.map((c) => d[c] ?? null)])).rows[0],
  remove: async (id, supplierId) => (await db.query('UPDATE products SET is_active = FALSE WHERE id = $1 AND supplier_id = $2 RETURNING id', [id, supplierId])).rowCount,
};

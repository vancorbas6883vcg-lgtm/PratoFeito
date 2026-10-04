const db = require('../config/db');
module.exports = {
  byBuyer: async (id) => (await db.query(
    `SELECT o.*, COALESCE(json_agg(json_build_object('product_id', i.product_id, 'name', p.name, 'quantity', i.quantity, 'unit_price', i.unit_price)) FILTER (WHERE i.id IS NOT NULL), '[]') AS items
     FROM orders o LEFT JOIN order_items i ON i.order_id = o.id LEFT JOIN products p ON p.id = i.product_id
     WHERE o.buyer_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`, [id])).rows,
  bySupplier: async (id) => (await db.query(
    `SELECT o.*, json_agg(json_build_object('name', p.name, 'quantity', i.quantity, 'unit_price', i.unit_price)) AS items
     FROM orders o JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id
     WHERE p.supplier_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`, [id])).rows,
  updateStatusForSupplier: async (orderId, supplierId, status) => (await db.query(
    `UPDATE orders SET status = $3 WHERE id = $1 AND EXISTS (
       SELECT 1 FROM order_items i JOIN products p ON p.id = i.product_id WHERE i.order_id = orders.id AND p.supplier_id = $2) RETURNING *`,
    [orderId, supplierId, status])).rows[0],
};

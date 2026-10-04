const db = require('../config/db'), Order = require('../models/Order'), { AppError } = require('../middlewares/error.middleware');
exports.checkout = async (buyerId, { items, receipt_type, delivery_address }) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    let total = 0; const lines = [];
    for (const it of [...items].sort((a, b) => a.product_id.localeCompare(b.product_id))) { // ordem fixa evita deadlock
      const { rows: [p] } = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [it.product_id]);
      if (!p || !p.is_active || new Date(p.expiry_date) < new Date(new Date().toDateString())) throw new AppError(400, 'Produto indisponível.');
      if (p.quantity < it.quantity) throw new AppError(409, `Estoque insuficiente para "${p.name}".`);
      await client.query('UPDATE products SET quantity = quantity - $2 WHERE id = $1', [p.id, it.quantity]);
      total += Number(p.price) * it.quantity; lines.push({ id: p.id, qty: it.quantity, price: p.price });
    }
    const { rows: [order] } = await client.query(
      'INSERT INTO orders (buyer_id, total_amount, receipt_type, delivery_address) VALUES ($1,$2,$3,$4) RETURNING *',
      [buyerId, total.toFixed(2), receipt_type, delivery_address || null]);
    for (const l of lines) await client.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1,$2,$3,$4)', [order.id, l.id, l.qty, l.price]);
    await client.query('COMMIT');
    return order;
  } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
};
exports.list = (user) => (user.type === 'buyer' ? Order.byBuyer(user.sub) : Order.bySupplier(user.sub));
exports.setStatus = async (id, supplierId, status) => {
  const o = await Order.updateStatusForSupplier(id, supplierId, status);
  if (!o) throw new AppError(404, 'Pedido não encontrado.');
  return o;
};

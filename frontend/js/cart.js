import { api, esc, money, toast, session } from './utils.js';
const cart = new Map(); // em memória: carrinho vive só durante a sessão da aba
export const cartCount = () => [...cart.values()].reduce((n, i) => n + i.qty, 0);
export function addToCart(p) { const i = cart.get(p.id); i ? i.qty = Math.min(i.qty + 1, p.quantity) : cart.set(p.id, { p, qty: 1 }); document.dispatchEvent(new Event('cart:change')); }
export function renderCart(el) {
  const rows = [...cart.values()], total = rows.reduce((s, { p, qty }) => s + p.price * qty, 0);
  if (!rows.length) { el.innerHTML = '<h1>Carrinho vazio</h1><p><a href="#/">Veja os alimentos disponíveis</a></p>'; return; }
  el.innerHTML = `<h1>Seu carrinho</h1><table><tbody>${rows.map(({ p, qty }) => `<tr><td>${esc(p.name)}</td><td>${qty} × ${money(p.price)}</td><td><button class="btn danger" data-rm="${p.id}">Remover</button></td></tr>`).join('')}</tbody></table>
  <p class="price">Total: ${money(total)}</p>
  <form class="stack" id="co"><label>Recebimento<select name="receipt_type"><option value="pickup">Retirar no local</option><option value="delivery">Entrega</option></select></label>
  <label>Endereço de entrega<input name="delivery_address"></label><button class="btn primary">Finalizar pedido</button></form>`;
  el.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { cart.delete(b.dataset.rm); document.dispatchEvent(new Event('cart:change')); renderCart(el); }));
  el.querySelector('#co').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!session.user) { location.hash = '#/login'; return; }
    const fd = Object.fromEntries(new FormData(e.target));
    try {
      await api('/orders', { method: 'POST', body: { ...fd, items: rows.map(({ p, qty }) => ({ product_id: p.id, quantity: qty })) } });
      cart.clear(); document.dispatchEvent(new Event('cart:change')); toast('Pedido realizado!'); location.hash = '#/orders';
    } catch (err) { toast(err.message); }
  });
}

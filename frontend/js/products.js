import { api, esc, money, date, toast } from './utils.js';
import { addToCart } from './cart.js';
export async function renderProducts(el) {
  el.innerHTML = `<h1>Comida boa a um passo do vencimento.</h1><p class="muted">Compre com desconto ou retire doações perto de você.</p>
  <form class="filters" id="flt"><input name="q" placeholder="Buscar alimento" aria-label="Buscar"><input name="category" placeholder="Categoria" aria-label="Categoria">
  <select name="offer_type" aria-label="Tipo"><option value="">Todas as ofertas</option><option value="discount">Com desconto</option><option value="donation">Doações</option></select><button class="btn primary">Filtrar</button></form>
  <div class="grid" id="list" aria-live="polite"></div>`;
  const list = el.querySelector('#list'), f = el.querySelector('#flt');
  const load = async () => {
    const qs = new URLSearchParams([...new FormData(f)].filter(([, v]) => v));
    try {
      const items = await api('/products?' + qs);
      list.innerHTML = items.length ? items.map((p) => `<article class="card">
        ${p.offer_type === 'donation' ? '<span class="tag">Doação</span>' : ''}<h3>${esc(p.name)}</h3>
        <span class="muted">${esc(p.supplier_name)} · vence em ${date(p.expiry_date)}</span>
        <span class="price">${p.offer_type === 'donation' ? 'Grátis' : money(p.price)} <span class="old">${money(p.original_price)}</span></span>
        <span class="muted">${p.quantity} ${esc(p.unit)} · retirada ${esc(p.pickup_time || 'a combinar')}</span>
        <button class="btn primary" data-id="${p.id}">Adicionar ao carrinho</button></article>`).join('') : '<p>Nenhum alimento encontrado. Tente outro filtro.</p>';
      list.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { addToCart(items.find((p) => p.id === b.dataset.id)); toast('Adicionado ao carrinho'); }));
    } catch (e) { list.textContent = e.message; }
  };
  f.addEventListener('submit', (e) => { e.preventDefault(); load(); });
  load();
}

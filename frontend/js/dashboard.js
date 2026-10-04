import { api, esc, money, toast, form, session } from './utils.js';
export async function renderDashboard(el) {
  const supplier = session.user?.type === 'supplier';
  try {
    const orders = await api('/orders'), done = orders.filter((o) => o.status === 'completed');
    const kg = done.reduce((n, o) => n + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    const total = done.reduce((s, o) => s + Number(o.total_amount), 0);
    el.innerHTML = `<h1>${supplier ? 'Painel do estabelecimento' : 'Seu impacto'}</h1>
    <div class="stats"><div><b>${kg}</b>itens salvos do lixo</div><div><b>${done.length}</b>pedidos concluídos</div><div><b>${money(total)}</b>${supplier ? 'faturado' : 'gasto'}</div></div><div id="sup"></div>`;
    if (supplier) await renderSupplier(el.querySelector('#sup'));
  } catch (e) { el.textContent = e.message; }
}
async function renderSupplier(el) {
  const items = await api('/products/mine');
  el.innerHTML = `<h2>Publicar alimento</h2><form class="stack" id="pf">
  <label>Nome<input name="name" required></label><label>Categoria<input name="category" required></label>
  <label>Quantidade<input name="quantity" type="number" min="0" required></label><label>Unidade<input name="unit" value="un"></label>
  <label>Validade<input name="expiry_date" type="date" required></label><label>Preço original (R$)<input name="original_price" type="number" step="0.01" min="0" required></label>
  <label>Preço com desconto (R$)<input name="price" type="number" step="0.01" min="0" required></label>
  <label>Tipo<select name="offer_type"><option value="discount">Desconto</option><option value="donation">Doação</option></select></label>
  <label>Horário de retirada<input name="pickup_time"></label><button class="btn primary">Publicar</button></form>
  <h2>Seus produtos</h2><table><tbody>${items.map((p) => `<tr><td>${esc(p.name)}</td><td>${p.quantity} ${esc(p.unit)}</td><td>${p.is_active ? money(p.price) : 'Inativo'}</td>
  <td>${p.is_active ? `<button class="btn danger" data-rm="${p.id}">Desativar</button>` : ''}</td></tr>`).join('')}</tbody></table>`;
  el.querySelector('#pf').addEventListener('submit', async (e) => {
    e.preventDefault(); const d = form(e.target);
    if (d.offer_type === 'donation') d.price = 0;
    try { await api('/products', { method: 'POST', body: d }); toast('Produto publicado'); renderSupplier(el); } catch (err) { toast(err.message); }
  });
  el.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', async () => { try { await api(`/products/${b.dataset.rm}`, { method: 'DELETE' }); renderSupplier(el); } catch (e) { toast(e.message); } }));
}

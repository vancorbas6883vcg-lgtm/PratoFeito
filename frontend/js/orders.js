import { api, esc, money, date, toast, session } from './utils.js';
const LABEL = { pending: 'Pendente', confirmed: 'Confirmado', ready: 'Pronto', completed: 'Concluído', cancelled: 'Cancelado' };
export async function renderOrders(el) {
  const supplier = session.user?.type === 'supplier';
  try {
    const orders = await api('/orders');
    el.innerHTML = `<h1>${supplier ? 'Pedidos recebidos' : 'Meus pedidos'}</h1>` + (orders.length ? `<table><thead><tr><th>Pedido</th><th>Itens</th><th>Total</th><th>Status</th></tr></thead><tbody>${orders.map((o) => `<tr>
      <td>#${o.order_number}<br><span class="muted">${date(o.created_at)}</span></td>
      <td>${o.items.map((i) => `${i.quantity}× ${esc(i.name)}`).join('<br>')}</td><td>${money(o.total_amount)}</td>
      <td>${supplier ? `<select data-id="${o.id}" aria-label="Status do pedido ${o.order_number}">${Object.entries(LABEL).filter(([k]) => k !== 'pending' || o.status === 'pending').map(([k, v]) => `<option value="${k}" ${k === o.status ? 'selected' : ''}>${v}</option>`).join('')}</select>` : LABEL[o.status]}</td></tr>`).join('')}</tbody></table>` : '<p>Nenhum pedido ainda.</p>');
    el.querySelectorAll('select[data-id]').forEach((s) => s.addEventListener('change', async () => {
      try { await api(`/orders/${s.dataset.id}/status`, { method: 'PATCH', body: { status: s.value } }); toast('Status atualizado'); } catch (e) { toast(e.message); }
    }));
  } catch (e) { el.textContent = e.message; }
}

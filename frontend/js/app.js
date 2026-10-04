import { session } from './utils.js';
import { renderAuth, logout } from './auth.js';
import { renderProducts } from './products.js';
import { renderCart, cartCount } from './cart.js';
import { renderOrders } from './orders.js';
import { renderDashboard } from './dashboard.js';
const view = document.getElementById('view'), nav = document.getElementById('nav');
const routes = {
  '': renderProducts, cart: renderCart, orders: renderOrders, dashboard: renderDashboard,
  login: (el) => renderAuth(el, 'login'), register: (el) => renderAuth(el, 'register'),
};
const protectedRoutes = ['orders', 'dashboard'];
function renderNav(route) {
  const u = session.user, a = (h, t) => `<a href="#/${h}" ${route === h ? 'class="on" aria-current="page"' : ''}>${t}</a>`;
  nav.innerHTML = a('', 'Alimentos') + (u?.type !== 'supplier' ? a('cart', `Carrinho (${cartCount()})`) : '') +
    (u ? a('orders', 'Pedidos') + a('dashboard', u.type === 'supplier' ? 'Painel' : 'Impacto') + '<button class="btn" id="out">Sair</button>' : a('login', 'Entrar') + a('register', 'Criar conta'));
  nav.querySelector('#out')?.addEventListener('click', logout);
}
function route() {
  const r = location.hash.replace(/^#\/?/, '');
  if (protectedRoutes.includes(r) && !session.user) { location.hash = '#/login'; return; }
  renderNav(r in routes ? r : ''); (routes[r] || routes[''])(view); view.focus();
}
window.addEventListener('hashchange', route);
document.addEventListener('cart:change', () => renderNav(location.hash.replace(/^#\/?/, '')));
route();

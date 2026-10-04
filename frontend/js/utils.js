export const API = location.protocol === 'file:' ? 'http://localhost:3000/api' : '/api'; // mesmo servidor que serve o site
const SESSION_KEY = 'pf_token';
export const session = {
  get token() { return sessionStorage.getItem(SESSION_KEY); },
  set token(v) { v ? sessionStorage.setItem(SESSION_KEY, v) : sessionStorage.removeItem(SESSION_KEY); },
  get user() { try { return JSON.parse(atob(this.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return null; } },
};
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(API + path, {
    method, body: body && JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...(session.token && { Authorization: `Bearer ${session.token}` }) },
  });
  const json = await res.json().catch(() => ({ success: false, error: 'Resposta inválida do servidor.' }));
  if (res.status === 401 && session.token) { session.token = null; location.hash = '#/login'; }
  if (!json.success) throw new Error(json.error || 'Erro inesperado.');
  return json.data;
}
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const money = (n) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const date = (d) => new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
let t; export function toast(msg) { const el = document.getElementById('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(t); t = setTimeout(() => el.classList.remove('show'), 3000); }
export const form = (f) => Object.fromEntries(new FormData(f));

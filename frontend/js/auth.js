import { api, session, toast, form } from './utils.js';
export const isAuth = () => !!session.user;
export const logout = () => { session.token = null; location.hash = '#/'; };
export function renderAuth(el, mode = 'login') {
  const reg = mode === 'register';
  el.innerHTML = `<h1>${reg ? 'Crie sua conta' : 'Entre na sua conta'}</h1>
  <form class="stack" id="f">
    ${reg ? `<label>Tipo de conta<select name="type" id="t"><option value="buyer">Quero comprar</option><option value="supplier">Tenho um estabelecimento</option></select></label>
    <label>Nome<input name="name" required minlength="2"></label>` : ''}
    <label>E-mail<input name="email" type="email" required autocomplete="email"></label>
    <label>Senha<input name="password" type="password" required minlength="8" autocomplete="${reg ? 'new-password' : 'current-password'}"></label>
    ${reg ? `<label>Cidade<input name="city"></label><label>Endereço<input name="address"></label>
    <div id="sup" hidden><label>CNPJ<input name="cnpj" placeholder="00.000.000/0000-00"></label><label>Tipo de estabelecimento<input name="establishment_type"></label></div>` : ''}
    <button class="btn primary">${reg ? 'Criar conta' : 'Entrar'}</button>
    <a href="#/${reg ? 'login' : 'register'}">${reg ? 'Já tenho conta' : 'Criar conta'}</a>
  </form>`;
  const f = el.querySelector('#f');
  el.querySelector('#t')?.addEventListener('change', (e) => { el.querySelector('#sup').hidden = e.target.value !== 'supplier'; });
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = form(f); if (data.type !== 'supplier') { delete data.cnpj; delete data.establishment_type; }
    try { session.token = (await api(`/auth/${mode}`, { method: 'POST', body: data })).token; location.hash = '#/'; toast('Bem-vindo(a)!'); }
    catch (err) { toast(err.message); }
  });
}

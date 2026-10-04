if (Number(process.versions.node.split('.')[0]) < 18) {
  console.error(`Node.js ${process.versions.node} é antigo demais. Instale a versão LTS em https://nodejs.org`);
  process.exit(1);
}
require('./config/env'); // precisa vir antes de tudo (define JWT_SECRET e pasta de dados)
const path = require('path');
const express = require('express'), helmet = require('helmet'), cors = require('cors'), rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const db = require('./config/db');
const { setup } = require('./database/bootstrap');

const app = express();
app.use(helmet({ contentSecurityPolicy: { directives: { ...helmet.contentSecurityPolicy.getDefaultDirectives(), 'upgrade-insecure-requests': null } } }));
// O site é servido por este mesmo servidor (mesma origem), então CORS só é necessário se o frontend ficar em outro endereço.
if (process.env.FRONTEND_ORIGIN) app.use(cors({ origin: process.env.FRONTEND_ORIGIN, allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ success: true, data: { app: 'pratofeito' } }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false,
  message: { success: false, error: 'Muitas tentativas. Tente novamente em 15 minutos.' } }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api', notFound);
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(errorHandler);

process.on('unhandledRejection', (e) => console.error(e));

const BASE_PORT = Number(process.env.PORT) || 3000, MAX_TRIES = 10;

const isOurs = async (port) => {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(800) });
    return (await r.json())?.data?.app === 'pratofeito';
  } catch { return false; }
};
function openBrowser(url) {
  if (process.env.OPEN_BROWSER !== '1') return;
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
    : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  try { require('child_process').spawn(cmd, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref(); } catch { /* sem navegador: tudo bem */ }
}
function listen(port, tries = 0) {
  const server = app.listen(port);
  server.once('listening', () => {
    const url = `http://localhost:${port}`;
    console.log(`\n  PratoFeito no ar!  Abra: ${url}\n  (para encerrar: Ctrl+C ou feche esta janela)\n`);
    openBrowser(url);
    const stop = async () => { server.close(); await db.close().catch(() => {}); process.exit(0); };
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
  });
  server.once('error', (e) => {
    if (e.code === 'EADDRINUSE' && tries < MAX_TRIES) return listen(port + 1, tries + 1);
    console.error(e); process.exit(1);
  });
}

(async () => {
  // Já está rodando? Só abre o navegador. (Duas cópias não podem compartilhar o mesmo banco embutido.)
  for (let p = BASE_PORT; p <= BASE_PORT + MAX_TRIES; p++) {
    if (await isOurs(p)) { console.log(`PratoFeito já está rodando em http://localhost:${p}`); openBrowser(`http://localhost:${p}`); return; }
  }
  await setup();
  listen(BASE_PORT);
})().catch((e) => { console.error('Falha ao iniciar:', e); process.exit(1); });

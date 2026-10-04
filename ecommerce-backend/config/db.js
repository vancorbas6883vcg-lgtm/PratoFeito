const path = require('path');
const { DATA_DIR } = require('./env');

BigInt.prototype.toJSON = function () { return Number(this); };

const external = !!(process.env.DATABASE_URL || process.env.DB_HOST);
const db = { kind: external ? 'postgres' : 'pglite' };

if (external) {
  const { Pool } = require('pg');
  const pool = new Pool(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, max: 10 }
    : { host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER,
        password: process.env.DB_PASS, database: process.env.DB_NAME, max: 10, idleTimeoutMillis: 30000 });
  Object.assign(db, {
    init: async () => { await pool.query('SELECT 1'); },
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect(),
    exec: (sql) => pool.query(sql),
    close: () => pool.end(),
  });
} else {
  // PGlite tem UMA conexão. Para que transações (BEGIN...COMMIT) de requisições simultâneas
  // não se misturem, todo acesso passa por uma fila: um de cada vez.
  let pg, tail = Promise.resolve();
  const lock = () => {
    const prev = tail; let release;
    tail = new Promise((r) => { release = r; });
    return prev.then(() => release);
  };
  const run = async (text, params) => {
    const r = await pg.query(text, params);
    return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length };
  };
  const locked = (fn) => async (...args) => { const release = await lock(); try { return await fn(...args); } finally { release(); } };
  Object.assign(db, {
    init: async () => {
      const { PGlite } = require('@electric-sql/pglite');
      pg = await PGlite.create(path.join(DATA_DIR, 'pgdata'));
    },
    query: locked(run),
    exec: locked(async (sql) => { await pg.exec(sql); }),
    // Mesmo contrato do pool.connect(): segura a fila até release(), então a transação é exclusiva.
    connect: async () => {
      const release = await lock(); let done = false;
      return { query: run, release: () => { if (!done) { done = true; release(); } } };
    },
    close: async () => { await pg?.close(); },
  });
}

module.exports = db;

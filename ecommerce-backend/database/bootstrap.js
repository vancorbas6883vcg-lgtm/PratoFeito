// Cria as tabelas na primeira execução e (fora de produção) popula dados de demonstração.
const fs = require('fs'), path = require('path'), bcrypt = require('bcryptjs');
const db = require('../config/db');

const DEMO_PASS = 'demo12345';
const DEMO = { supplier: 'fornecedor@demo.com', buyer: 'comprador@demo.com' };

const PRODUCTS = [
  ['Pão francês (lote do dia)', 'Padaria', 'Assado hoje, ótimo para o café da manhã.', 40, 'un', 1, 0.8, 0.4, 'discount', 'Hoje, 18h às 20h'],
  ['Bolo de cenoura', 'Padaria', 'Bolo inteiro com cobertura de chocolate.', 6, 'un', 2, 28, 14, 'discount', 'Amanhã, 9h às 12h'],
  ['Iogurte natural 170g', 'Laticínios', 'Lote próximo da data de validade.', 60, 'un', 3, 3.5, 1.5, 'discount', 'Horário comercial'],
  ['Tomate italiano', 'Hortifruti', 'Caixa com frutos maduros, ideal para molhos.', 12, 'kg', 2, 9, 4, 'discount', 'Hoje, 17h às 19h'],
  ['Banana prata', 'Hortifruti', 'Bem madura, perfeita para vitaminas e bolos.', 25, 'kg', 1, 6, 0, 'donation', 'Hoje, até as 20h'],
  ['Marmita executiva', 'Refeições', 'Arroz, feijão, proteína e salada.', 15, 'un', 1, 24, 10, 'discount', 'Hoje, 14h às 16h'],
  ['Queijo mussarela fatiado 500g', 'Laticínios', 'Embalagem fechada, validade curta.', 18, 'un', 4, 32, 16, 'discount', 'Horário comercial'],
  ['Pão de forma integral', 'Padaria', 'Pacote fechado, doação para quem precisar.', 20, 'un', 2, 9, 0, 'donation', 'Amanhã, 8h às 11h'],
];

async function seed() {
  const { rows: [{ has }] } = await db.query('SELECT EXISTS (SELECT 1 FROM users) AS has');
  if (!has) {
    const hash = await bcrypt.hash(DEMO_PASS, 12);
    const { rows: [sup] } = await db.query(
      `INSERT INTO users (type, name, email, password_hash, phone, address, city, cnpj, establishment_type)
       VALUES ('supplier', 'Padaria e Mercado Bom Dia', $1, $2, '(00) 90000-0000', 'Rua Exemplo, 100', 'Cidade Exemplo', '12.345.678/0001-90', 'Padaria') RETURNING id`,
      [DEMO.supplier, hash]);
    await db.query(`INSERT INTO users (type, name, email, password_hash, city) VALUES ('buyer', 'Cliente Demo', $1, $2, 'Cidade Exemplo')`, [DEMO.buyer, hash]);
    for (const [name, category, description, quantity, unit, days, original, price, offer, pickup] of PRODUCTS) {
      await db.query(
        `INSERT INTO products (supplier_id, name, category, description, quantity, unit, expiry_date, original_price, price, offer_type, pickup_time)
         VALUES ($1,$2,$3,$4,$5,$6, CURRENT_DATE + $7::int, $8,$9,$10,$11)`,
        [sup.id, name, category, description, quantity, unit, days, original, price, offer, pickup]);
    }
    console.log(`Dados de demonstração criados. Contas: ${DEMO.supplier} / ${DEMO.buyer} (senha: ${DEMO_PASS})`);
  } else {
    // Mantém a vitrine de demonstração sempre com produtos válidos, mesmo dias depois.
    await db.query(
      `UPDATE products SET expiry_date = CURRENT_DATE + 3, quantity = GREATEST(quantity, 5), is_active = TRUE
       WHERE expiry_date < CURRENT_DATE + 1 AND supplier_id IN (SELECT id FROM users WHERE email = $1)`, [DEMO.supplier]);
  }
}

exports.setup = async () => {
  await db.init();
  const { rows: [{ ok }] } = await db.query(
    `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') AS ok`);
  if (!ok) {
    let sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    // gen_random_uuid() já é nativo no Postgres 13+; a extensão pgcrypto não existe no PGlite.
    if (db.kind === 'pglite') sql = sql.replace(/CREATE EXTENSION[^;]*;/i, '');
    await db.exec(sql);
    console.log('Banco de dados criado.');
  }
  // Dados de demonstração só fora de produção (nunca com senha pública em um servidor real).
  if (process.env.NODE_ENV !== 'production' && process.env.SEED !== '0') await seed();
};

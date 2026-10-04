// Carrega .env (opcional) e garante valores padrão para rodar sem configurar nada.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

// Sem JWT_SECRET definido: gera um segredo forte uma única vez e reaproveita nas próximas execuções.
if (!process.env.JWT_SECRET) {
  const file = path.join(DATA_DIR, 'jwt.secret');
  if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(48).toString('hex'), { mode: 0o600 });
  process.env.JWT_SECRET = fs.readFileSync(file, 'utf8').trim();
}

module.exports = { DATA_DIR };

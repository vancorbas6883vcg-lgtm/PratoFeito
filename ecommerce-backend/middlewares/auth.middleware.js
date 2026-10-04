const jwt = require('jsonwebtoken');
const authenticate = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ success: false, error: 'Token ausente.' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ success: false, error: 'Token inválido ou expirado.' }); }
};
const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user?.type) ? next() : res.status(403).json({ success: false, error: 'Acesso negado.' });
module.exports = { authenticate, authorize };

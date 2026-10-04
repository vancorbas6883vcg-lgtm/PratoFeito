const User = require('../models/User');
exports.me = async (req, res, next) => {
  try { const u = await User.findById(req.user.sub); if (!u) return res.status(404).json({ success: false, error: 'Usuário não encontrado.' }); res.json({ success: true, data: u }); }
  catch (e) { next(e); }
};

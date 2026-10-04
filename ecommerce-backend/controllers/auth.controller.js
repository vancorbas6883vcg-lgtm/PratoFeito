const s = require('../services/auth.service');
const wrap = (fn, code = 200) => async (req, res, next) => { try { res.status(code).json({ success: true, data: await fn(req) }); } catch (e) { next(e); } };
module.exports = { register: wrap((r) => s.register(r.body), 201), login: wrap((r) => s.login(r.body)) };

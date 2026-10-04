const s = require('../services/order.service');
const wrap = (fn, code = 200) => async (req, res, next) => { try { res.status(code).json({ success: true, data: await fn(req) }); } catch (e) { next(e); } };
module.exports = {
  checkout: wrap((r) => s.checkout(r.user.sub, r.body), 201), list: wrap((r) => s.list(r.user)),
  setStatus: wrap((r) => s.setStatus(r.params.id, r.user.sub, r.body.status)),
};

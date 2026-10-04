const s = require('../services/product.service');
const wrap = (fn, code = 200) => async (req, res, next) => { try { res.status(code).json({ success: true, data: await fn(req) }); } catch (e) { next(e); } };
module.exports = {
  list: wrap((r) => s.list(r.query)), mine: wrap((r) => s.mine(r.user.sub)), get: wrap((r) => s.get(r.params.id)),
  create: wrap((r) => s.create(r.user.sub, r.body), 201), update: wrap((r) => s.update(r.params.id, r.user.sub, r.body)),
  remove: wrap(async (r) => { await s.remove(r.params.id, r.user.sub); return { id: r.params.id }; }),
};

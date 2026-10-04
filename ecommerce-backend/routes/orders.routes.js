const r = require('express').Router(), c = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware'), { validate, schemas } = require('../middlewares/validate');
r.use(authenticate);
r.get('/', c.list);
r.post('/', authorize('buyer'), validate(schemas.order), c.checkout);
r.patch('/:id/status', authorize('supplier'), validate(schemas.status), c.setStatus);
module.exports = r;

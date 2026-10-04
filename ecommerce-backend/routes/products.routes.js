const r = require('express').Router(), c = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware'), { validate, schemas } = require('../middlewares/validate');
r.get('/', c.list);
r.get('/mine', authenticate, authorize('supplier'), c.mine);
r.get('/:id', c.get);
r.post('/', authenticate, authorize('supplier'), validate(schemas.product), c.create);
r.put('/:id', authenticate, authorize('supplier'), validate(schemas.product), c.update);
r.delete('/:id', authenticate, authorize('supplier'), c.remove);
module.exports = r;

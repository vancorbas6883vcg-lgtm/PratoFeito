const Product = require('../models/Product'), { AppError } = require('../middlewares/error.middleware');
const must = (r) => { if (!r) throw new AppError(404, 'Produto não encontrado.'); return r; };
exports.list = (f) => Product.list(f);
exports.mine = (id) => Product.bySupplier(id);
exports.get = async (id) => must(await Product.findById(id));
exports.create = (sid, d) => Product.create(sid, d);
exports.update = async (id, sid, d) => must(await Product.update(id, sid, d));
exports.remove = async (id, sid) => must(await Product.remove(id, sid));

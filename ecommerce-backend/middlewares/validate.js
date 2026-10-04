const Joi = require('joi');
const { AppError } = require('./error.middleware');
const validate = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return next(new AppError(400, error.details.map((d) => d.message).join('; ')));
  req.body = value; next();
};
const schemas = {
  register: Joi.object({
    type: Joi.string().valid('buyer', 'supplier').required(), name: Joi.string().min(2).max(120).required(),
    email: Joi.string().email().required(), password: Joi.string().min(8).max(72).required(),
    phone: Joi.string().max(30).allow('', null), address: Joi.string().max(255).allow('', null), city: Joi.string().max(80).allow('', null),
    cnpj: Joi.when('type', { is: 'supplier', then: Joi.string().pattern(/^[\d./-]{14,18}$/).required(), otherwise: Joi.any().strip() }),
    establishment_type: Joi.string().max(60).allow('', null),
  }),
  login: Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() }),
  product: Joi.object({
    name: Joi.string().max(120).required(), category: Joi.string().max(60).required(), description: Joi.string().allow('', null),
    image_url: Joi.string().uri().allow('', null), quantity: Joi.number().integer().min(0).required(), unit: Joi.string().max(20).default('un'),
    expiry_date: Joi.date().iso().required(), original_price: Joi.number().min(0).required(),
    price: Joi.number().min(0).max(Joi.ref('original_price')).required(),
    offer_type: Joi.string().valid('discount', 'donation').default('discount'), pickup_time: Joi.string().max(60).allow('', null), is_active: Joi.boolean().default(true),
  }),
  order: Joi.object({
    items: Joi.array().items(Joi.object({ product_id: Joi.string().uuid().required(), quantity: Joi.number().integer().min(1).required() })).min(1).required(),
    receipt_type: Joi.string().valid('pickup', 'delivery').required(),
    delivery_address: Joi.when('receipt_type', { is: 'delivery', then: Joi.string().required(), otherwise: Joi.string().allow('', null) }),
  }),
  status: Joi.object({ status: Joi.string().valid('confirmed', 'ready', 'completed', 'cancelled').required() }),
};
module.exports = { validate, schemas };

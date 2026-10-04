const r = require('express').Router(), c = require('../controllers/auth.controller'), { validate, schemas } = require('../middlewares/validate');
r.post('/register', validate(schemas.register), c.register);
r.post('/login', validate(schemas.login), c.login);
module.exports = r;

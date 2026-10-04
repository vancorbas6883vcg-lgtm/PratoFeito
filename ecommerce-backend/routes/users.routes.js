const r = require('express').Router(), { authenticate } = require('../middlewares/auth.middleware');
r.get('/me', authenticate, require('../controllers/user.controller').me);
module.exports = r;

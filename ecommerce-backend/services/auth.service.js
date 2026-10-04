const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const User = require('../models/User'), { AppError } = require('../middlewares/error.middleware');
const sign = (u) => jwt.sign({ sub: u.id, type: u.type, name: u.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '2h' });
exports.register = async (data) => {
  if (await User.findByEmail(data.email)) throw new AppError(409, 'E-mail já cadastrado.');
  const user = await User.create({ ...data, password_hash: await bcrypt.hash(data.password, 12) });
  return { user, token: sign(user) };
};
exports.login = async ({ email, password }) => {
  const u = await User.findByEmail(email);
  if (!u || !(await bcrypt.compare(password, u.password_hash))) throw new AppError(401, 'E-mail ou senha incorretos.');
  const { password_hash, ...user } = u;
  return { user, token: sign(user) };
};

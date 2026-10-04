class AppError extends Error { constructor(status, message) { super(message); this.status = status; } }
const notFound = (req, res) => res.status(404).json({ success: false, error: 'Rota não encontrada.' });
const errorHandler = (err, req, res, _next) => {
  if (err.code === '23505') err = new AppError(409, 'Registro já existe.');
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ success: false, error: status === 500 ? 'Erro interno do servidor.' : err.message });
};
module.exports = { AppError, notFound, errorHandler };

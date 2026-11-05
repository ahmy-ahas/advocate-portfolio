export const notFound = (_req, res) => res.status(404).json({ message: 'Not found' });

export function errorHandler(err, _req, res, _next) {
  if (err.name === 'ValidationError')
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  if (err.name === 'CastError') return res.status(400).json({ message: `Invalid value for "${err.path}"` });
  if (err.code === 11000) return res.status(409).json({ message: 'That value already exists' });
  if (err.name === 'MulterError')
    return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 15 MB)' : err.message });
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request is too large' });
  if (err.status && err.status < 500) return res.status(err.status).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
}

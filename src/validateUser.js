export function validateUser(req, res, next) {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res
      .status(400)
      .json({ message: 'Name is required and must be a non-empty string.' });
  }

  next();
}

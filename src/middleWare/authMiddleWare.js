export function auth(req, res, next) {
  const userName = req.body?.userName || req.query?.userName;

  if (!userName) {
    res.status(401).send({ text: 'Authentication required' });

    return;
  }

  next();
}

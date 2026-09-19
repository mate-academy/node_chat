export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).send('Unauthorized');
  }

  const [, user] = authHeader.split(' ');

  if (!user) {
    return res.status(401).send('Unauthorized');
  }

  req.user = user;

  next();
};

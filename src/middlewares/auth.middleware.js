const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    req.user = {
      username: authHeader,
    };

    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export default authMiddleware;

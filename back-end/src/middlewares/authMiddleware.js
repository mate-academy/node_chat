export const authMiddleware = (req, res, next) => {
  const activeUser = req.cookies.activeUser;
  // const activeUser = localStorage.getItem('activeUser');

  console.log('Active user: ', activeUser);

  if (activeUser === undefined) {
    console.log('error');

    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  next();
};

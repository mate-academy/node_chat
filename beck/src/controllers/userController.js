const User = require('../models/User');

const normalizedUser = ({ id, name, email }) => {
  return { id, name, email };
};

exports.getUserInfo = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Відсутнє ID користувача' });
  }

  const userExists = await User.findOne({ where: { id: userId } });

  if (!userExists) {
    return res.status(404).json({ error: 'Не існує користувача з таким ID' });
  }

  try {
    return res.status(200).json(normalizedUser(userExists));
  } catch (error) {
    return res.status(400).json({ error: 'Помилка виходу' });
  }
};

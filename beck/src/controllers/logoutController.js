const Session = require('../models/Sesion');
const User = require('../models/User');

exports.logout = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Відсутнє ID користувача' });
  }

  const userExists = await User.findOne({ where: { id: userId } });

  if (!userExists) {
    return res.status(404).json({ error: 'Не існує користувача з таким ID' });
  }

  const sessionExist = await Session.findOne({ where: { userId } });

  if (!sessionExist) {
    return res.status(200).json({ error: 'Сесія користувача завершена' });
  }

  try {
    await sessionExist.destroy();

    return res.status(200).json({ message: 'Вихід успішний' });
  } catch (error) {
    return res.status(400).json({ error: 'Помилка виходу' });
  }
};

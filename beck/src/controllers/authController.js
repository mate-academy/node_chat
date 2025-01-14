const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Sesion');

const normalizedUser = ({ id, name, email }) => {
  return { id, name, email };
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Будь ласка, введіть усі поля' });
  }

  const userExists = await User.findOne({ where: { email } });

  if (userExists) {
    return res
      .status(400)
      .json({ error: 'Користувач з таким email вже існує' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json(normalizedUser(user));
  } catch (error) {
    return res.status(400).json({ error: 'Помилка при реєстрації' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Невірний логін або пароль' });
  }

  const id = user.id;

  const existSession = await Session.findOne({ where: { userId: id } });

  let token = existSession?.token;

  if (!existSession) {
    token = jwt.sign({ id }, process.env.JWT_SECRET);

    await Session.create({ userId: id, token });
  }

  return res
    .cookie('token', token, { httpOnly: true, secure: false })
    .status(201)
    .json(normalizedUser(user));
};

'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async(req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name, email, password,
  });
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.status(201).json({ token });
};

exports.login = async(req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.status(200).json({ token });
};

'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async(req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.create({
      username,
      password,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.login = async(req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UNAUTHORIZED, CREATED, OK } = require('../constants/httpStatusCodes');
const { INVALID_CREDENTIALS } = require('../constants/errorMessages');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};

exports.register = async(req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.create({
      username,
      password,
    });

    const token = generateToken(user._id);

    res.status(CREATED).json({ token });
  } catch (err) {
    next(err);
  }
};

exports.login = async(req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(UNAUTHORIZED).json({ message: INVALID_CREDENTIALS });
    }

    const token = generateToken(user._id);

    res.status(OK).json({ token });
  } catch (err) {
    next(err);
  }
};

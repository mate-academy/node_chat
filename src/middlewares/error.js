'use strict';

const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} = require('../constants/httpStatusCodes');
const {
  VALIDATION_ERROR,
  CAST_ERROR,
  UNEXPECTED_ERROR,
} = require('../constants/errorMessages');

module.exports = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(BAD_REQUEST).json({ message: VALIDATION_ERROR });
  }

  if (err.name === 'CastError') {
    return res.status(BAD_REQUEST).json({ message: CAST_ERROR });
  }

  res.status(INTERNAL_SERVER_ERROR).json({ message: UNEXPECTED_ERROR });
};

const ApiError = require('../exceptions/apiError');
const validator = require('validator');

const message = (msg) => {
  const error = {};
  const { author, text, chatId, userId } = msg;

  if (!chatId || typeof chatId !== 'number' || !text.trim().length) {
    error.chatId = 'Wrong chatId';
  }

  if (!userId || typeof userId !== 'number' || !text.trim().length) {
    error.userId = 'Wrong userId';
  }

  if (!author || typeof author !== 'string' || !author.trim().length) {
    error.author = 'Wrong author';
  }

  if (!text || typeof text !== 'string' || !text.trim().length) {
    error.text = 'Wrong text';
  }

  if (!Object.keys(error).length) {
    return { result: true };
  }

  return { result: false, error };
};

const room = (roomItem) => {
  const error = {};
  const { id, owner, name } = roomItem;

  if (!id || typeof id !== 'string') {
    error.id = 'Wrong id';
  }

  if (!owner || typeof owner !== 'string') {
    error.id = 'Wrong room owner';
  }

  if (!name || typeof name !== 'string') {
    error.id = 'Wrong room name';
  }

  if (!Object.keys(error).length) {
    return { result: true };
  }

  return { result: false, error };
};

const registrationData = (formData) => {
  const { name, email, password } = formData;

  if ((!name, !email, !password)) {
    throw ApiError.BadRequest('All fields are required');
  }

  if (!validator.isEmail(email)) {
    throw ApiError.BadRequest('Email must be a valid email...');
  }

  if (password.length < 4) {
    throw ApiError.BadRequest('Password must be a strong password...');
  }

  if (!name.length) {
    throw ApiError.BadRequest('Name is required...');
  }
};
const loginData = (formData) => {
  const { email, password } = formData;

  if ((!email, !password)) {
    throw ApiError.BadRequest('All fields are required');
  }

  if (!validator.isEmail(email)) {
    throw ApiError.BadRequest('Email must be a valid email...');
  }

  if (password.length < 4) {
    throw ApiError.BadRequest('Password must be a strong password...');
  }
};

module.exports = {
  message,
  room,
  registrationData,
  loginData,
};

'use strict';

const { createHttpError } = require('./errors');

const MAX_MESSAGE_LENGTH = 2_000;
const MAX_NAME_LENGTH = 40;

const cleanText = (value) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';

const assertText = (value, label, maxLength) => {
  const text = cleanText(value);

  if (!text) {
    throw createHttpError(400, `${label} is required`);
  }

  if (text.length > maxLength) {
    throw createHttpError(400, `${label} is too long`);
  }

  return text;
};

const validateUsername = (value) =>
  assertText(value, 'Username', MAX_NAME_LENGTH);

const validateRoomName = (value) =>
  assertText(value, 'Room name', MAX_NAME_LENGTH);

const validateMessage = (value) => ({
  author: validateUsername(value.author),
  text: assertText(value.text, 'Message', MAX_MESSAGE_LENGTH),
});

module.exports = {
  validateMessage,
  validateRoomName,
  validateUsername,
};

'use strict';

function userName(value) {
  if (!value) {
    return 'User name is required';
  }

  const namePattern = /^[a-zA-Z](?:[a-zA-Z ]{0,18}[a-zA-Z])?$/;

  if (!namePattern.test(value)) {
    return 'Invalid user name (only letters, the length from 2 to 20)';
  }

  return null;
}

function chatName(value) {
  if (!value) {
    return 'Chat name is required';
  }

  const chatPattern = /^[\w\d!@#$%^&*()\-+=_{}[\]:;"'<>,.?/| ]{0,20}$/;

  if (!chatPattern.test(value)) {
    return 'Invalid chat name (only letters, the length from 2 to 20)';
  }

  return null;
}

module.exports = {
  validate: {
    userName,
    chatName,
  },
};

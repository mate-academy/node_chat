const config = require('../config');
const { httpError } = require('../utils/errors');
const { cleanText } = require('../utils/validators');

function validateUsername(value) {
  const username = cleanText(value, config.limits.username);

  if (!username) {
    throw httpError(
      400,
      'O nome de usuário deve ter de 1 a ' +
        config.limits.username +
        ' caracteres.',
    );
  }

  return username;
}

module.exports = { validateUsername };

const nodeCrypto = require('node:crypto');

const generateId = (size = 777) => {
  return nodeCrypto
    .randomBytes(Math.ceil(size / 2))
    .toString('hex')
    .slice(0, size);
};

module.exports = { generateId };

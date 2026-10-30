const usersService = require('../services/users.service');
const { readJSON, sendJSON } = require('../utils/http');

async function register({ req, res }) {
  const body = await readJSON(req);

  sendJSON(res, 200, {
    username: usersService.validateUsername(body.username),
  });
}

module.exports = { register };

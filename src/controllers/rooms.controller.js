const roomsService = require('../services/rooms.service');
const { readJSON, sendJSON } = require('../utils/http');

async function create({ req, res }) {
  const body = await readJSON(req);

  sendJSON(res, 201, { room: roomsService.create(body.name) });
}

async function rename({ req, res, params }) {
  const body = await readJSON(req);

  sendJSON(res, 200, { room: roomsService.rename(params[0], body.name) });
}

async function remove({ res, params }) {
  roomsService.remove(params[0]);
  sendJSON(res, 200, { ok: true });
}

module.exports = { create, rename, remove };

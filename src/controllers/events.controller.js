const realtime = require('../services/realtime.service');
const roomsService = require('../services/rooms.service');

function stream({ req, res }) {
  realtime.addClient(req, res, {
    name: 'init',
    data: { rooms: roomsService.list() },
  });
}

module.exports = { stream };

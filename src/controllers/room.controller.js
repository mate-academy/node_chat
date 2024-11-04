const roomService = require('../services/room.service');
const messageService = require('../services/message.service');

async function create(req, res) {
  const { name } = req.body;
  const room = await roomService.create(name);

  res.status(201).send(room);
}

async function join(req, res) {
  const { id } = req.params;
  const room = await roomService.join(id);
  const messages = await messageService.getMessages(id);

  res.send(room, messages);
}

async function remove(req, res) {
  const { id } = req.params;

  await roomService.remove(id);

  res.sendStatus(204);
}

async function rename(req, res) {
  const { id } = req.params;
  const { newName } = req.body;
  const renamedRoom = await roomService.rename(id, newName);

  res.send(renamedRoom);
}

module.exports = {
  create,
  join,
  remove,
  rename,
};

const roomService = require('../services/room.service');

const create = async (req, res) => {
  const { name } = req.body;
  const newRoom = await roomService.create(name);

  res.status(201).send(newRoom);
};

const remove = async (req, res) => {
  const { id } = req.params;

  await roomService.remove(id);

  res.sendStatus(204);
};

const rename = async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;
  const renamedRoom = await roomService.rename(id, newName);

  res.send(renamedRoom);
};

module.exports = {
  create,
  remove,
  rename,
};

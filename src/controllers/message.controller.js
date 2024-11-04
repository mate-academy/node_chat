const messageService = require('../services/message.service');

const create = async (req, res) => {
  const { author, text, id } = req.body;
  const message = await messageService.create(author, text, id);

  res.status(201).send(message);
};

module.exports = { create };

import { Message } from '../models/Message.model';
import { User } from '../models/User.model';

const getAll = async (req, res) => {
  const { roomId } = req.query;

  if (!roomId) {
    return res.status(400).json({ error: 'roomId is required' });
  }

  const messages = await Message.findAll({
    where: { roomId: +roomId },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'name'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  res.status(200).json(messages);
};

const create = async (req, res) => {
  const { roomId, authorId, text } = req.body;

  if (!roomId || !authorId || !text) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const message = await Message.create({ roomId, authorId, text });

  res.status(201).json(message);
};

const getById = async (req, res) => {
  const id = +req.params.id;
  const message = await Message.findByPk(id);

  if (!message) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.status(200).json(message);
};

const remove = async (req, res) => {
  const id = +req.params.id;
  const { authorId } = req.body;

  if (!authorId) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const message = await Message.findByPk(id);

  if (!message) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (message.authorId !== authorId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await message.destroy();
  res.sendStatus(204);
};

const update = async (req, res) => {
  const id = +req.params.id;
  const { text, authorId } = req.body;

  if (!text || !authorId) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const message = await Message.findByPk(id);

  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  if (message.authorId !== authorId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await message.update({ text });
  res.status(200).json(message);
};

export const messagesController = {
  getAll,
  create,
  getById,
  remove,
  update,
};

'use strict';

/* eslint-disable no-console */
const { Room, Message, User, UserRoom } = require('../models');

const roomController = {
  // Отримати всі доступні кімнати
  getAll: async (req, res) => {
    try {
      const rooms = await Room.findAll();

      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching rooms' });
    }
  },

  // Створити нову кімнату
  create: async (req, res) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const room = await Room.create({ name });

      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ message: 'Error creating room' });
    }
  },

  join: async (req, res) => {
    const roomId = Number(req.params.id);
    const userId = Number(req.body.userId);

    try {
      await UserRoom.findOrCreate({ where: { roomId, userId } });
      res.status(200).json({ message: 'Joined' });
    } catch (err) {
      res.status(500).json({ message: 'Error joining room' });
    }
  },

  checkMembership: async (req, res) => {
    const roomId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const membership = await UserRoom.findOne({
      where: { roomId, userId },
    });

    res.json({ isMember: !!membership });
  },

  // Отримати історію повідомлень кімнати (Найважливіше!)
  getMessages: async (req, res) => {
    try {
      const { id } = req.params;

      const messages = await Message.findAll({
        where: { roomId: id },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['username'], // Тягнемо тільки ім'я автора
          },
        ],
        order: [['createdAt', 'ASC']], // Від старіших до новіших
      });

      // Перетворюємо дані у зручний формат
      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        userId: msg.userId,
        roomId: msg.roomId,
        authorName: msg.author?.username || 'Unknown',
        createdAt: msg.createdAt,
      }));

      res.json(formattedMessages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching messages' });
    }
  },
};

module.exports = { roomController };

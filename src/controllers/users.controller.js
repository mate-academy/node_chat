'use strict';

/* eslint-disable no-console */

const { User } = require('../models/User.model');

const usersController = {
  login: async (req, res) => {
    const { username } = req.body;

    if (!username || username.trim().length < 2) {
      return res.status(400).json({ message: 'Username is too short' });
    }

    try {
      // Sequelize метод, який автоматично робить перевірку
      const [user, created] = await User.findOrCreate({
        where: { username: username.trim() },
        defaults: { username: username.trim() },
      });

      // Повертаємо юзера клієнту для запису в localStorage
      res.status(created ? 201 : 200).json(user);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getAll: async (req, res) => {
    try {
      const users = await User.findAll();

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users' });
    }
  },
};

module.exports = { usersController };

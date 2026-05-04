'use strict';

const express = require('express');
const { UniqueConstraintError } = require('sequelize');
const { User } = require('../database');
const asyncRoute = require('../middleware/asyncRoute');
const { getUsernameKey } = require('../utils/names');

const router = express.Router();

router.post(
  '/login',
  asyncRoute(async (req, res) => {
    const username = String(req.body.username || '').trim();

    if (!username) {
      return res.status(400).json({
        message: 'Username is required.',
      });
    }

    try {
      await User.create({
        username,
        usernameKey: getUsernameKey(username),
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
          message: 'That name is already in use. Try another.',
        });
      }

      throw error;
    }

    return res.status(201).json({ username });
  }),
);

module.exports = router;

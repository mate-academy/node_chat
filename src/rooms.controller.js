'use strict';

const express = require('express');
const { store } = require('./store');

const router = express.Router();

router.get('/rooms', (_req, res) => {
  res.json(store.listRooms());
});

router.post('/rooms', (req, res) => {
  try {
    const { name } = req.body || {};
    const room = store.createRoom(name);

    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/rooms/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body || {};
    const room = store.renameRoom(id, name);

    res.json(room);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

router.delete('/rooms/:id', (req, res) => {
  try {
    const { id } = req.params;

    store.deleteRoom(id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

router.get('/rooms/:id/messages', (req, res) => {
  try {
    const { id } = req.params;
    const messages = store.listMessages(id);

    res.json(messages);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

module.exports = { roomsRouter: router };

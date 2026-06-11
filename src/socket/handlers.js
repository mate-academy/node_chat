'use strict';

/* eslint-disable no-console */

const { User, Room, Message } = require('../models');

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // ── Username ────────────────────────────────────────────────────────────
    socket.on('setUsername', async (username, callback) => {
      try {
        let user = await User.findOne({ where: { username } });

        if (user) {
          await user.update({ socketId: socket.id });
        } else {
          user = await User.create({ username, socketId: socket.id });
        }

        socket.userId = user.id;
        socket.username = user.username;

        callback({
          success: true,
          user: { id: user.id, username: user.username },
        });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    // ── Rooms ────────────────────────────────────────────────────────────────
    socket.on('getRooms', async (callback) => {
      try {
        const rooms = await Room.findAll({ order: [['createdAt', 'ASC']] });

        callback({ success: true, rooms });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    socket.on('createRoom', async (roomName, callback) => {
      try {
        const room = await Room.create({ name: roomName });

        io.emit('roomCreated', room);
        callback({ success: true, room });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    socket.on('joinRoom', async ({ roomId }, callback) => {
      // Leave all previously joined rooms (except own socket room)
      const prevRooms = [...socket.rooms].filter((r) => r !== socket.id);

      prevRooms.forEach((r) => socket.leave(r));
      socket.join(`room:${roomId}`);
      socket.currentRoomId = roomId;

      try {
        const messages = await Message.findAll({
          where: { roomId },
          include: [{ model: User, as: 'author', attributes: ['username'] }],
          order: [['createdAt', 'ASC']],
        });

        callback({ success: true, messages });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    socket.on('renameRoom', async ({ roomId, newName }, callback) => {
      try {
        const room = await Room.findByPk(roomId);

        if (!room) {
          return callback({ success: false, error: 'Room not found' });
        }

        await room.update({ name: newName });
        io.emit('roomRenamed', { roomId, newName });
        callback({ success: true });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    socket.on('deleteRoom', async ({ roomId }, callback) => {
      try {
        await Message.destroy({ where: { roomId } });
        await Room.destroy({ where: { id: roomId } });

        io.emit('roomDeleted', { roomId });
        callback({ success: true });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    // ── Messages ─────────────────────────────────────────────────────────────
    socket.on('sendMessage', async ({ roomId, text }, callback) => {
      try {
        if (!socket.userId) {
          return callback({ success: false, error: 'Not authenticated' });
        }

        const message = await Message.create({
          text,
          userId: socket.userId,
          roomId,
        });

        const fullMessage = await Message.findByPk(message.id, {
          include: [{ model: User, as: 'author', attributes: ['username'] }],
        });

        io.to(`room:${roomId}`).emit('newMessage', fullMessage);
        callback({ success: true });
      } catch (err) {
        callback({ success: false, error: err.message });
      }
    });

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`Client disconnected: ${socket.id}`);

      if (socket.username) {
        await User.update(
          { socketId: null },
          { where: { username: socket.username } },
        );
      }
    });
  });
};

module.exports = setupSocketHandlers;

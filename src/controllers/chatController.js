const Room = require('../models/Room');
const Message = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    process.stdout.write(`A user connected: ${socket.id}\n`);

    // --- JOIN A ROOM ---
    // When a user opens a room, they join it via the socket
    socket.on('joinRoom', async ({ roomId, username }) => {
      try {
        socket.join(roomId);

        // Send message history to the user who just joined
        const messages = await Message.find({ room: roomId })
          .sort({ createdAt: 1 }) // Oldest first
          .limit(100); // Good practice to limit history size

        socket.emit('messageHistory', messages);

        // Notify others in the room
        socket.to(roomId).emit('userJoined', { username });
      } catch (err) {
        process.stderr.write(`Join room error: ${err.message}\n`);
      }
    });

    // --- SEND A MESSAGE ---
    socket.on('sendMessage', async ({ roomId, author, text }) => {
      try {
        const message = new Message({ room: roomId, author, text });

        await message.save();

        // Broadcast to everyone in the room (including sender)
        io.to(roomId).emit('message', message);
      } catch (err) {
        process.stderr.write(`Send message error: ${err.message}\n`);
      }
    });

    // --- CREATE A ROOM ---
    socket.on('createRoom', async ({ roomName }) => {
      try {
        const room = new Room({ name: roomName });

        await room.save();

        // Notify everyone that a new room is available
        io.emit('roomCreated', room);
      } catch (err) {
        // Handle unique name error
        socket.emit('error', 'Room name already exists');
      }
    });

    // --- RENAME A ROOM ---
    socket.on('renameRoom', async ({ roomId, newName }) => {
      try {
        const updatedRoom = await Room.findByIdAndUpdate(
          roomId,
          { name: newName },
          { new: true, runValidators: true },
        );

        if (updatedRoom) {
          // Broadcast to ALL clients so their sidebars update instantly
          io.emit('roomRenamed', updatedRoom);
        }
      } catch (err) {
        process.stderr.write(`Rename room error: ${err.message}\n`);

        socket.emit(
          'error',
          'Failed to rename room. Name might already be in use.',
        );
      }
    });

    // --- LEAVE A ROOM ---
    socket.on('leaveRoom', ({ roomId, username }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('userLeft', { username });
    });

    socket.on('disconnect', () => {
      process.stdout.write('User disconnected\n');
    });
  });
};

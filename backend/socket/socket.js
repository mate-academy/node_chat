const { default: axios } = require("axios");

function createSocket(io) {
  io.on('connection', (socket) => {
    socket.on('joinRoom', (idRoom) => {
      socket.join(idRoom);
    });

    socket.on('leaveRoom', (idRoom) => {
      socket.leave(idRoom);
    });

    socket.on('sendMessage', async (messageData) => {
      try {
        const response = await axios.post('http://localhost:3001/chat/' + messageData.idRoom, messageData);

        if (response.status !== 200) {
          throw new Error('something went wrong');
        }

        const savedMessage = response.data;

        io.to(messageData.idRoom).emit('newMessage', savedMessage);
      } catch (err) {
        throw new Error(err);
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
}

module.exports = createSocket;

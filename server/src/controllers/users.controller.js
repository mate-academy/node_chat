const registerUserController = (socket) => {
  socket.on('set username', (username) => {
    if (typeof username !== 'string' || username.trim() === '') {
      return;
    }

    socket.data.username = username.trim();

    return username;
  });
};

module.exports = { registerUserController };

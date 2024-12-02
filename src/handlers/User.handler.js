const UserService = require('../services/User.service.js');
const MessageService = require('../services/Message.service.js');
const RoomService = require('../services/Room.service.js');
const { errorHandler } = require('../utils.js');

module.exports = (io, socket) => {
  const createUser = (data) => {
    const user = UserService.buildUser(data);

    UserService.addOne(user);

    const updatedUsers = UserService.getAll();

    io.emit('users', updatedUsers);
    socket.emit('user', user);
  };

  const deleteUser = (data) => {
    UserService.removeOne(data);

    const updatedUsers = UserService.getAll();

    io.emit('users', updatedUsers);
  };

  const joinRoom = async (currentUserId, roomId) => {
    const updatedUser = await UserService.updateCurrentRoom(
      currentUserId,
      roomId,
    );
    const currentRoom = RoomService.getOneById(roomId);
    const users = UserService.getAll();

    const joinMsg = MessageService.buildMsg(
      `${updatedUser.username} joined room`,
      {
        id: 0,
        username: 'Admin',
        currentRoomId: roomId,
      },
    );

    socket.join(currentRoom.name);
    MessageService.addOne(joinMsg);
    socket.emit('user', updatedUser);
    io.emit('users', users);
    socket.emit('currentRoom', currentRoom);
    socket.broadcast.to(currentRoom.name).emit('message', joinMsg);
  };

  const disconnect = () => {
    const user = UserService.getOneById(socket.id);

    if (user && user.currentRoom) {
      const currentRoom = user.currentRoom.name;
      const exitMsg = MessageService.buildMsg(`${user.username} left room`, {
        id: 0,
        username: 'Admin',
        currentRoom: currentRoom,
      });

      socket.leave(currentRoom);
      socket.broadcast.to(currentRoom).emit('message', exitMsg);
    }

    UserService.removeOne(socket.id);
    io.emit('users', UserService.users);

    // eslint-disable-next-line no-console
    console.log(`User ${socket.id} disconnected`);
  };

  const leaveRoom = (data) => {
    const exitMsg = MessageService.buildMsg(`${data.username} left room`, {
      id: 0,
      username: 'Admin',
      currentRoom: data.room,
    });
    const user = data;
    const currentRoom = user?.currentRoom?.name;

    socket.leave(currentRoom);
    MessageService.addOne(exitMsg);
    socket.broadcast.to(currentRoom).emit('message', exitMsg);

    const updatedUser = UserService.updateCurrentRoom(user.id, null);
    const updatedUsers = UserService.getAll();

    socket.emit('user', updatedUser);
    io.emit('users', updatedUsers);
  };

  socket.on('createUser', errorHandler(createUser));
  socket.on('deleteUser', errorHandler(deleteUser));
  socket.on('joinRoom', errorHandler(joinRoom));
  socket.on('leaveRoom', errorHandler(leaveRoom));
  socket.on('disconnect', errorHandler(disconnect));
};

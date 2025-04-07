

const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const {
  generateMessage,

} = require('./utils/messages');

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/user');


const app = express();

const server = http.createServer(app);

const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');


app.use(express.static(publicDirectoryPath));


io.on('connection', (socket) => {
  console.log('New WebSocket connection');


  socket.on('join', ({ username, room }, callback) => {

    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(room);
    socket.emit(
      'message',
      generateMessage( `Welcome ${user.username}!`),
    );
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage(`${user.username} has joined`),
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on('sendMessage', (message, callback) => {


    const user = getUser(socket.id);

    if (!user) {
      return callback('You are not authenticated');
    }



    io.to(user.room).emit('message', generateMessage(`${user.username} ${message}`));
    callback();
  });



  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage(`${user.username} has left`),
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
    console.log('WebSocket disconnect');
  });


});


server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});

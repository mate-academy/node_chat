import { randomUUID } from 'node:crypto';

import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';
const ROOM_ID = 'eb12cf4e-8763-4ddf-9a89-df17cffba669';

const users = {
  anton: {
    id: '38e56bdd-04ea-4d08-8302-25b856b523ae',
    name: 'Anton',
  },
  alex: {
    id: '92bd1a04-3d66-431d-91ed-ce270ee72dd9',
    name: 'Alex',
  },
};

const anton = io(SERVER_URL, {
  autoConnect: false,
});

const alex = io(SERVER_URL, {
  autoConnect: false,
});

const joinedUsers = new Set<string>();
const receivedUsers = new Set<string>();

let messageSent = false;
let testFinished = false;

const timeout = setTimeout(() => {
  finishTest(false, 'WebSocket test timed out');
}, 10000);

function finishTest(success: boolean, message: string) {
  if (testFinished) {
    return;
  }

  testFinished = true;

  clearTimeout(timeout);
  anton.disconnect();
  alex.disconnect();

  console.log(message);

  if (!success) {
    process.exitCode = 1;
  }
}

function joinRoom(socket: Socket, userId: string) {
  socket.emit('room:join', {
    roomId: ROOM_ID,
    userId,
  });
}

function sendMessageWhenReady() {
  if (joinedUsers.size !== 2 || messageSent) {
    return;
  }

  messageSent = true;

  anton.emit('message:send', {
    roomId: ROOM_ID,
    authorId: users.anton.id,
    clientMessageId: randomUUID(),
    text: 'Realtime message from Anton',
  });
}

function registerClient(
  socket: Socket,
  user: {
    id: string;
    name: string;
  },
) {
  socket.on('connect', () => {
    console.log(`${user.name} connected:`, socket.id);
    joinRoom(socket, user.id);
  });

  socket.on('room:joined', (data) => {
    console.log(`${user.name} joined:`, data);

    joinedUsers.add(user.id);
    sendMessageWhenReady();
  });

  socket.on('message:created', (message) => {
    console.log(`${user.name} received:`, message);

    receivedUsers.add(user.id);

    if (receivedUsers.size === 2) {
      finishTest(true, 'WebSocket smoke test passed');
    }
  });

  socket.on('exception', (error) => {
    finishTest(false, `${user.name} error: ${JSON.stringify(error)}`);
  });

  socket.on('connect_error', (error) => {
    finishTest(false, `${user.name} connection error: ${error.message}`);
  });
}

registerClient(anton, users.anton);
registerClient(alex, users.alex);

anton.connect();
alex.connect();

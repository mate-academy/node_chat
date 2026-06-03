'use strict';

const { MessageType } = require('../constants');

function send(ws, payload) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function sendError(ws, message) {
  send(ws, { type: MessageType.ERROR, message });
}

function broadcast(clients, payload, exceptWs = null) {
  for (const client of clients) {
    if (client.ws !== exceptWs) {
      send(client.ws, payload);
    }
  }
}

function broadcastToRoom(clients, roomId, payload, exceptWs = null) {
  for (const client of clients) {
    if (client.roomId === roomId && client.ws !== exceptWs) {
      send(client.ws, payload);
    }
  }
}

function handleSetUsername(client, clients, store, data) {
  const username = data.username?.trim();

  if (!username) {
    sendError(client.ws, 'Username is required');

    return;
  }

  const taken = [...clients].some(
    (other) => other !== client && other.username === username,
  );

  if (taken) {
    sendError(client.ws, 'Username is already taken');

    return;
  }

  client.username = username;

  if (!client.roomId) {
    client.roomId = store.defaultRoomId;
  }

  send(client.ws, {
    type: MessageType.USERNAME_SET,
    username,
    roomId: client.roomId,
    rooms: store.getRoomsList(),
  });

  sendRoomHistory(client, store);
  broadcastRooms(clients, store);
}

function sendRoomHistory(client, store) {
  const room = store.getRoom(client.roomId);

  if (!room) {
    return;
  }

  send(client.ws, {
    type: MessageType.ROOM_HISTORY,
    roomId: room.id,
    messages: room.messages,
  });
}

function broadcastRooms(clients, store) {
  broadcast(clients, {
    type: MessageType.ROOMS_UPDATED,
    rooms: store.getRoomsList(),
  });
}

function handleSendMessage(client, clients, store, data) {
  if (!client.username) {
    sendError(client.ws, 'Set a username first');

    return;
  }

  const text = data.text?.trim();

  if (!text) {
    return;
  }

  const roomId = data.roomId || client.roomId;
  const message = store.addMessage(roomId, client.username, text);

  if (!message) {
    sendError(client.ws, 'Room not found');

    return;
  }

  const payload = {
    type: MessageType.MESSAGE,
    roomId,
    message,
  };

  broadcastToRoom(clients, roomId, payload);
}

function handleCreateRoom(client, clients, store, data) {
  if (!client.username) {
    sendError(client.ws, 'Set a username first');

    return;
  }

  const name = data.name?.trim();

  if (!name) {
    sendError(client.ws, 'Room name is required');

    return;
  }

  const room = store.addRoom(name);

  client.roomId = room.id;
  sendRoomHistory(client, store);
  broadcastRooms(clients, store);
}

function handleRenameRoom(client, clients, store, data) {
  if (!client.username) {
    sendError(client.ws, 'Set a username first');

    return;
  }

  const name = data.name?.trim();

  if (!name) {
    sendError(client.ws, 'Room name is required');

    return;
  }

  const room = store.renameRoom(data.roomId, name);

  if (!room) {
    sendError(client.ws, 'Room not found');

    return;
  }

  broadcastRooms(clients, store);
}

function handleJoinRoom(client, clients, store, data) {
  if (!client.username) {
    sendError(client.ws, 'Set a username first');

    return;
  }

  const room = store.getRoom(data.roomId);

  if (!room) {
    sendError(client.ws, 'Room not found');

    return;
  }

  client.roomId = room.id;
  sendRoomHistory(client, store);
}

function handleDeleteRoom(client, clients, store, data) {
  if (!client.username) {
    sendError(client.ws, 'Set a username first');

    return;
  }

  const deleted = store.deleteRoom(data.roomId);

  if (!deleted) {
    sendError(client.ws, 'Cannot delete this room');

    return;
  }

  for (const other of clients) {
    if (other.roomId === data.roomId) {
      other.roomId = store.defaultRoomId;
      sendRoomHistory(other, store);
    }
  }

  broadcastRooms(clients, store);
}

function handleMessage(client, clients, store, raw) {
  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    sendError(client.ws, 'Invalid message format');

    return;
  }

  switch (data.type) {
    case MessageType.SET_USERNAME:
      handleSetUsername(client, clients, store, data);
      break;
    case MessageType.SEND_MESSAGE:
      handleSendMessage(client, clients, store, data);
      break;
    case MessageType.CREATE_ROOM:
      handleCreateRoom(client, clients, store, data);
      break;
    case MessageType.RENAME_ROOM:
      handleRenameRoom(client, clients, store, data);
      break;
    case MessageType.JOIN_ROOM:
      handleJoinRoom(client, clients, store, data);
      break;
    case MessageType.DELETE_ROOM:
      handleDeleteRoom(client, clients, store, data);
      break;
    default:
      sendError(client.ws, 'Unknown message type');
  }
}

function attachWebSocket({ wss, clients, store }) {
  wss.on('connection', (ws) => {
    const client = { ws, username: null, roomId: null };

    clients.add(client);

    ws.on('message', (raw) => {
      handleMessage(client, clients, store, raw.toString());
    });

    ws.on('close', () => {
      clients.delete(client);
      broadcastRooms(clients, store);
    });
  });
}

module.exports = { attachWebSocket };

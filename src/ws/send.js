/* eslint-disable no-console */
const { WebSocket } = require('ws');

function broadcast(wss, data) {
  const dataJSON = JSON.stringify(data);

  for (const user of wss.clients) {
    if (user.readyState === WebSocket.OPEN) {
      user.send(dataJSON);
    }
  }
}

function sendTo(client, data) {
  const dataJSON = JSON.stringify(data);

  if (client.readyState === WebSocket.OPEN) {
    client.send(dataJSON);
  }
}

function broadcastToRoom(wss, roomId, data) {
  const dataJSON = JSON.stringify(data);

  for (const user of wss.clients) {
    if (roomId !== user.roomId) {
      continue;
    }

    if (user.readyState === WebSocket.OPEN) {
      user.send(dataJSON);
    }
  }
}

module.exports = {
  broadcast,
  broadcastToRoom,
  sendTo,
};

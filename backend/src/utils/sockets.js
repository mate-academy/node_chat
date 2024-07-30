const { WebSocketServer, WebSocket } = require('ws');
const EventEmitter = require('events');

const wss = new WebSocketServer({ port: 5777 });
const eventEmitter = new EventEmitter();

const sendData = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

eventEmitter.on('messageAdd', (data) => {
  const preparedPayload = { type: 'messageAdd', payload: data }
  sendData(preparedPayload);
});

eventEmitter.on('removeRoom', (data) => {
  const preparedPayload = { type: 'removeRoom', payload: data }
  sendData(preparedPayload);
});

eventEmitter.on('updateRoom', (data) => {
  const preparedPayload = { type: 'updateRoom', payload: data }
  sendData(preparedPayload);
});

eventEmitter.on('addRoom', (data) => {
  const preparedPayload = { type: 'addRoom', payload: data }
  sendData(preparedPayload);
});


module.exports = {
  eventEmitter,
}

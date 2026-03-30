import { roomActions } from './store.js';

const ActionType = Object.freeze({
  GET_ROOMS: 'GET_ROOMS',
  CREATE_ROOM: 'CREATE_ROOM',
  ADD_MESSAGE: 'ADD_MESSAGE',
  DELETE_ROOM: 'DELETE_ROOM',
  RENAME_ROOM: 'RENAME_ROOM',
});

function broadcast(wss, actionType, payload) {
  const message = JSON.stringify({ type: actionType, payload });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

export function processClientMessage(data, client, wss) {
  try {
    const parsedData = JSON.parse(data);
    const { type, payload } = parsedData;

    switch (type) {
      case ActionType.GET_ROOMS: {
        if (client.readyState === 1) {
          client.send(
            JSON.stringify({
              type: ActionType.GET_ROOMS,
              payload: roomActions.getRooms(),
            }),
          );
        }
        break;
      }

      case ActionType.CREATE_ROOM: {
        roomActions.addRoom(payload);
        broadcast(wss, ActionType.CREATE_ROOM, roomActions.getRooms());
        break;
      }

      case ActionType.ADD_MESSAGE: {
        roomActions.addMessage(payload.roomId, payload.message);
        broadcast(wss, ActionType.ADD_MESSAGE, roomActions.getRooms());
        break;
      }

      case ActionType.DELETE_ROOM: {
        roomActions.deleteRoom(payload.roomId);
        broadcast(wss, ActionType.DELETE_ROOM, roomActions.getRooms());
        break;
      }

      case ActionType.RENAME_ROOM: {
        roomActions.renameRoom(payload.roomId, payload.name);
        broadcast(wss, ActionType.RENAME_ROOM, roomActions.getRooms());
        break;
      }
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unknown event type: ${type}`);
        break;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Message processing error:', error);
  }
}

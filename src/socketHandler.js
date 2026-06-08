'use strict';

const WebSocket = require('ws');
const chatState = require('./state');

const disconnectTimeouts = new Map();
const activeUsers = new Set();

const broadcastToAll = (eventPayload) => {
  const data = JSON.stringify(eventPayload);

  for (const clientWs of chatState.getAllClients().keys()) {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  }
};

const broadcastToRoom = (roomId, eventPayload) => {
  const data = JSON.stringify(eventPayload);

  for (const [clientWs, meta] of chatState.getAllClients().entries()) {
    if (clientWs.readyState === WebSocket.OPEN && meta.currentRoom === roomId) {
      clientWs.send(data);
    }
  }
};

const initSocketHandler = (wss) => {
  wss.on('connection', (ws) => {
    chatState.registerClient(ws);

    const defaultRoomId = chatState.getDefaultRoomId();
    const clientMeta = chatState.getClientMeta(ws);

    ws.send(
      JSON.stringify({
        type: 'ROOM_JOIN_SUCCESS',
        payload: {
          room: chatState.getRoom(defaultRoomId),
          history: chatState.getHistory(defaultRoomId),
        },
      }),
    );

    ws.on('message', (messageBuffer) => {
      try {
        const { type, payload } = JSON.parse(messageBuffer.toString());

        if (!clientMeta) {
          return;
        }

        switch (type) {
          case 'USER_INIT': {
            const cleanUsername = String(payload.username || '')
              .trim()
              .substring(0, 30);

            if (!cleanUsername) {
              break;
            }

            clientMeta.username = cleanUsername;

            const lowerUser = cleanUsername.toLowerCase();

            if (disconnectTimeouts.has(lowerUser)) {
              clearTimeout(disconnectTimeouts.get(lowerUser));
              disconnectTimeouts.delete(lowerUser);
            } else if (!activeUsers.has(lowerUser)) {
              activeUsers.add(lowerUser);

              const sysMsg = chatState.addMessage(
                defaultRoomId,
                'System',
                `Користувач ${cleanUsername} увійшов до чату.`,
              );

              if (sysMsg) {
                broadcastToRoom(defaultRoomId, {
                  type: 'MSG_RECEIVE',
                  payload: sysMsg,
                });
              }
            }

            break;
          }

          case 'ROOM_CREATE': {
            const roomName = String(payload.name || '')
              .trim()
              .substring(0, 40);

            if (!roomName) {
              break;
            }

            const newRoom = chatState.createRoom(roomName, clientMeta.username);

            if (!newRoom) {
              ws.send(
                JSON.stringify({
                  type: 'ERROR',
                  payload: 'Кімната з такою назвою вже існує!',
                }),
              );

              break;
            }

            clientMeta.currentRoom = newRoom.id;

            ws.send(
              JSON.stringify({
                type: 'ROOM_JOIN_SUCCESS',
                payload: { room: newRoom, history: [] },
              }),
            );

            break;
          }

          case 'ROOM_JOIN': {
            const searchName = String(payload.roomName || '').trim();
            const targetRoom = chatState.getRoom(searchName);

            if (!targetRoom) {
              ws.send(
                JSON.stringify({
                  type: 'ERROR',
                  payload: `Кімнату "${searchName}" не знайдено.`,
                }),
              );

              break;
            }

            const oldRoomId = clientMeta.currentRoom;

            if (oldRoomId === targetRoom.id) {
              break;
            }

            clientMeta.currentRoom = targetRoom.id;

            ws.send(
              JSON.stringify({
                type: 'ROOM_JOIN_SUCCESS',
                payload: {
                  room: targetRoom,
                  history: chatState.getHistory(targetRoom.id),
                },
              }),
            );

            break;
          }

          case 'ROOM_RENAME': {
            const { roomId, newName } = payload;
            const cleanNewName = String(newName || '')
              .trim()
              .substring(0, 40);

            if (!cleanNewName) {
              break;
            }

            const updatedRoom = chatState.renameRoom(roomId, cleanNewName);

            if (updatedRoom) {
              broadcastToAll({
                type: 'ROOM_RENAME_SUCCESS',
                payload: { room: updatedRoom },
              });
            }

            break;
          }

          case 'ROOM_DELETE': {
            const { roomId } = payload;

            if (roomId === defaultRoomId) {
              break;
            }

            if (chatState.deleteRoom(roomId)) {
              for (const [clientWs, meta] of chatState
                .getAllClients()
                .entries()) {
                if (meta.currentRoom === roomId) {
                  meta.currentRoom = defaultRoomId;

                  if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'ROOM_EVICTION',
                        payload: {
                          targetRoomId: defaultRoomId,
                          deletedRoomId: roomId,
                        },
                      }),
                    );

                    clientWs.send(
                      JSON.stringify({
                        type: 'ROOM_JOIN_SUCCESS',
                        payload: {
                          room: chatState.getRoom(defaultRoomId),
                          history: chatState.getHistory(defaultRoomId),
                        },
                      }),
                    );
                  }
                } else {
                  if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'ROOM_DELETED_NOTIFY',
                        payload: { deletedRoomId: roomId },
                      }),
                    );
                  }
                }
              }
            }

            break;
          }

          case 'MSG_SEND': {
            const currentRoomId = clientMeta.currentRoom;
            const textMessage = String(payload.text || '')
              .trim()
              .substring(0, 3000);

            if (!textMessage || !chatState.hasRoom(currentRoomId)) {
              break;
            }

            const msg = chatState.addMessage(
              currentRoomId,
              clientMeta.username,
              textMessage,
            );

            if (msg) {
              broadcastToRoom(currentRoomId, {
                type: 'MSG_RECEIVE',
                payload: msg,
              });
            }

            break;
          }

          default:
            break;
        }
      } catch (err) {}
    });

    ws.on('close', () => {
      if (
        clientMeta &&
        clientMeta.username &&
        clientMeta.username !== 'Anonymous'
      ) {
        const usernameToLog = clientMeta.username;
        const lowerUser = usernameToLog.toLowerCase();
        const lastRoomId = clientMeta.currentRoom;
        let hasOtherTabs = false;

        for (const [clientWs, meta] of chatState.getAllClients().entries()) {
          if (clientWs !== ws && meta.username.toLowerCase() === lowerUser) {
            hasOtherTabs = true;

            break;
          }
        }

        if (!hasOtherTabs) {
          const timeoutId = setTimeout(() => {
            activeUsers.delete(lowerUser);
            disconnectTimeouts.delete(lowerUser);

            if (chatState.hasRoom(lastRoomId)) {
              const disconnectMsg = chatState.addMessage(
                lastRoomId,
                'System',
                `Користувач ${usernameToLog} вийшов з мережі.`,
              );

              if (disconnectMsg) {
                broadcastToRoom(lastRoomId, {
                  type: 'MSG_RECEIVE',
                  payload: disconnectMsg,
                });
              }
            }
          }, 2000);

          disconnectTimeouts.set(lowerUser, timeoutId);
        }
      }

      chatState.unregisterClient(ws);
    });
  });
};

module.exports = initSocketHandler;

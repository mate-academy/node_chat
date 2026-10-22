# Realtime chat server

WebSocket server for the realtime chat client. The server listens at
`ws://localhost:3005` by default and implements the JSON protocol described
below.

## Run

```sh
npm install
npm start
```

Set `WS_PORT` to use another port. Set `CHAT_DATA_FILE` to change the path of
the JSON file used to persist rooms and message history. By default, data is
stored in `data/chat-data.json`. Keep this file between restarts to preserve
room history.

## Protocol

Send one JSON object per WebSocket text frame. The server sends a `rooms` event
on connection and whenever rooms change. Room creation, renaming, and deletion
events are broadcast to all connected clients. New messages are broadcast only
to clients that have joined that room.

| Request | Fields | Purpose |
| --- | --- | --- |
| `set_username` | `username` | Register the connection's username. |
| `list_rooms` | — | Request the available rooms. |
| `create_room` | `name` | Create a room. |
| `rename_room` | `roomId`, `name` | Rename a room. |
| `join_room` | `roomId` | Join a room and receive its complete history. |
| `delete_room` | `roomId` | Delete a room and its messages. |
| `send_message` | `roomId`, `text` | Send a message as the registered username. |

The server responds with `rooms`, `room_created`, `room_renamed`,
`room_deleted`, `room_joined`, `message`, or `error` events. Message history is
returned in chronological order. Usernames are limited to 32 characters, room
names to 50 characters, and message text to 2000 characters.

## Server structure

- `src/models/ChatRepository.js` loads and saves room and message data.
- `src/services/ChatService.js` encapsulates chat rules, persistence access,
  and connected-client room membership.
- `src/controllers/ChatController.js` maps JSON requests to service operations
  and protocol events.
- `src/websocket/chatWebSocketServer.js` manages WebSocket connections and
  message delivery.
- `src/index.js` wires the layers together and starts the server.

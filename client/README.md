# Realtime chat client

React chat client that uses a JSON WebSocket API for usernames, rooms, and
messages. The username is kept in browser `localStorage` under
`chat-username`. The server is a separate application and must implement the
protocol below, including persistent room message history.

## Run the client

```sh
npm install
npm start
```

The client connects to `ws://localhost:3005` by default. To use another
WebSocket endpoint, set `REACT_APP_WS_URL` in a `.env.local` file, for example:

```env
REACT_APP_WS_URL=ws://localhost:8080
```

Use `wss://` when the client is served over HTTPS.

## WebSocket JSON protocol

Each WebSocket frame contains one JSON object. The client sends a `type` field
with the request. The server should respond with the event types listed below;
room and message changes should be sent to all affected connected clients.

### Client requests

| Request | Fields | Purpose |
| --- | --- | --- |
| `set_username` | `username` | Register or update this connection's username. |
| `list_rooms` | — | Request the available rooms. |
| `create_room` | `name` | Create a room. |
| `rename_room` | `roomId`, `name` | Rename a room. |
| `join_room` | `roomId` | Join a room and request its complete history. |
| `delete_room` | `roomId` | Delete a room and its messages. |
| `send_message` | `roomId`, `text` | Send a message to a room. The server supplies author and time. |

### Server events

| Event | Fields | Purpose |
| --- | --- | --- |
| `rooms` | `rooms: [{ id, name }]` | Initial or refreshed room list. |
| `room_created` | `room: { id, name }` | Room created and added to the room list. |
| `room_renamed` | `room: { id, name }` | Room renamed. |
| `room_deleted` | `roomId` | Room deleted. |
| `room_joined` | `room: { id, name }`, `messages: [...]` | Join confirmation with all prior messages in that room. |
| `history` | `roomId`, `messages: [...]` | Optional separate history response to `join_room`. |
| `message` | `roomId`, `message` | New room message, broadcast to its members. |
| `error` | `message` | Request or server error to display to the user. |

Messages have the shape
`{ id, roomId, author, time, text }`; `time` should be an ISO-8601 timestamp.
When the client joins a room, the server must return its full message history
in chronological order. The server should validate requests and use the
registered username as the message author rather than trusting a client-sent
author field.

## Other scripts

- `npm test` — run the test runner.
- `npm run build` — create a production build.

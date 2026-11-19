# Chat (with Node.js)

Implement a chat application (both client and server)

- You type a username and send it to the server
- It is now username (save it in localStorage)
- All the messages should have an author, time and text
- Implement an ability to create rooms (create / rename / join / delete)
- New user should see all prev messages in the room

**Read [the guideline](https://github.com/mate-academy/js_task-guideline/blob/master/README.md) before start**

## Tech stack

- **Server:** Node.js, Express, TypeScript, TypeORM, PostgreSQL, Socket.IO
- **Client:** React, TypeScript, Vite, Socket.IO client

## Features

- Pick a unique username. It is saved in `localStorage` and checked against the server on every visit.
- Create, rename, delete and join rooms. Every open client sees room changes live.
- Every message has an author, a time and a text.
- Messages arrive in real time. A user who joins a room sees all earlier messages.

## Requirements

- Node.js 20+
- PostgreSQL running locally

## Setup

### 1. Database

```bash
createdb node_chat
```

The tables are created automatically when the server starts.

### 2. Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

`.env` variables:

| Variable       | Default                               | Description                  |
| -------------- | ------------------------------------- | ---------------------------- |
| `DATABASE_URL` | `postgres://localhost:5432/node_chat` | PostgreSQL connection string |
| `PORT`         | `3001`                                | Server port                  |

### 3. Client

In a second terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

`.env` variables:

| Variable       | Default                 | Description           |
| -------------- | ----------------------- | --------------------- |
| `VITE_API_URL` | `http://localhost:3001` | Address of the server |

Open the address Vite prints (usually http://localhost:5173).

To try the chat as two different users, open a second browser window in private/incognito mode. Normal tabs share the same `localStorage`, so they are the same user.

## Scripts

| Folder   | Command         | Description                         |
| -------- | --------------- | ----------------------------------- |
| `server` | `npm run dev`   | Start the server with auto-restart  |
| `server` | `npm run build` | Compile TypeScript to `dist/`       |
| `server` | `npm start`     | Run the compiled server             |
| `client` | `npm run dev`   | Start the Vite dev server           |
| `client` | `npm run build` | Type-check and build for production |

## REST API

| Method   | Path                  | Description                                              |
| -------- | --------------------- | -------------------------------------------------------- |
| `POST`   | `/users`              | Create a user `{ username }`. `409` if the name is taken |
| `GET`    | `/users/:username`    | Check that a user exists. `404` if not                   |
| `GET`    | `/rooms`              | List rooms                                               |
| `POST`   | `/rooms`              | Create a room `{ name }`. `409` if the name is taken     |
| `PATCH`  | `/rooms/:id`          | Rename a room `{ name }`                                 |
| `DELETE` | `/rooms/:id`          | Delete a room and its messages                           |
| `GET`    | `/rooms/:id/messages` | Message history of a room, oldest first                  |
| `GET`    | `/health`             | Server and database check                                |

## Socket events

Client to server:

| Event          | Payload                      | Description                                                 |
| -------------- | ---------------------------- | ----------------------------------------------------------- |
| `join_room`    | `roomId`                     | Start receiving messages of a room                          |
| `leave_room`   | `roomId`                     | Stop receiving messages of a room                           |
| `send_message` | `{ roomId, username, text }` | Save and broadcast a message. Answers with `{ ok, error? }` |

Server to client:

| Event          | Payload                                   | Description                         |
| -------------- | ----------------------------------------- | ----------------------------------- |
| `new_message`  | `{ id, text, createdAt, author, roomId }` | A message was sent in a joined room |
| `room_created` | room                                      | A room was created                  |
| `room_renamed` | room                                      | A room was renamed                  |
| `room_deleted` | `{ id }`                                  | A room was deleted                  |

## Project structure

```
client/   React application
server/   Express API, Socket.IO and TypeORM entities
```

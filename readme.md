# Chat (with Node.js)

Implement a chat application (both client and server)

- You type a username and send it to the server
- It is now username (save it in localStorage)
- All the messages should have an author, time and text
- Implement an ability to create rooms (create / rename / join / delete)
- New user should see all prev messages in the room

**Read [the guideline](https://github.com/mate-academy/js_task-guideline/blob/master/README.md) before start**

## How to run

### Server

From the project root:

npm install
npm run dev

Server runs on http://localhost:3005

### Client

In a second terminal:

cd client
npm install
npm run dev

Open http://localhost:5173

## Features

- Ask your name first
- Create rooms
- Online chatting between clients
- Renaming, removing rooms

## Tech

- Server: cors, express, ws
- Client: axios, react, react-dom

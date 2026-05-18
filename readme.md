# Chat (with Node.js)

Real-time chat built with a Node.js + Socket.IO server and a Vite-powered client.

## Features

- Username is entered once and persisted in `localStorage`
- Every message stores author, time and text
- Rooms: create / rename / join / delete (the `General` room cannot be deleted)
- New users joining a room see its full message history

## Run locally

Install dependencies:

```bash
npm install
```

Start the Socket.IO server (port `3000`):

```bash
npm run server
```

In a separate terminal, start the Vite dev server (port `5173`):

```bash
npm start
```

Then open http://localhost:5173 in your browser.

**Read [the guideline](https://github.com/mate-academy/js_task-guideline/blob/master/README.md) before start**

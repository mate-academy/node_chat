# Chat client

React single-page app for the node_chat project, built with [Vite](https://vitejs.dev/).

## Requirements

- Node.js
- The backend server (`../index.js`) running on port `3000` — the message form
  sends requests to `http://127.0.0.1:3000/messages`.

## Available scripts

Run these from the `src/client/` directory.

### `npm install`

Installs dependencies.

### `npm run dev`

Starts the development server with hot module replacement.\
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run build`

Builds the app for production into the `dist/` folder.

### `npm run preview`

Serves the production build locally to preview it.

## Project structure

- `index.html` — Vite entry point, loads `src/main.jsx`
- `src/main.jsx` — React entry point
- `src/App.jsx` — root component
- `src/MessageForm.jsx`, `src/MessageList.jsx` — message form and list
# Chat (with Node.js) 
Implement a chat application (both client and server)

- You type a username and send it to the server
- It is now username (save it in localStorage)
- All the messages should have an author, time and text
- Implement an ability to create rooms (create / rename / join / delete)
- New user should see all prev messages in the room

**Read [the guideline](https://github.com/mate-academy/js_task-guideline/blob/master/README.md) before start**

## Local development

The project has a React/Vite frontend, a Node.js/Express and Socket.IO backend,
and a PostgreSQL database.

### Requirements

- Node.js 20 or newer and npm
- PostgreSQL

### Setup and run

1. Create a PostgreSQL database named `node_chat` (for example, run
   `createdb node_chat`).
2. Create `server/.env` using the values in [`.env.example.json`](./.env.example.json).
   This JSON file is a reference template; `server/.env` must use dotenv's
   `KEY=value` format. Set `DB_USERNAME` and `DB_PASSWORD` to a PostgreSQL
   account that can access the database.
3. Install dependencies from the repository root:

   ```sh
   npm ci
   npm ci --prefix server
   npm ci --prefix client
   ```

4. Start the server and client in separate terminals:

   ```sh
   npm --prefix server run dev
   ```

   ```sh
   npm --prefix client run dev
   ```

5. Open the Vite URL printed in the client terminal (usually
   `http://localhost:5173`). The Vite development server proxies API and
   Socket.IO requests to `http://localhost:3000`.

The backend connects to PostgreSQL, synchronizes its models, and creates the
`General` room if the database has no rooms yet.

### Environment variables

The backend reads these variables from `server/.env`:

| Variable | Purpose | Local example |
| --- | --- | --- |
| `PORT` | Backend and Socket.IO server port | `3000` |
| `FRONTEND_URL` | Allowed client origin for HTTP and Socket.IO | `http://localhost:5173` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `node_chat` |
| `DB_USERNAME` | PostgreSQL username | Your local PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password | Your local PostgreSQL password |

Do not commit real credentials. The example file contains placeholders only.

### Project layout

- `client/` — React frontend and Vite development server.
- `server/` — Express API, Socket.IO chat server, and Sequelize models.

The root `package.json` is intentional: it contains shared repository tooling
and scripts used by GitHub Actions, including `npm test`. The client and server
keep their own package manifests and dependencies.

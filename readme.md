# Chat (with Node.js)
Implement a chat application (both client and server)

- You type a username and send it to the server
- It is now username (save it in localStorage)
- All the messages should have an author, time and text
- Implement an ability to create rooms (create / rename / join / delete)
- New user should see all prev messages in the room

## Run locally

```bash
npm install
npm --prefix src/backend install
npm --prefix src/frontend install
```

Start the backend server:

```bash
npm run backend
```

Start the frontend:

```bash
npm --prefix src/frontend run dev
```

**Read [the guideline](https://github.com/mate-academy/js_task-guideline/blob/master/README.md) before start**

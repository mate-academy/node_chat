# Chat (with Node.js)
Implement a chat application (both client and server)

- You type a username and send it to the server
- It is now username (save it in localStorage)
- All the messages should have an author, time and text
- Implement an ability to create rooms (create / rename / join / delete)
- New user should see all prev messages in the room

**Read [the guideline](https://github.com/mate-academy/js_task-guideline/blob/master/README.md) before start**

[DEMO LINK](https://luchali.github.io/node_chat/)


## How to run the project locally

### Requirements
Make sure you have installed:
- Node.js 20+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/luchali/node_chat.git
cd node_chat
```
### 2. Install root dependencies:
npm install

### 3. Install client dependencies:
npm install --prefix client

### 4. Install server dependencies:
npm install --prefix server

** The .env file inside the server folder should contain: PORT=3000

### 5. Build the server
npm run build --prefix server

### 6. Run the project
npm run dev

The client will be available at:

```txt
http://localhost:5173
```

The server will be available at:

```txt
http://localhost:3000
```

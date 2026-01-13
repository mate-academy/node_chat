'use strict';
import express from "express";
import cors from "cors";
import { WebSocketServer } from 'ws';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3005;

const rooms = [
  { id: "r1", name: "General", createdAt: new Date().toISOString() },
  { id: "r2", name: "Random", createdAt: new Date().toISOString() },
];
const messages = [];
const users = new Map();

app.post("/auth", (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "username is required" })
  }

  res.status(200).json({ ok: true })
})

const genId = () => Math.random().toString(36).slice(2, 9);

app.get("/rooms", (req, res) => {
  res.json(rooms);
});

app.post('/rooms', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const room = { id: genId(), name, createdAt: new Date().toISOString() };
  rooms.push(room);
  broadcast({ type: "room_created", room });
  res.status(201).json(room);
})

app.put("/rooms/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const room = rooms.find((x) => x.id === id);
  if (!room) return res.status(404).json({ error: "not found" });
  room.name = name ?? room.name;
  broadcast({ type: "room_renamed", room: room });
  res.json(room);
});

app.delete("/rooms/:id", (req, res) => {
  const { id } = req.params;
  const idx = rooms.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  rooms.splice(idx, 1);
  // optionally remove messages for that room:
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].roomId === id) messages.splice(i, 1);
  }
  broadcast({ type: "room_deleted", roomId: id });
  res.status(204).send();
});

app.get("/rooms/:id/messages", (req, res) => {
  const { id } = req.params;
  const roomMessages = messages.filter((m) => m.roomId === id);
  res.json(roomMessages);
});


app.post("/messages", (req, res) => {
  const { roomId, author, text } = req.body;
  if (!roomId || !author || !text) {
    return res.status(400).json({ error: "roomId, author, text required" });
  }
  const msg = { id: genId(), roomId, author, text, time: new Date().toISOString() };
  messages.push(msg);
  // broadcast to websockets
  broadcast({ type: "new_message", message: msg });
  res.status(201).json(msg);
});

const server = app.listen(PORT, () => {
  console.log("Server is running");
})

const wss = new WebSocketServer({ server });

function broadcast(payload) {
  const data = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(data);
    }
  }
}

wss.on("connection", (ws) => {
  console.log("ws connected");
  ws.on("message", (raw) => {
    // accept JSON messages from websocket clients optionally
    try {
      const obj = JSON.parse(raw.toString());

      if (obj.type === "auth") {
        ws.username = obj.username;
        return;
      }

      if (obj?.type === "send_message") {
        const { roomId, author, text } = obj;
        if (!roomId || !author || !text) return;
        const msg = { id: genId(), roomId, author: ws.username, text, time: new Date().toISOString() };
        messages.push(msg);
        broadcast({ type: "new_message", message: msg });
      }
    } catch (e) {
      console.warn("invalid ws payload", e);
    }
  });

  ws.on("close", () => {
    console.log("ws closed");
  });
});

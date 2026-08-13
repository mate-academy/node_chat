import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());
app.use(express.json());

const server = app.listen(3005);
const wss = new WebSocketServer({ server });

const rooms = {
  general: { id: "general", name: "General", messages: [] },
};

function broadcast(data) {
  const json = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(json);
    }
  }
}

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "ROOMS_LIST", payload: Object.values(rooms) }));

  ws.on("message", (rawData) => {
    const { type, payload } = JSON.parse(rawData.toString());

    if (type === "JOIN_ROOM") {
      const room = rooms[payload.roomId];
      if (room) {
        ws.send(JSON.stringify({
          type: "ROOM_HISTORY",
          payload: room.messages
        }));
      }
    }

    if (type === "SEND_MESSAGE") {
      const { roomId, username, text } = payload;
      if (!rooms[roomId]) return;

      const message = {
        author: username,
        text: text,
        time: new Date().toLocaleTimeString(),
        roomId: roomId
      };

      rooms[roomId].messages.push(message);
      broadcast({ type: "NEW_MESSAGE", payload: message });
    }

    if (type === "CREATE_ROOM") {
      const id = Date.now().toString();
      rooms[id] = { id: id, name: payload.name, messages: [] };
      broadcast({ type: "ROOMS_LIST", payload: Object.values(rooms) });
    }

    if (type === "DELETE_ROOM") {
      delete rooms[payload.roomId];
      broadcast({ type: "ROOMS_LIST", payload: Object.values(rooms) });
    }
  });
});

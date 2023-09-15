import "dotenv/config";
import cors from "cors";
import express from "express";
import { userRouter } from "./routes/userRouter.js";
import { roomRouter } from "./routes/roomRouter.js";
import { messageRouter } from "./routes/messageRouter.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { WebSocketServer } from "ws";
import { messageService } from "./services/messageService.js";
import { EventEmitter } from "events";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.use(express.json());
app.use("/users", userRouter);
app.use("/rooms", roomRouter);
app.use("/messages", messageRouter);
app.use(errorMiddleware);

const server = app.listen(PORT);

const emitter = new EventEmitter();

const wss = new WebSocketServer({ server });

const roomSubscriptions = new Map();

wss.on("connection", (client, req) => {
  const roomId = new URL(req.url, "http://localhost").searchParams.get(
    "roomId"
  );

  if (!roomId) {
    ws.close(4000, "Missing roomId parameter");
    return;
  }

  if (!roomSubscriptions.has(roomId)) {
    roomSubscriptions.set(roomId, new Set());
  }

  roomSubscriptions.get(roomId).add(client);

  client.on("message", async (message) => {
    const newMessage = await messageService.createMessage(JSON.parse(message));
    emitter.emit("message", newMessage);
  });

  client.on("close", () => {
    roomSubscriptions.get(roomId).delete(client);
  });
});

wss.on("error", () => {});

emitter.on("message", (message) => {
  if (roomSubscriptions.has(message?.roomId?.toString())) {
    const room = roomSubscriptions.get((message?.roomId).toString());

    if (room) {
      const clients = Array.from(room);

      for (const client of clients) {
        client.send(JSON.stringify(message));
      }
    }
  }
});

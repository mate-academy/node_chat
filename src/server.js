import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import { Message } from "./models/Message.js";
import { Room } from "./models/Room.js";
import cors from "cors";
import EventEmitter from "events";

const app = express();
const server = app.listen(5000);

const emitter = new EventEmitter();

app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ server });

wss.on("connection", async (ws, req) => {
  emitter.emit("updateRoomList");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      switch (data.type) {
        case "message":
          await Message.create({
            user: data.user,
            message: data.message,
            roomId: data.roomId,
          });
          broadcastMessage(data.roomId, { type: "message", ...data });
          break;

        case "join_room":
          ws.roomId = data.roomId;
          const messagesFromDb = await Message.findAll({
            where: { roomId: data.roomId },
          });
          const messagesToUser = messagesFromDb.map((msg) => msg.dataValues);
          broadcastMessage(data.roomId, {
            type: "join_room",
            user: data.user,
            messages: [...messagesToUser],
          });
          break;

        case "create_room":
          await Room.create({ name: data.roomName });

          ws.send(
            JSON.stringify({
              type: "create_room",
            })
          );
          emitter.emit("updateRoomList");
          break;

        case "rename_room":
          const [, updatedRoom] = await Room.update(
            { name: data.newName },
            { where: { id: data.roomId }, returning: true }
          );

          ws.send(
            JSON.stringify({
              type: "rename_room",
              renamedRoom: updatedRoom[0].dataValues,
            })
          );

          emitter.emit("updateRoomList");
          break;

        case "delete_room":
          await Room.destroy({
            where: {
              id: data.roomId,
            },
          });
          ws.send(
            JSON.stringify({
              type: "delete_room",
            })
          );
          emitter.emit("updateRoomList");
          delete ws.roomId;
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: `Error handling message`,
        error,
      }))
    }
  });
});

emitter.on("updateRoomList", async () => {
  let roomsList;

  try {
    roomsList = {
      type: "room_list",
      rooms: await Room.findAll({
        include: Message,
      }),
    };
  } catch (error) {
    roomsList = {
      type: 'error',
      message: `Can't load new rooms list after update`,
      error,
    };
  }

  for (const client of wss.clients) {
    client.send(JSON.stringify(roomsList));
  }
});

function broadcastMessage(roomId, message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
      client.send(JSON.stringify(message));
    }
  });
}

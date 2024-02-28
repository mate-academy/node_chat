import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import { Message } from "./models/Message.js";
import { Room } from "./models/Room.js";
import cors from "cors";

const app = express();
const server = app.listen(5000);

app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ server });

wss.on("connection", async (ws, req) => {
  try {
    const rooms = await Room.findAll();
    ws.send(JSON.stringify({ type: "room_list", rooms: rooms }));

    for (const room of rooms) {
      const messages = await Message.findAll({ where: { roomId: room.id } });
      messages.forEach((message) => {
        ws.send(JSON.stringify({ type: "message", ...message.dataValues }));
      });
    }
  } catch (error) {
    console.error("Error sending room list:", error);
  }

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
          const roomsFromDb = await Room.findAll();

          ws.send(JSON.stringify({ type: "create_room", rooms: roomsFromDb }));
          break;

        case "rename_room":
          const [, updatedRoom] = await Room.update(
            { name: data.newName },
            { where: { id: data.roomId }, returning: true }
          );

          const renamedRooms = await Room.findAll();

          ws.send(
            JSON.stringify({
              type: "rename_room",
              rooms: renamedRooms,
              renamedRoom: updatedRoom[0].dataValues,
            })
          );
          break;

        case "delete_room":
          await Room.destroy({
            where: {
              id: data.roomId,
            },
          });

          const newRooms = await Room.findAll();

          ws.send(
            JSON.stringify({
              type: "delete_room",
              rooms: newRooms,
            })
          );
          delete ws.roomId;
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });
});

function broadcastMessage(roomId, message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
      client.send(JSON.stringify(message));
    }
  });
}

/* eslint-disable quotes */
import { Message } from "../models/Message.js";

async function createMessage({ authorName, userId, roomId, text }) {
  try {
    const result = await Message.create({
      authorName,
      userId,
      roomId,
      text,
    });

    return result;
  } catch {
    return {};
  }
}

function getById(id) {
  return Message.findOne({
    where: { id },
  });
}

function getAllForRoom(roomId) {
  return Message.findAll({
    where: { roomId },
  });
}

async function reassignMessages(oldRoomId, newRoomId) {
  const updatedMessages = await Message.update(
    {
      roomId: newRoomId,
    },
    {
      where: {
        roomId: oldRoomId,
      },
    }
  );

  return updatedMessages;
}
async function deleteAllForRoom(roomId) {
  const deleted = await Message.destroy({
    where: {
      roomId,
    },
  });

  return deleted;
}

export const messageService = {
  createMessage,
  getById,
  reassignMessages,
  getAllForRoom,
  deleteAllForRoom,
};

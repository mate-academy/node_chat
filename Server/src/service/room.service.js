import { Rooms } from "../models/rooms.js";

async function getAllRooms() {
  const rooms = await Rooms.findAll()
  return rooms
}
async function createRoom(name, userId) {

  const newRoom = Rooms.create({
name, userId
  })
return newRoom
}

export const roomService = {
  createRoom, getAllRooms
}

import type { IRoom } from '../models/room';
import Room from '../models/room';

export async function createRoom(name: string) {
  return await Room.create({ name });
}

export function findAllRooms() {
  return Room.find({});
}

export async function removeRoomById(id: string) {
  return await Room.findByIdAndRemove(id);
}

export function updateRoomById(id: string, name: string) {
  return Room.findByIdAndUpdate(id, { name }, { new: true });
}

export function findRoomById(id: string) {
  return Room.findById(id);
}

export async function addMemberToRoom(room: IRoom, userId: any) {
  room.members.push(userId);
  return await room.save();
}

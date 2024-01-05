// chatService.ts
import Chat from '../models/chat';

export async function createChat(message: string, sender: string, room: string) {
  return await Chat.create({ message, sender, room });
}

export function findChatsByRoom(room: string) {
  return Chat.find({ room }).populate('sender');
}

export function updateChatById(id: string, message: string) {
  return Chat.findByIdAndUpdate(id, { message }, { new: true });
}

export async function removeChatById(id: string) {
  return await Chat.findByIdAndRemove(id);
}

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data/chat.json');

const readChat = async () => {
  const data = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(data);
};

const writeChat = async (data) => {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
  return true;
};

const getMessages = async (roomId) => {
  const data = await readChat();
  const room = data.rooms.find((roomItem) => roomItem.id === roomId);
  return room ? room.messages : [];
};

const getRoomsUtil = async () => {
  const data = await readChat();
  return data.rooms;
};

const addMessage = async (roomId, message) => {
  const data = await readChat();
  const room = data.rooms.find((roomItem) => roomItem.id === roomId);

  if (!room) {
    return false;
  }

  room.messages.push(message);
  await writeChat(data);
  return true;
};

export {
  readChat,
  writeChat,
  getMessages,
  getRoomsUtil,
  addMessage,
};

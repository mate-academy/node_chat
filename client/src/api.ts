import axios from "axios"
import type { Message } from "./types/Message";
import type { RoomType } from "./types/Room";

axios.defaults.baseURL = 'http://localhost:3000'

const getAllMessages  = async(roomId: string) => {
  const res = await axios.get(`/messages?roomId=${roomId}`);

  return res.data as Message[];
}

const createMessage = async (data: Omit<Message, 'id' | 'date'>) => {
  const res = await axios.post('/messages', {...data});

  return res.data as Message;
}
const createRoom = async (data: {name: string}) => {
  const res = await axios.post('/rooms', {...data});

  return res.data as RoomType;
}

const updateRoom = async (data: RoomType) => {
  const res= await axios.patch(`/rooms/${data.id}`, {...data})

  return res.data as RoomType;
}

const deleteRoom = async (id: string) => {
  const res= await axios.delete(`/rooms/${id}`)

  return res.data as RoomType;
}

const getAllRooms = async () => {
  const res= await axios.get('/rooms')

  return res.data as RoomType[];
}

const getRoomById = async (id: string) => {
  const res= await axios.get(`/rooms/${id}`)

  return res.data as RoomType;
}

export const roomsApi = {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomById
}

export const messagesApi = {
  createMessage,
  getAllMessages
}

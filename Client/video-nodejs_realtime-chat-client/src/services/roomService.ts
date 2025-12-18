import { httpClient } from "../http/httpClient.ts";

export const roomService = {
  getAll: () => httpClient.get('/rooms'),
  createRoom:(roomName:string,userId:string)=> httpClient.post('/rooms/create',{roomName,userId}),
  renameRoom: (roomId: string,newName:string,userId:string) =>
    httpClient.patch(`/rooms/${roomId}`, { newName, userId })
  ,
  deleteRoom: (roomId: string, userId: string) =>
  httpClient.delete(`/rooms/${roomId}?userId=${userId}`)
}

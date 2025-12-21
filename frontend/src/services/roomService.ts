import { httpClient as client } from '../http/httpClient.ts'

export const roomService = {
  create: async (name: string, author: string) => {
    return (await client.post('/room', { name, author })).data;
  },

  update: async (roomId: string, name: string) => {
    return (await client.patch('/room-update', { id: roomId, name })).data
  },

  delete: async (id: string) => {
    return (await client.delete(`/delete/${id}`)).data;
  }
}
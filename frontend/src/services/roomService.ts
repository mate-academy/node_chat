import { httpClient as client } from '../http/httpClient.ts'

export const roomService = {
  create: async (name: string, user: string) => {
    return (await client.post('/room', { name, user })).data;
  },

  update: async (roomId: string, name: string) => {
    return (await client.patch('/room-update', { id: roomId, name })).data
  },

  delete: async (id: string) => {
    return (await client.get(`/delete/${id}`)).data;
  }
}
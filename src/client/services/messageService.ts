import { authClient } from '../http/authClient';

export const messageService = {
  createMessage: (userId: number, text: string, roomId: string) => {
    return authClient.post(`/room/${roomId}/messages`, { userId, text });
  },

  updateUserData: (id: number, username: string) => {
    return authClient.put(`/users/${id}`, { username });
  },
};

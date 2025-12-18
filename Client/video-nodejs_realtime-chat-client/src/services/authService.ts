import { authClient as client } from '../http/authClient.ts';




export const authService = {
  login: (name:string) => {
    return client.post('/login', {name });
  },


  logout: () => client.post('/logout'),

 
};

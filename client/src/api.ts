import axios from 'axios';
import type { Message } from './types/message';

axios.defaults.baseURL = 'http://localhost:3000';

export async function getMessage() {
  const res = await axios.get('/messages')

  return res.data as Message[];
}

export function sendMessage(text: string, sender: string) {
  return axios.post('/messages', { text, sender });
}

import axios from 'axios';
import { BASE_URL } from '../App';

export async function requestCreateRoom(roomName: string, limit: number) {
  const userName = localStorage.getItem('name');
  if (!roomName || !userName || !limit) {
    throw new Error('invalid data function request');
  }

  try {
    const requestData = {
      user: userName,
      name: roomName,
      limit: limit
    };

    const response = await axios.post(`${BASE_URL}/rooms`, requestData);
    return response.data;
  } catch (err) {
    console.error(`catch error request create: ${err.message}`);
    return false;
  }
}

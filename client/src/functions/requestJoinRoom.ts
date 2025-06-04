import axios from 'axios';
import { BASE_URL } from '../App';

export async function requestJoinRoom(roomId: string) {
  const userName = localStorage.getItem('name');
  if (!roomId || !userName) {
    throw new Error('invalid data function join request');
  }

  try {
    const requestData = {
      user: userName,
    }
    const response = await axios.patch(`${BASE_URL}/rooms/${roomId}`, requestData);
    switch (response.status) {
      case 201:
        return response.data;
      case 404:
        return undefined;
      case 407:
        return false;
    }
  } catch (err) {
    console.error(`catch error request join ${err.message}`);
    return false;
  }
}

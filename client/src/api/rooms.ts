import axios from 'axios';
import type { Room } from '../types';

const API_URL = 'http://localhost:3005';

export function getRooms() {
  return axios.get<Room[]>(`${API_URL}/rooms`).then((response) => response.data);
}

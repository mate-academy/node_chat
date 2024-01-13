import axios from 'axios';

const API_URL = 'http://localhost:3003';

export async function getRooms() {
  try {
    return axios.get(`${API_URL}/rooms`);
  } catch (err) {
    return [];
  }
}

export async function getMessages(id) {
  try {
    return axios.get(`${API_URL}/rooms/${id}`);
  } catch (err) {
    return [];
  }
}

export async function createRoom() {
  try {
    return axios.post(`${API_URL}/rooms`);
  } catch (err) {
    return {};
  }
}

export async function deleteRoom(id) {
  try {
    return axios.delete(`${API_URL}/rooms/${id}`);
  } catch (err) {
    return {};
  }
}

export async function updateRoom(id, name) {
  try {
    return axios.patch(`${API_URL}/rooms/${id}`, { name });
  } catch (err) {
    return {};
  }
}

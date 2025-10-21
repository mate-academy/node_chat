import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

export async function fetchRooms() {
  try {
    const res = await axios.get(`${BASE_URL}/rooms`);
    return res.data;
  } catch (err) {
    console.error('Error fetching rooms:', err);
  }
}

export async function createRoom(name) {
  try {
    const res = await axios.post(`${BASE_URL}/rooms`, { name });
    return res.data;
  } catch (err) {
    console.error('Error fetching rooms:', err);
  }
}

export async function updateRoom(id, name) {
  try {
    const res = await axios.patch(`${BASE_URL}/rooms/${id}`, { name });
    return res.data;
  } catch (err) {
    console.error('Error fetching rooms:', err);
  }
}

export async function deleteRoom(id) {
  try {
    await axios.delete(`${BASE_URL}/rooms/${id}`);
    return id;
  } catch (err) {
    console.error('Error fetching rooms:', err);
  }
}

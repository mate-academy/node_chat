import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

export async function createUser(username) {
  try {
    const res = await axios.post(`${BASE_URL}/users`, { username });
    return res.data;
  } catch (err) {
    console.log('Error creating users:', err);
  }
}

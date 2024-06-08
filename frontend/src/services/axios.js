import axios from 'axios';

export async function postUser(userName) {
  try {
    const res = await axios.post('http://localhost:3001/user/register', { userName });

    if (res.status !== 200) {
      throw new Error('something went wrong');
    }

    return res.data;
  } catch (err) {
    console.error(err);
  }
}

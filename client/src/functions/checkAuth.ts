import axios from 'axios';
import { BASE_URL } from '../App';

export const checkAuth = async (onAuth: (v: boolean) => void, onLoading: (v: boolean) => void) => {
  try {
    const userName = localStorage.getItem('name');
    if (!userName) {
      onAuth(false);
      return;
    }

    await axios.post(`${BASE_URL}/users/${userName}`);
    onAuth(true);
  } catch (err: any) {
    console.error(`Auth check failed: ${err.message}`);
    localStorage.removeItem('name');
    onAuth(false);
  } finally {
    onLoading(false);
  }
};

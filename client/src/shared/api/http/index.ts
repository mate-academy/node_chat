import axios from 'axios';
import { BASE_URL } from './apiConstants';

export function createClient() {
  return axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });
}

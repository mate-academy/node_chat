import axios from 'axios';
import { API_URL } from '../constants/constants.ts';

export const httpClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

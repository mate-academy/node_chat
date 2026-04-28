import axios from 'axios';
import { API_URL } from './config.js';

export const httpClient = axios.create({ baseURL: API_URL });

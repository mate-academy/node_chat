import axios from "axios";
const API_URL = 'http://localhost:3005/messages';

function post(message) {
  return axios.post(API_URL, message);
}

export const apiUtils = {
  post,
}
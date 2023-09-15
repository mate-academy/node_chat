import { httpClient } from "../http/httpClient.js";

function createUser(fullName) {
  return httpClient.post(`${process.env.REACT_APP_API_URL}/users`, {
    fullName,
  });
}

function getUserById(id) {
  return httpClient.get(`${process.env.REACT_APP_API_URL}/users/${id}`);
}

export const userService = {
  createUser,
  getUserById,
};

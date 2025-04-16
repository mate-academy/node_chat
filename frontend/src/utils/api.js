import axios from 'axios';

export const API_URL = 'http://localhost:5000';

export const getAllMessages = async (url = '/messages') => {
  try {
    const { data: messages } = await axios.get(API_URL + url);
    console.log('getAllMessages', messages);
    return messages;
  } catch (error) {
    console.error(
      'Error fething messages:',
      error.message,
      error.request.response,
    );
  }
};

export const createMessage = async (message, url = '/messages') => {
  try {
    const { data: newMessage } = await axios.post(API_URL + url, message);
    return newMessage;
  } catch (error) {
    console.error(
      'Error creating message:',
      error.message,
      error.request.response,
    );
  }
};

export const deleteMessage = async (id, url = '/messages') => {
  try {
    await axios.delete(`${API_URL}${url}/${id}`);
  } catch (error) {
    console.error(
      'Error deleting message:',
      error.message,
      error.request.response,
    );
  }
};

export const updateMessage = async (id, message, url = '/messages') => {
  try {
    const { data: updatedMessage } = await axios.patch(
      `${API_URL}${url}/${id}`,
      message,
    );
    return updatedMessage;
  } catch (error) {
    console.error(
      'Error updating message:',
      error.message,
      error.request.response,
    );
  }
};

export const createUser = async (user, url = '/users') => {
  try {
    const { data: newUser } = await axios.post(`${API_URL}${url}`, user);
    return newUser;
  } catch (error) {
    console.error(
      'Error creating user:',
      error.message,
      error.request.response,
    );
  }
};

const api = {
  getAllMessages,
  createMessage,
  deleteMessage,
  updateMessage,
  createUser,
};

export default api;

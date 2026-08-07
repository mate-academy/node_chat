import { httpClient } from '../http/httpClient';
import { User } from '../types/User';

function getAll() {
  return httpClient.get<User[]>('/users');
}

const updateUsername = async (id: string, username: string) => {
  const data = await httpClient.patch<User>(`/settings/username/${id}`, {
    username,
  });

  return data;
};

const updatePassword = async (
  id: string,
  oldPassword: string,
  newPassword: string,
) => {
  const data = await httpClient.patch<User>(`/settings/password/${id}`, {
    oldPassword,
    newPassword,
  });

  return data;
};

const updateEmail = async (id: string, password: string, newEmail: string) => {
  const data = await httpClient.patch<User>(`/settings/email/${id}`, {
    password,
    newEmail,
  });

  return data;
};

const confirmEmail = async (token: string) => {
  const data = await httpClient.patch<User>(`/confirm-email/${token}`);

  return data;
};

export const userService = {
  getAll,
  updateUsername,
  updatePassword,
  updateEmail,
  confirmEmail,
};

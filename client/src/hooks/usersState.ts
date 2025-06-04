import axios from 'axios';
import { useState } from 'react';
import { User } from '../../../types/user';

export const usersState = async () => {
  const [users, setUsers] = useState<User[]>([]);

  async function getUsers() {
    const response = (await axios.get('http://localhost:3005/users')) as User[];

    if (!response) {
      return;
    }

    setUsers(response);
  }

  async function checkUser(userName) {
    const isExist = axios.get()
  }

  return { users, getUsers };
};

import { httpClient } from "./api/httpClient";
import type { Room, User } from "./types";

export const loginUser = async (userData: User): Promise<User> => {
  const response = await httpClient.post<User>("users/login", { userData });
  const user = response.data;
  localStorage.setItem("user", user.name);

  return user;
};

export const isUserAuth = (): boolean => {
  const user = localStorage.getItem("user");

  if (!user) {
    return false;
  }

  return true;
};


export const isUserInTheRoom = (room: Room, user: User) => {
  const members = room.members;

  if (members.length === 0) {
    return false;
  }

  if (members.find((member) => member.name === user.name)) {
    return true;
  }
  return false;
};


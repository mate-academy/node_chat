/* eslint-disable */
import React, { createContext } from "react";

type UserContextType ={
  userName: string | null,
  setUserName: React.Dispatch<React.SetStateAction<string | null>>,
  userId: string | null,
  setUserId: React.Dispatch<React.SetStateAction<string | null>>,
}

export const UserContext = createContext<UserContextType>({
  userName: null,
  setUserName: () => {},
  userId: null,
  setUserId: () => {},
});


/* eslint-disable */
import React, { useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { UserContext } from "./UserContext";

type Props = {
  children: React.ReactNode,
}

export const UserProvider: React.FC<Props> = ({children}) => {
  const [userName, setUserName] = useLocalStorage<string | null>('userName', null);
  const [userId, setUserId] = useLocalStorage<string | null>('userId', null);

  const valueContext = useMemo(() => (
    {
      userName,
      setUserName,
      userId,
      setUserId,
    }
  ), [userName, setUserName, userId, setUserId]);

  return (
    <UserContext.Provider value={valueContext}>
      {children}
    </UserContext.Provider>
  )

};

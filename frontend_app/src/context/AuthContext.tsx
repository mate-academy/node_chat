import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketProvider";
import api from "../api/axios";

interface AuthCtx {
  username: string | null;
  setUsername: (n: string | null) => void;
}
const AuthContext = createContext<AuthCtx | null>(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [username, setUsername] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    const username = localStorage.getItem("chat_username");
    if (username) setUsername(username);
  }, []);

  const setUsernameAndStore = async (username: string | null) => {
    if (username) {
      localStorage.setItem("chat_username", username);
      await api.post("/auth", { username });
      socket.send?.({
        type: "auth",
        username,
      });
    } else {
      localStorage.removeItem("chat_username");
    }

    setUsername(username);
  };
  return (
    <AuthContext.Provider
      value={{ username, setUsername: setUsernameAndStore }}
    >
      {children}
    </AuthContext.Provider>
  );
};

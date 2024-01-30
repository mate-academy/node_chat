import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useUser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(localStorage.getItem("userName") || "");

  const handleSetUser = (userName: string) => {
    setUser(userName);
    localStorage.setItem("userName", userName);
  };

  const handleDeleteUser = () => {
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return {
    userName: user,
    setUserName: handleSetUser,
    deleteUserName: handleDeleteUser,
  };
};

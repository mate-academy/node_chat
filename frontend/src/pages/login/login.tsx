import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

import "./login.scss";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { userName, setUserName } = useUser();

  const [inputValue, setInputValue] = useState("");

  if (userName) {
    return <Navigate to={"/chat"} />;
  }

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserName(inputValue);
    navigate("/chat");
  };

  return (
    <form onSubmit={handleLogin} className="login-form">
      <input
        type="text"
        value={inputValue}
        className="login-form__input"
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button
        type="submit"
        disabled={!inputValue}
        className="login-form__button"
      >
        Login
      </button>
    </form>
  );
};

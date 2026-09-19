import React, { useState } from "react";
import { useChat } from "../ChatContext";
import { useNavigate } from "react-router-dom";
import { isUserAuth } from "../utils";

export const AuthorizationPage = () => {
  const [username, setUsername] = useState("");
  const { handleLoginUser } = useChat();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) return;

    const userData = {
      name: trimmed,
    };
    await handleLoginUser(userData);
    const isAutheticated = isUserAuth();
    console.log(isAutheticated);

    if (isAutheticated) {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="login-page">
      <form
        className="login-form"
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <input
          type="text"
          className="login-input"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          required
        />
        <button type="submit" className="login-button">
          Send
        </button>
      </form>
    </div>
  );
};

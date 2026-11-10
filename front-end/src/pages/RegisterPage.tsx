import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";

export const RegisterPage = () => {
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const name = userName.trim();

    if (!name) {
      setErrorMessage("Enter your username");
      return;
    }

    const response = await axios.post("http://localhost:3005/user", {
      name,
    });

    const user = response.data;

    if (!user) {
      setErrorMessage("user not created");
      return;
    }

    localStorage.setItem("user", user);
    navigate("/");
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "380px",
        margin: "100px auto",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          margin: "0 0 8px",
          textAlign: "center",
          color: "#1e293b",
        }}
      >
        Welcome!
      </h2>

      <p
        style={{
          margin: "0 0 8px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        Enter your username to continue
      </p>

      <input
        type="text"
        placeholder="Your username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        style={{
          padding: "12px",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
        }}
      />

      <button
        type="submit"
        disabled={!userName.trim()}
        style={{
          padding: "12px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: "bold",
          cursor: "pointer",
          opacity: userName.trim() ? 1 : 0.5,
        }}
      >
        Register
      </button>

      {errorMessage && (
        <p
          style={{
            margin: 0,
            color: "#dc2626",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          {errorMessage}
        </p>
      )}
    </form>
  );
};

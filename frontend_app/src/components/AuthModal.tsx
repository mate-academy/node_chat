import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const AuthModal: React.FC = () => {
  const { setUsername } = useAuth();
  const [name, setName] = useState("");
  const save = () => {
    if (!name.trim()) return;
    setUsername(name.trim());
  };
  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h3 className="text-lg font-semibold mb-3">Enter username</h3>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="button" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

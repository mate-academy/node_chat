import React, { useState, type Dispatch, type SetStateAction } from "react";
import axios from "axios";
import type { Chat } from "../types/Chat";
import { useNavigate } from "react-router";

type Props = {
  chat: Chat;
  setChats: Dispatch<SetStateAction<Chat[] | null>>;
};

export const ChatItem: React.FC<Props> = ({ chat, setChats }) => {
  const user = localStorage.getItem("user");

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateValue, setUpdateValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isAuthor = chat.author === user;
  const canJoin = user !== null && !chat.users.includes(user);

  async function updateChat() {
    const newName = updateValue.trim();

    if (!newName || isLoading) return;

    try {
      setIsLoading(true);
      setError("");

      const response = await axios.patch<Chat>(
        `http://localhost:3005/chats/${chat.id}`,
        { name: newName },
      );

      setChats(
        (prev) =>
          prev?.map((item) => (item.id === chat.id ? response.data : item)) ??
          null,
      );

      setIsUpdating(false);
    } catch {
      setError("Failed to update chat");
    } finally {
      setIsLoading(false);
    }
  }

  async function joinChat() {
    if (!user || isLoading) return;

    try {
      setIsLoading(true);
      setError("");

      const response = await axios.post<Chat>(
        `http://localhost:3005/chats/${chat.id}/join`,
        { user },
      );

      setChats(
        (prev) =>
          prev?.map((item) => (item.id === chat.id ? response.data : item)) ??
          null,
      );
    } catch {
      setError("Failed to join chat");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteChat() {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError("");

      await axios.delete(`http://localhost:3005/chats/${chat.id}`);

      setChats((prev) => prev?.filter((item) => item.id !== chat.id) ?? null);
    } catch {
      setError("Failed to delete chat");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <p
          onClick={() => {
            if (!canJoin) {
              navigate(`/${chat.id}`);
            }
          }}
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: "600",
            color: "#1e293b",
            cursor: canJoin ? "default" : "pointer",
          }}
        >
          {chat.name}
        </p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {isAuthor && (
            <>
              <button
                disabled={isLoading}
                onClick={() => {
                  setIsUpdating(true);
                  setUpdateValue(chat.name);
                  setError("");
                }}
                style={{
                  padding: "7px 12px",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Rename
              </button>

              <button
                disabled={isLoading}
                onClick={deleteChat}
                style={{
                  padding: "7px 12px",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </>
          )}

          {canJoin && (
            <button
              disabled={isLoading}
              onClick={joinChat}
              style={{
                padding: "7px 14px",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {isLoading ? "Joining..." : "Join"}
            </button>
          )}
        </div>
      </div>

      {isUpdating && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            type="text"
            value={updateValue}
            onChange={(e) => setUpdateValue(e.target.value)}
            style={{
              flex: 1,
              minWidth: "120px",
              padding: "9px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              outline: "none",
            }}
          />

          <button
            disabled={isLoading || !updateValue.trim()}
            onClick={updateChat}
            style={{
              padding: "9px 14px",
              backgroundColor: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>

          <button
            disabled={isLoading}
            onClick={() => setIsUpdating(false)}
            style={{
              padding: "9px 14px",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <p style={{ margin: 0, color: "#dc2626", fontSize: "13px" }}>{error}</p>
      )}
    </div>
  );
};

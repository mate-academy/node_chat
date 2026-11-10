import { useCallback, useEffect, useState } from "react";
import { chatApi, WS_URL } from "../api/chat";

const MESSAGE_EVENTS = new Set([
  "message:created",
  "message:updated",
  "message:deleted",
]);

const sortMessages = (messages) =>
  [...messages].sort(
    (a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt) || a.id.localeCompare(b.id),
  );

const applyMessageEvent = (messages, { event, payload }) => {
  if (event === "message:deleted") {
    return messages.filter((message) => message.id !== payload.id);
  }

  const messagesById = new Map(
    messages.map((message) => [message.id, message]),
  );

  messagesById.set(payload.id, payload);

  return sortMessages([...messagesById.values()]);
};

export const useRoomMessages = (roomId) => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const addMessage = useCallback((message) => {
    setMessages((current) =>
      applyMessageEvent(current, {
        event: "message:created",
        payload: message,
      }),
    );
  }, []);

  const updateMessage = useCallback((message) => {
    setMessages((current) =>
      applyMessageEvent(current, {
        event: "message:updated",
        payload: message,
      }),
    );
  }, []);

  const removeMessage = useCallback((messageId) => {
    setMessages((current) =>
      current.filter((message) => message.id !== messageId),
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const socket = new WebSocket(WS_URL);

    let disposed = false;
    let historyStarted = false;
    let historyLoaded = false;
    let pendingEvents = [];

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("connecting");
    setError("");

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          event: "join",
          roomId,
        }),
      );
    };

    socket.onmessage = async ({ data }) => {
      try {
        const { event, payload } = JSON.parse(data);

        if (event === "error") {
          setError(payload.message);
          setStatus("error");

          return;
        }

        if (MESSAGE_EVENTS.has(event) && payload.roomId === roomId) {
          const messageEvent = { event, payload };

          if (!historyLoaded) {
            pendingEvents.push(messageEvent);
          } else {
            setMessages((current) => applyMessageEvent(current, messageEvent));
          }

          return;
        }

        if (event !== "joined" || payload.roomId !== roomId || historyStarted) {
          return;
        }

        historyStarted = true;

        const history = await chatApi.getMessages(roomId, controller.signal);

        if (disposed) {
          return;
        }

        const syncedMessages = pendingEvents.reduce(
          applyMessageEvent,
          sortMessages(history),
        );

        historyLoaded = true;
        pendingEvents = [];

        setMessages(syncedMessages);
        setStatus(
          socket.readyState === WebSocket.OPEN ? "connected" : "offline",
        );
      } catch (err) {
        if (!disposed && err.name !== "AbortError") {
          setError(err.message);
          setStatus("error");
        }
      }
    };

    socket.onerror = () => {
      if (!disposed) {
        setError("Unable to connect to the chat");
      }
    };

    socket.onclose = () => {
      if (!disposed) {
        setStatus("offline");
      }
    };

    return () => {
      disposed = true;
      controller.abort();

      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      socket.close();
    };
  }, [roomId, attempt]);

  const reconnect = () => {
    setAttempt((current) => current + 1);
  };

  return {
    messages,
    status,
    error,
    addMessage,
    updateMessage,
    removeMessage,
    reconnect,
  };
};

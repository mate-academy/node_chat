import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { io } from "socket.io-client";

export const useChatStore = defineStore("chat", () => {
  const rooms = ref([]);
  const activeRoomId = ref(null);
  const messages = ref([]);
  const socket = ref(null);
  const error = ref(null);

  const activeRoom = computed(() =>
    rooms.value.find((r) => r.id === activeRoomId.value),
  );

  const initChat = async () => {
    try {
      socket.value = io("http://localhost:3005");

      socket.value.on("connect_error", () => {
        error.value = "Connection lost. Trying to reconnect...";
      });

      socket.value.on("room_created", (newRoom) => {
        rooms.value.push(newRoom);
      });

      socket.value.on("room_renamed", (data) => {
        const room = rooms.value.find((r) => r.id === Number(data.roomId));
        if (room) room.name = data.newName;
      });

      socket.value.on("room_deleted", (data) => {
        rooms.value = rooms.value.filter((r) => r.id !== Number(data.roomId));
        if (activeRoomId.value === Number(data.roomId)) {
          activeRoomId.value = null;
          messages.value = [];
        }
      });

      socket.value.on("receive_message", (newMessage) => {
        if (activeRoomId.value === newMessage.roomId) {
          messages.value.push(newMessage);
        }
      });

      await fetchRooms();
    } catch {
      error.value = "Failed to initialize chat connection.";
    }
  };

  const fetchRooms = async () => {
    error.value = null;

    try {
      const response = await fetch("http://localhost:3005/rooms");

      if (!response.ok) {
        throw new Error("Failed to fetch rooms from server.");
      }

      rooms.value = await response.json();
    } catch (err) {
      error.value = err.message;
    }
  };

  const changeRoom = async (roomId) => {
    error.value = null;
    activeRoomId.value = roomId;

    if (socket.value) {
      socket.value.emit("join_room", roomId);
    }

    try {
      const response = await fetch(
        `http://localhost:3005/rooms/${roomId}/messages`,
      );

      if (!response.ok) {
        throw new Error("Failed to load message history.");
      }

      messages.value = await response.json();
    } catch (err) {
      error.value = err.message;
    }
  };

  const createRoom = async (name, userId) => {
    error.value = null;
    try {
      const response = await fetch("http://localhost:3005/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userId }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create room.");
      }
    } catch (err) {
      error.value = err.message;
    }
  };

  const renameRoom = async (roomId, newName) => {
    error.value = null;
    try {
      const response = await fetch(`http://localhost:3005/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to rename room.");
      }
    } catch (err) {
      error.value = err.message;
    }
  };

  const deleteRoom = async (roomId) => {
    error.value = null;
    try {
      const response = await fetch(`http://localhost:3005/rooms/${roomId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete room.");
      }
    } catch (err) {
      error.value = err.message;
    }
  };

  const sendMessage = (text, userId) => {
    if (!activeRoomId.value || !socket.value) return;
    socket.value.emit("send_message", {
      text,
      userId,
      roomId: activeRoomId.value,
    });
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    rooms,
    activeRoomId,
    messages,
    error,
    activeRoom,
    initChat,
    changeRoom,
    createRoom,
    renameRoom,
    deleteRoom,
    sendMessage,
    clearError,
  };
});

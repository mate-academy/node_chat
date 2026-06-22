<script setup>
import { ref, onMounted } from "vue";
import { useChatStore } from "../../store/chatStore.js";

const props = defineProps({
  currentUser: {
    type: Object,
    required: true,
  },
});

const chatStore = useChatStore();
const newRoomName = ref("");
const newMessageText = ref("");

onMounted(() => {
  chatStore.initChat();
});

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const handleCreateRoom = async () => {
  if (!newRoomName.value.trim()) return;
  await chatStore.createRoom(newRoomName.value.trim(), props.currentUser.id);
  newRoomName.value = "";
};

const handleRenameRoom = async () => {
  const currentName = chatStore.activeRoom.name;
  const promptName = prompt("Enter new room name:", currentName);

  if (promptName && promptName.trim() && promptName.trim() !== currentName) {
    await chatStore.renameRoom(chatStore.activeRoomId, promptName.trim());
  }
};

const handleDeleteRoom = async () => {
  if (confirm("Are you sure you want to delete this room?")) {
    await chatStore.deleteRoom(chatStore.activeRoomId);
  }
};

const handleSendMessage = () => {
  if (!newMessageText.value.trim()) return;
  chatStore.sendMessage(newMessageText.value.trim(), props.currentUser.id);
  newMessageText.value = "";
};
</script>

<template>
  <div class="chat-container">
    <div v-if="chatStore.error" class="global-error">
      <span>{{ chatStore.error }}</span>
      <button class="close-error-btn" @click="chatStore.clearError()">×</button>
    </div>

    <aside class="sidebar">
      <div class="sidebar-header">
        <h3>My Rooms</h3>
        <div class="create-room-form">
          <input
            v-model="newRoomName"
            type="text"
            placeholder="New room name..."
            @keyup.enter="handleCreateRoom"
          />
          <button @click="handleCreateRoom">Create</button>
        </div>
      </div>

      <ul class="room-list">
        <li
          v-for="room in chatStore.rooms"
          :key="room.id"
          class="room-item"
          :class="{ active: chatStore.activeRoomId === room.id }"
          @click="chatStore.changeRoom(room.id)"
        >
          <div class="room-avatar">#</div>
          <div class="room-info">
            <span class="room-name">{{ room.name }}</span>
          </div>
        </li>
      </ul>
    </aside>

    <main class="chat-area">
      <template v-if="chatStore.activeRoom">
        <header class="chat-header">
          <h3>{{ chatStore.activeRoom.name }}</h3>
          <div class="room-actions">
            <button class="action-btn edit" @click="handleRenameRoom">
              Rename
            </button>
            <button class="action-btn delete" @click="handleDeleteRoom">
              Delete
            </button>
          </div>
        </header>

        <div class="messages-list">
          <div
            v-for="msg in chatStore.messages"
            :key="msg.id"
            class="message-wrapper"
            :class="{ 'my-message': msg.userId === props.currentUser.id }"
          >
            <div class="message-bubble">
              <span
                v-if="msg.userId !== props.currentUser.id"
                class="message-author"
              >
                {{ msg.author?.username || "Unknown" }}
              </span>
              <p class="message-text">{{ msg.text }}</p>
              <span class="message-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>
        </div>

        <footer class="message-input-area">
          <input
            v-model="newMessageText"
            type="text"
            placeholder="Type a message..."
            @keyup.enter="handleSendMessage"
          />
          <button @click="handleSendMessage">Send</button>
        </footer>
      </template>

      <div v-else class="empty-state">
        <p>Select a room from the sidebar to start chatting</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background-color: #fff;
  font-family: sans-serif;
  position: relative;
}

.global-error {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #ef4444;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 9999;
}

.close-error-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.sidebar {
  width: 320px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h3 {
  margin: 0 0 12px 0;
}

.create-room-form {
  display: flex;
  gap: 8px;
}

.create-room-form input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.create-room-form button {
  padding: 6px 12px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.room-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}

.room-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  gap: 12px;
}

.room-item:hover {
  background-color: #f3f4f6;
}

.room-item.active {
  background-color: #eff6ff;
}

.room-avatar {
  width: 40px;
  height: 40px;
  background-color: #dbeafe;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}

.chat-header {
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
}

.room-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.action-btn.edit {
  background-color: #f59e0b;
  color: white;
}

.action-btn.delete {
  background-color: #ef4444;
  color: white;
}

.messages-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-wrapper {
  display: flex;
  justify-content: flex-start;
}

.message-wrapper.my-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 60%;
  padding: 10px 14px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.my-message .message-bubble {
  background-color: #3b82f6;
  color: white;
}

.message-time {
  display: block;
  font-size: 10px;
  color: #9ca3af;
  text-align: right;
  margin-top: 4px;
}
.my-message .message-time {
  color: #bfdbfe;
}

.message-author {
  display: block;
  font-size: 12px;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 4px;
}

.message-text {
  margin: 0;
  word-break: break-word;
}

.message-input-area {
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 10px;
}

.message-input-area input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  outline: none;
}

.message-input-area button {
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.empty-state {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #6b7280;
}
</style>

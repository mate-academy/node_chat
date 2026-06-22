<script setup>
import { ref, onMounted } from "vue";
import LoginView from "./components/auth/Login.vue";
import ChatLayout from "./components/chat/ChatLayout.vue";

const currentUser = ref(null);

onMounted(() => {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  if (userId && username) {
    currentUser.value = { id: Number(userId), username };
  }
});

const onLoginSuccess = (userData) => {
  currentUser.value = userData;
};

const logout = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  currentUser.value = null;
};
</script>

<template>
  <div class="app-container">
    <LoginView v-if="!currentUser" @success="onLoginSuccess" />

    <div v-else class="main-layout">
      <header class="app-header">
        <span
          >Logged in as: <strong>{{ currentUser.username }}</strong></span
        >
        <button @click="logout" class="logout-btn">Log out</button>
      </header>

      <ChatLayout :current-user="currentUser" />
    </div>
  </div>
</template>

<style>
/* Скидаємо базові відступи браузера, щоб чат був на весь екран */
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  box-sizing: border-box;
}

* {
  box-sizing: inherit;
}

.app-container {
  height: 100vh;
}

.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #1f2937;
  color: white;
  font-family: sans-serif;
}

.logout-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.logout-btn:hover {
  background-color: #dc2626;
}
</style>

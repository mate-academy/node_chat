<script setup>
import { ref } from "vue";

const username = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const emit = defineEmits(["success"]);

const handleLogin = async () => {
  errorMessage.value = "";
  isLoading.value = true;

  try {
    const response = await fetch("http://localhost:3005/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username.value.trim() }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Помилка авторизації");
    }

    localStorage.setItem("userId", data.id);
    localStorage.setItem("username", data.username);

    emit("success", data);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h2>Sign in</h2>
      <p>Enter your username</p>

      <form @submit.prevent="handleLogin">
        <input v-model="username" type="text" placeholder="username" required />
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? "Loading..." : "Sign in" }}
        </button>
      </form>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f3f4f6;
}
.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}
input {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background-color: #9ca3af;
}
.error-text {
  color: red;
  margin-top: 10px;
}
</style>

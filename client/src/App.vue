<template>
  <v-app theme="dark" class="font-sans">
    <!-- Username Gate Dialog -->
    <UsernameDialog
      v-if="!username"
      @set="handleSetUsername"
    />

    <!-- Main Layout -->
    <template v-else>
      <!-- Top App Bar -->
      <v-app-bar
        color="surface"
        elevation="0"
        border="b"
        class="border-white/5"
      >
        <div class="flex items-center gap-3 px-4 w-full">
          <!-- Toggle Rooms sidebar button -->
          <v-btn
            icon="mdi-menu"
            variant="text"
            color="white"
            title="Toggle rooms sidebar"
            @click="drawer = !drawer"
          />

          <!-- Logo -->
          <div class="flex items-center gap-2">
            <v-icon color="primary" size="28">mdi-chat-processing</v-icon>
            <span class="text-lg font-bold tracking-tight text-white">NodeChat</span>
          </div>

          <v-spacer />

          <!-- Connection status -->
          <div class="flex items-center gap-2">
            <span
              class="w-2 h-2 rounded-full glow-pulse"
              :class="connected ? 'bg-secondary' : 'bg-error'"
            />
            <span class="text-xs text-white/60 hidden sm:inline">
              {{ connected ? 'Connected' : 'Reconnecting…' }}
            </span>
          </div>

          <!-- User chip -->
          <v-chip
            color="primary"
            variant="tonal"
            prepend-icon="mdi-account"
            class="ml-2 font-medium"
          >
            {{ username }}
          </v-chip>

          <!-- Change username -->
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            density="comfortable"
            @click="showUsernameDialog = true"
          />
        </div>
      </v-app-bar>

      <!-- Navigation Drawer — Rooms sidebar -->
      <v-navigation-drawer
        v-model="drawer"
        :width="280"
        color="surface"
        border="r"
        class="border-white/5"
      >
        <RoomsSidebar @close="drawer = false" />
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main class="h-full" style="height: 100vh;">
        <!-- No room selected -->
        <div
          v-if="!activeRoomId"
          class="flex flex-col items-center justify-center h-full gap-4 text-center px-6"
          style="min-height: calc(100vh - 64px);"
        >
          <v-icon size="72" color="primary" class="opacity-30">mdi-forum-outline</v-icon>
          <p class="text-white/40 text-lg font-medium">Select a room to start chatting</p>
          <p class="text-white/25 text-sm max-w-xs">
            Pick a room from the sidebar on the left, or create a new one
          </p>
          <!-- Open drawer button -->
          <v-btn
            class="mt-2"
            color="primary"
            prepend-icon="mdi-menu"
            @click="drawer = true"
          >
            Browse Rooms
          </v-btn>
        </div>

        <!-- Chat Window -->
        <ChatWindow v-else @toggle-drawer="drawer = !drawer" />
      </v-main>

      <!-- Inline username change dialog -->
      <UsernameDialog
        v-if="showUsernameDialog"
        :change-mode="true"
        @set="handleChangeUsername"
        @cancel="showUsernameDialog = false"
      />
    </template>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useChat } from './composables/useChat.js';
import UsernameDialog from './components/UsernameDialog.vue';
import RoomsSidebar from './components/RoomsSidebar.vue';
import ChatWindow from './components/ChatWindow.vue';

const { username, connected, activeRoomId, setUsername, connect } = useChat();

const drawer = ref(true);
const showUsernameDialog = ref(false);

function handleSetUsername(name) {
  setUsername(name);
  connect();
}

function handleChangeUsername(name) {
  setUsername(name);
  showUsernameDialog.value = false;
}

onMounted(() => {
  if (username.value) {
    connect();
  }
});
</script>

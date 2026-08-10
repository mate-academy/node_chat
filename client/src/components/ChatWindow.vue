<template>
  <div class="flex flex-col" style="height: calc(100vh - 64px)">
    <!-- Room Header -->
    <div
      class="flex items-center gap-3 px-5 py-4 border-b border-white/5 flex-shrink-0"
      style="
        background: linear-gradient(
          90deg,
          rgba(124, 106, 247, 0.07) 0%,
          transparent 100%
        );
      "
    >
      <v-icon color="primary" size="20">mdi-pound</v-icon>
      <div>
        <h2 class="text-white font-semibold text-base leading-tight">
          {{ activeRoom?.name }}
        </h2>
        <p class="text-white/40 text-xs">
          {{ activeMessages.length }} messages
        </p>
      </div>
    </div>

    <!-- Messages Area -->
    <div
      ref="messagesList"
      class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1"
    >
      <!-- Date + welcome -->
      <div class="flex justify-center mb-4">
        <span class="text-xs text-white/25 bg-white/5 rounded-full px-3 py-1">
          Welcome to #{{ activeRoom?.name }}
        </span>
      </div>

      <TransitionGroup name="msg" tag="div" class="flex flex-col gap-1">
        <MessageBubble
          v-for="msg in activeMessages"
          :key="msg.id"
          :message="msg"
          :is-own="msg.author === username"
        />
      </TransitionGroup>

      <!-- Empty state -->
      <div
        v-if="activeMessages.length === 0"
        class="flex flex-col items-center justify-center flex-1 gap-2 text-center py-12"
      >
        <v-icon size="48" color="primary" class="opacity-20"
          >mdi-message-outline</v-icon
        >
        <p class="text-white/30 text-sm">No messages yet. Say something!</p>
      </div>
    </div>

    <!-- Message Input -->
    <div
      class="flex-shrink-0 px-4 py-4 border-t border-white/5"
      style="background: rgba(26, 29, 39, 0.9); backdrop-filter: blur(8px)"
    >
      <div class="flex items-end gap-3">
        <v-text-field
          v-model="inputText"
          :placeholder="`Message #${activeRoom?.name}…`"
          hide-details
          class="flex-1"
          bg-color="surface-variant"
          rounded="xl"
          density="comfortable"
          @keydown.enter.exact.prevent="send"
        />
        <v-btn
          :disabled="!inputText.trim()"
          icon
          color="primary"
          size="large"
          class="flex-shrink-0 mb-0.5"
          style="background: linear-gradient(135deg, #7c6af7, #5a4fd4)"
          @click="send"
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </div>
      <p class="text-white/20 text-xs mt-2 px-1">
        Press <kbd class="bg-white/10 px-1 rounded text-white/40">Enter</kbd> to
        send
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useChat } from '../composables/useChat.js';
import MessageBubble from './MessageBubble.vue';

const emit = defineEmits(['toggle-drawer']);
const { username, activeRoom, activeMessages, sendMessage } = useChat();

const inputText = ref('');
const messagesList = ref(null);

function send() {
  const text = inputText.value.trim();

  if (!text) return;

  sendMessage(text);
  inputText.value = '';
}

// Auto-scroll on new messages
watch(
  activeMessages,
  async () => {
    await nextTick();

    if (messagesList.value) {
      messagesList.value.scrollTop = messagesList.value.scrollHeight;
    }
  },
  { deep: true },
);
</script>

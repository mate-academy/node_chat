<template>
  <!-- Fullscreen overlay dialog -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
       style="background: rgba(15, 17, 23, 0.95); backdrop-filter: blur(12px);">
    <v-card
      class="w-full max-w-sm"
      color="surface-variant"
      rounded="xl"
      elevation="24"
    >
      <!-- Gradient header -->
      <div
        class="flex flex-col items-center gap-3 pt-10 pb-6 px-6"
        style="background: linear-gradient(135deg, rgba(124,106,247,0.15) 0%, rgba(62,207,207,0.08) 100%);"
      >
        <div
          class="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
          style="background: linear-gradient(135deg, #7c6af7, #3ecfcf);"
        >
          <v-icon size="32" color="white">mdi-chat-processing</v-icon>
        </div>
        <h1 class="text-2xl font-bold text-white tracking-tight">
          {{ changeMode ? 'Change Username' : 'Welcome to NodeChat' }}
        </h1>
        <p class="text-white/50 text-sm text-center">
          {{ changeMode ? 'Enter your new display name' : 'Choose a username to get started' }}
        </p>
      </div>

      <v-card-text class="px-6 pb-2 pt-4">
        <v-text-field
          v-model="input"
          label="Username"
          placeholder="e.g. cooldev42"
          prepend-inner-icon="mdi-account"
          autofocus
          maxlength="32"
          counter
          :error-messages="error"
          @keydown.enter="submit"
        />
      </v-card-text>

      <v-card-actions class="px-6 pb-6 gap-3 flex-col">
        <v-btn
          block
          size="large"
          color="primary"
          class="font-semibold"
          style="background: linear-gradient(135deg, #7c6af7, #5a4fd4);"
          @click="submit"
        >
          {{ changeMode ? 'Save' : 'Start Chatting' }}
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
        <v-btn
          v-if="changeMode"
          block
          variant="text"
          color="white"
          class="opacity-50"
          @click="$emit('cancel')"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  changeMode: { type: Boolean, default: false },
});

const emit = defineEmits(['set', 'cancel']);

const input = ref('');
const error = ref('');

function submit() {
  const trimmed = input.value.trim();

  if (!trimmed) {
    error.value = 'Please enter a username';
    return;
  }

  if (trimmed.length < 2) {
    error.value = 'Must be at least 2 characters';
    return;
  }

  error.value = '';
  emit('set', trimmed);
}
</script>

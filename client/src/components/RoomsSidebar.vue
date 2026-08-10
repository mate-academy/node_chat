<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="px-4 pt-4 pb-2 flex items-center justify-between">
      <span
        class="text-xs font-semibold uppercase tracking-widest text-white/40"
        >Rooms</span
      >
      <div class="flex items-center gap-1">
        <v-btn
          icon="mdi-plus"
          size="x-small"
          variant="tonal"
          color="primary"
          title="Create room"
          @click="openCreate"
        />
        <v-btn
          icon="mdi-chevron-left"
          size="x-small"
          variant="text"
          color="white"
          class="opacity-60 hover:opacity-100"
          title="Close sidebar"
          @click="emit('close')"
        />
      </div>
    </div>

    <!-- Room List -->
    <v-list class="flex-1 overflow-y-auto px-2" nav density="compact">
      <v-list-item
        v-for="room in rooms"
        :key="room.id"
        :active="room.id === activeRoomId"
        active-color="primary"
        rounded="lg"
        class="room-item mb-1 group"
        @click="joinRoom(room.id)"
      >
        <!-- Room icon -->
        <template #prepend>
          <v-icon
            :color="room.id === activeRoomId ? 'primary' : 'white'"
            :class="room.id === activeRoomId ? 'opacity-100' : 'opacity-40'"
            size="18"
          >
            mdi-pound
          </v-icon>
        </template>

        <!-- Room name -->
        <v-list-item-title
          class="font-medium text-sm"
          :class="room.id === activeRoomId ? 'text-white' : 'text-white/60'"
        >
          {{ room.name }}
        </v-list-item-title>

        <!-- Room action buttons -->
        <template #append>
          <div
            class="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <button
              type="button"
              class="w-6 h-6 rounded-md bg-white/10 text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Rename room"
              @click.stop="openRename(room)"
            >
              <v-icon size="14">mdi-pencil</v-icon>
            </button>
            <button
              type="button"
              class="w-6 h-6 rounded-md bg-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/30 flex items-center justify-center transition-colors"
              title="Delete room"
              @click.stop="openDelete(room)"
            >
              <v-icon size="14">mdi-delete</v-icon>
            </button>
          </div>
        </template>
      </v-list-item>

      <!-- Empty state -->
      <div
        v-if="rooms.length === 0"
        class="text-center py-6 text-white/30 text-xs"
      >
        No rooms yet. Create one!
      </div>
    </v-list>

    <!-- ── Create Room Dialog ── -->
    <v-dialog v-model="createDialog" max-width="360">
      <v-card color="surface-variant" rounded="xl">
        <v-card-title class="pt-5 px-5 font-semibold text-white">
          <v-icon color="primary" class="mr-2">mdi-plus-circle-outline</v-icon>
          Create Room
        </v-card-title>
        <v-card-text class="px-5">
          <v-text-field
            v-model="roomNameInput"
            label="Room name"
            autofocus
            maxlength="64"
            :error-messages="nameError"
            @keydown.enter="submitCreate"
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-5 gap-2">
          <v-spacer />
          <v-btn
            variant="text"
            color="white"
            class="opacity-50"
            @click="createDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="submitCreate">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Rename Room Dialog ── -->
    <v-dialog v-model="renameDialog" max-width="360">
      <v-card color="surface-variant" rounded="xl">
        <v-card-title class="pt-5 px-5 font-semibold text-white">
          <v-icon color="secondary" class="mr-2">mdi-pencil</v-icon>
          Rename Room
        </v-card-title>
        <v-card-text class="px-5">
          <v-text-field
            v-model="roomNameInput"
            label="New room name"
            autofocus
            maxlength="64"
            :error-messages="nameError"
            @keydown.enter="submitRename"
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-5 gap-2">
          <v-spacer />
          <v-btn
            variant="text"
            color="white"
            class="opacity-50"
            @click="renameDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="secondary" @click="submitRename">Rename</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Delete Confirm Dialog ── -->
    <v-dialog v-model="deleteDialog" max-width="360">
      <v-card color="surface-variant" rounded="xl">
        <v-card-title class="pt-5 px-5 font-semibold text-white">
          <v-icon color="error" class="mr-2">mdi-delete-alert</v-icon>
          Delete Room
        </v-card-title>
        <v-card-text class="px-5 text-white/70 text-sm">
          Are you sure you want to delete
          <span class="text-white font-semibold">#{{ targetRoom?.name }}</span
          >? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="px-5 pb-5 gap-2">
          <v-spacer />
          <v-btn
            variant="text"
            color="white"
            class="opacity-50"
            @click="deleteDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="error" @click="submitDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useChat } from '../composables/useChat.js';

const emit = defineEmits(['close']);
const { rooms, activeRoomId, joinRoom, createRoom, renameRoom, deleteRoom } = useChat();

// ─── Create ──────────────────────────────────────────────────────────────────
const createDialog = ref(false);
const roomNameInput = ref('');
const nameError = ref('');

function openCreate() {
  roomNameInput.value = '';
  nameError.value = '';
  createDialog.value = true;
}

function submitCreate() {
  const name = roomNameInput.value.trim();

  if (!name) { nameError.value = 'Name is required'; return; }

  createRoom(name);
  createDialog.value = false;
}

// ─── Rename ──────────────────────────────────────────────────────────────────
const renameDialog = ref(false);
const targetRoom = ref(null);

function openRename(room) {
  targetRoom.value = room;
  roomNameInput.value = room.name;
  nameError.value = '';
  renameDialog.value = true;
}

function submitRename() {
  const name = roomNameInput.value.trim();

  if (!name) { nameError.value = 'Name is required'; return; }

  renameRoom(targetRoom.value.id, name);
  renameDialog.value = false;
}

// ─── Delete ──────────────────────────────────────────────────────────────────
const deleteDialog = ref(false);

function openDelete(room) {
  targetRoom.value = room;
  deleteDialog.value = true;
}

function submitDelete() {
  deleteRoom(targetRoom.value.id);
  deleteDialog.value = false;
}
</script>

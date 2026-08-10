<template>
  <!-- Own messages aligned right, others left -->
  <div
    class="flex gap-3 mb-2"
    :class="isOwn ? 'flex-row-reverse' : 'flex-row'"
  >
    <!-- Avatar -->
    <v-avatar
      :color="avatarColor"
      size="34"
      class="flex-shrink-0 mt-1"
    >
      <span class="text-xs font-bold text-white">{{ initials }}</span>
    </v-avatar>

    <!-- Bubble -->
    <div
      class="flex flex-col max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
      :class="isOwn ? 'items-end' : 'items-start'"
    >
      <!-- Author + time -->
      <div
        class="flex items-baseline gap-2 mb-1 px-1"
        :class="isOwn ? 'flex-row-reverse' : 'flex-row'"
      >
        <span class="text-xs font-semibold" :style="{ color: avatarColor }">
          {{ isOwn ? 'You' : message.author }}
        </span>
        <span class="text-white/25 text-xs">{{ formattedTime }}</span>
      </div>

      <!-- Message text -->
      <div
        class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words"
        :class="isOwn
          ? 'rounded-tr-sm text-white'
          : 'rounded-tl-sm text-white/90'"
        :style="isOwn
          ? { background: 'linear-gradient(135deg, #7c6af7, #5a4fd4)' }
          : { background: 'rgba(255,255,255,0.07)' }"
      >
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  isOwn: {
    type: Boolean,
    default: false,
  },
});

// Generate a consistent color from username
const COLORS = [
  '#7c6af7', '#3ecfcf', '#f471b5', '#ffba3b',
  '#5cacff', '#4caf88', '#ff7043', '#ab47bc',
];

function hashStr(str) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Math.abs(hash);
}

const avatarColor = computed(() =>
  COLORS[hashStr(props.message.author) % COLORS.length],
);

const initials = computed(() =>
  props.message.author
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join(''),
);

const formattedTime = computed(() => {
  const date = new Date(props.message.createdAt);

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});
</script>

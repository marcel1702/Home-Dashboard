<template>
  <button
    :disabled="!service.enabled"
    class="relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
    @click="emit('select', service)"
  >
    <div
      class="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-between h-48 w-full transition-transform group-hover:-translate-y-1"
      :class="{ 'opacity-60 cursor-not-allowed': !service.enabled }"
    >
      <div class="flex-1 flex items-center justify-center">
        <img v-if="service.icon" :src="service.icon" :alt="service.title" class="h-16 w-16 object-contain" />
        <div v-else class="h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 text-lg font-semibold">
          {{ initials }}
        </div>
      </div>
      <div class="text-center mt-4">
        <h2 class="text-lg font-semibold text-gray-900 truncate">{{ service.title }}</h2>
        <p class="text-sm text-gray-600 mt-1 h-10 overflow-hidden text-ellipsis">{{ service.description }}</p>
      </div>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  service: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['select']);

const initials = computed(() => {
  return props.service.title
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
});
</script>

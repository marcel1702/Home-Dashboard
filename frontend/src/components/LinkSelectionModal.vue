<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
      <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ service?.title }}</h3>
      <p class="text-sm text-gray-600 mb-6">{{ service?.description }}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          class="px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-900 transition"
          :disabled="!service?.internal_url"
          @click="() => handleNavigate(service?.internal_url)"
        >
          Intern öffnen
        </button>
        <button
          class="px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-900 transition"
          :disabled="!service?.external_url"
          @click="() => handleNavigate(service?.external_url)"
        >
          Extern öffnen
        </button>
      </div>
      <button class="mt-6 text-sm text-gray-600 underline" @click="emit('close')">Abbrechen</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  open: Boolean,
  service: Object,
});

const emit = defineEmits(['close']);

function handleNavigate(url) {
  if (!url) return;
  window.location.href = url;
  emit('close');
}
</script>

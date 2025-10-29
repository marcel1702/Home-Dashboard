<template>
  <section class="py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">Deine Dienste</h2>
          <p class="text-sm text-gray-600 mt-1">Schneller Zugriff auf interne und externe Services.</p>
        </div>
        <div v-if="isLoading" class="text-sm text-gray-600 animate-pulse">Lade Daten…</div>
      </div>
      <div v-if="error" class="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-6">
        {{ error }}
      </div>
      <div v-if="services.length === 0 && !isLoading" class="text-center text-gray-600 py-12">
        Noch keine Dienste angelegt.
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ServiceTile v-for="service in services" :key="service.id" :service="service" @select="openModal" />
      </div>
    </div>
    <LinkSelectionModal :open="selectedService !== null" :service="selectedService" @close="selectedService = null" />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import ServiceTile from '../components/ServiceTile.vue';
import LinkSelectionModal from '../components/LinkSelectionModal.vue';

const services = ref([]);
const isLoading = ref(false);
const error = ref('');
const selectedService = ref(null);

async function loadServices() {
  try {
    isLoading.value = true;
    const { data } = await axios.get('/api/services');
    services.value = data.services || [];
    error.value = '';
  } catch (err) {
    error.value = 'Die Dienste konnten nicht geladen werden.';
  } finally {
    isLoading.value = false;
  }
}

function openModal(service) {
  if (!service.enabled) return;
  selectedService.value = service;
}

onMounted(() => {
  loadServices();
});
</script>

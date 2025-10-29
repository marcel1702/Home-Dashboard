<template>
  <section class="py-12 bg-gray-100 min-h-screen">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">Service-Verwaltung</h2>
          <p class="text-sm text-gray-600">Anlegen, bearbeiten und sortieren der Dashboard-Kacheln.</p>
        </div>
        <button class="btn-secondary" @click="handleLogout">Abmelden</button>
      </div>

      <div v-if="feedback" :class="feedbackClass" class="rounded-xl p-4">{{ feedback }}</div>

      <div class="grid lg:grid-cols-2 gap-10">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Kacheln (Drag & Drop zum Sortieren)</h3>
          <ul class="space-y-3">
            <li
              v-for="service in services"
              :key="service.id"
              class="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 cursor-move"
              draggable="true"
              @dragstart="onDragStart(service.id)"
              @dragenter.prevent="onDragEnter(service.id)"
              @dragover.prevent
              @drop.prevent="onDrop(service.id)"
            >
              <div class="flex items-center gap-4 min-w-0">
                <img v-if="service.icon" :src="service.icon" :alt="service.title" class="h-12 w-12 object-contain" />
                <div>
                  <p class="font-semibold text-gray-900 truncate">{{ service.title }}</p>
                  <p class="text-xs text-gray-600 truncate">{{ service.description }}</p>
                  <p class="text-xs text-gray-400">{{ service.enabled ? 'Aktiv' : 'Deaktiviert' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button class="btn-secondary text-xs" @click="editService(service)">Bearbeiten</button>
                <button class="btn-danger text-xs" @click="() => confirmDelete(service.id)">Löschen</button>
              </div>
            </li>
          </ul>
          <p v-if="services.length === 0 && !isLoading" class="text-sm text-gray-600 mt-4">Noch keine Services vorhanden.</p>
        </div>

        <div>
          <div class="bg-white rounded-2xl shadow-xl p-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              {{ mode === 'edit' ? 'Service bearbeiten' : 'Neuen Service anlegen' }}
            </h3>
            <AdminServiceForm
              :mode="mode"
              :service="activeService"
              :max-upload-kb="maxUploadKb"
              @submit="handleSubmit"
              @cancel="resetForm"
              @icon-uploaded="refreshServices"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import client from '../api/client';
import AdminServiceForm from '../components/AdminServiceForm.vue';

const services = ref([]);
const isLoading = ref(false);
const feedback = ref('');
const feedbackType = ref('success');
const mode = ref('create');
const router = useRouter();
const dragState = reactive({ source: null });
const activeService = ref({
  title: '',
  description: '',
  internal_url: '',
  external_url: '',
  enabled: true,
  icon: null,
});
const maxUploadKb = Number(import.meta.env.VITE_MAX_UPLOAD_KB || 512);

const feedbackClass = computed(() =>
  feedbackType.value === 'error'
    ? 'bg-red-50 text-red-700 border border-red-200'
    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
);

async function refreshServices() {
  try {
    isLoading.value = true;
    const { data } = await client.get('/admin/services');
    services.value = data.services || [];
  } catch (error) {
    setFeedback(error.response?.data?.message || 'Services konnten nicht geladen werden.', 'error');
    if (error.response?.status === 401) {
      router.push({ name: 'admin-login' });
    }
  } finally {
    isLoading.value = false;
  }
}

function editService(service) {
  activeService.value = { ...service };
  mode.value = 'edit';
  feedback.value = '';
}

function resetForm() {
  activeService.value = {
    title: '',
    description: '',
    internal_url: '',
    external_url: '',
    enabled: true,
    icon: null,
  };
  mode.value = 'create';
}

async function handleSubmit(service) {
  try {
    const payload = {
      title: service.title,
      description: service.description,
      internal_url: service.internal_url,
      external_url: service.external_url,
      enabled: service.enabled,
    };
    if (mode.value === 'edit' && service.id) {
      await client.put(`/admin/services/${service.id}`, payload);
      setFeedback('Service aktualisiert.', 'success');
    } else {
      await client.post('/admin/services', payload);
      setFeedback('Service angelegt.', 'success');
    }
    await refreshServices();
    if (mode.value === 'create') {
      resetForm();
    }
  } catch (error) {
    setFeedback(error.response?.data?.message || 'Aktion fehlgeschlagen.', 'error');
    if (error.response?.status === 401) {
      router.push({ name: 'admin-login' });
    }
  }
}

async function confirmDelete(id) {
  if (!confirm('Service wirklich löschen?')) return;
  try {
    await client.delete(`/admin/services/${id}`);
    setFeedback('Service gelöscht.', 'success');
    await refreshServices();
    if (activeService.value.id === id) {
      resetForm();
    }
  } catch (error) {
    setFeedback(error.response?.data?.message || 'Löschen fehlgeschlagen.', 'error');
  }
}

function onDragStart(id) {
  dragState.source = id;
}

function onDragEnter(id) {
  if (!dragState.source || dragState.source === id) return;
  const currentOrder = services.value.slice();
  const fromIndex = currentOrder.findIndex((item) => item.id === dragState.source);
  const toIndex = currentOrder.findIndex((item) => item.id === id);
  const [moved] = currentOrder.splice(fromIndex, 1);
  currentOrder.splice(toIndex, 0, moved);
  services.value = currentOrder;
}

async function onDrop() {
  if (!dragState.source) return;
  dragState.source = null;
  try {
    const order = services.value.map((service) => service.id);
    await client.patch('/admin/services/reorder', order);
    setFeedback('Reihenfolge gespeichert.', 'success');
  } catch (error) {
    setFeedback(error.response?.data?.message || 'Sortierung konnte nicht gespeichert werden.', 'error');
  }
}

async function handleLogout() {
  await client.post('/auth/logout');
  router.push({ name: 'admin-login' });
}

function setFeedback(message, type) {
  feedback.value = message;
  feedbackType.value = type;
}

onMounted(() => {
  refreshServices();
});
</script>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-900 transition;
}
.btn-danger {
  @apply inline-flex items-center justify-center px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition;
}
</style>

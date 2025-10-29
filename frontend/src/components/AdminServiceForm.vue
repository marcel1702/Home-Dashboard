<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="label" for="title">Titel</label>
        <input id="title" v-model="localService.title" required class="input" placeholder="z. B. Portainer" />
      </div>
      <div>
        <label class="label" for="enabled">Aktiv</label>
        <select id="enabled" v-model="localService.enabled" class="input">
          <option :value="true">Aktiv</option>
          <option :value="false">Deaktiviert</option>
        </select>
      </div>
    </div>
    <div>
      <label class="label" for="description">Beschreibung</label>
      <textarea id="description" v-model="localService.description" class="input" rows="3"></textarea>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="label" for="internal">Interne URL</label>
        <input id="internal" v-model="localService.internal_url" type="url" class="input" placeholder="http://" />
      </div>
      <div>
        <label class="label" for="external">Externe URL</label>
        <input id="external" v-model="localService.external_url" type="url" class="input" placeholder="https://" />
      </div>
    </div>
    <div v-if="localService.id" class="space-y-2">
      <label class="label">Icon (PNG oder SVG, max. {{ maxUploadKb }} KB)</label>
      <input ref="fileInput" type="file" accept="image/png,image/svg+xml" class="input" @change="handleFileChange" />
      <p v-if="iconMessage" class="text-xs text-gray-600">{{ iconMessage }}</p>
      <img v-if="localService.icon" :src="localService.icon" alt="Aktuelles Icon" class="h-16 w-16 object-contain mt-2" />
    </div>
    <div class="flex items-center gap-3">
      <button type="submit" class="btn-primary">{{ submitLabel }}</button>
      <button v-if="mode === 'edit'" type="button" class="btn-secondary" @click="emit('cancel')">Abbrechen</button>
    </div>
  </form>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import client from '../api/client';

const props = defineProps({
  service: {
    type: Object,
    default: () => ({
      title: '',
      description: '',
      internal_url: '',
      external_url: '',
      enabled: true,
      icon: null,
    }),
  },
  mode: {
    type: String,
    default: 'create',
  },
  maxUploadKb: {
    type: Number,
    default: 512,
  },
});

const emit = defineEmits(['submit', 'cancel', 'iconUploaded']);

const localService = reactive({ ...props.service });
const fileInput = ref(null);
const iconMessage = ref('');

watch(
  () => props.service,
  (value) => {
    Object.keys(localService).forEach((key) => {
      delete localService[key];
    });
    Object.assign(
      localService,
      value || {
        title: '',
        description: '',
        internal_url: '',
        external_url: '',
        enabled: true,
        icon: null,
      }
    );
    if (!value?.id) {
      localService.enabled = value?.enabled ?? true;
    }
    iconMessage.value = '';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
);

const submitLabel = computed(() => (props.mode === 'edit' ? 'Speichern' : 'Anlegen'));

async function handleSubmit() {
  emit('submit', { ...localService });
}

async function handleFileChange(event) {
  if (!props.service?.id) return;
  const [file] = event.target.files || [];
  if (!file) return;
  iconMessage.value = '';

  const formData = new FormData();
  formData.append('icon', file);
  formData.append('serviceId', props.service.id);

  try {
    await client.post('/admin/upload-icon', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    iconMessage.value = 'Icon aktualisiert.';
    emit('iconUploaded');
  } catch (error) {
    iconMessage.value = error.response?.data?.message || 'Upload fehlgeschlagen.';
  }
}
</script>

<style scoped>
.label {
  @apply block text-sm font-medium text-gray-600 mb-1;
}
.input {
  @apply w-full rounded-xl border border-gray-200 bg-white focus:border-gray-900 focus:ring-gray-900;
}
.btn-primary {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 transition disabled:opacity-50;
}
.btn-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-900 transition;
}
</style>

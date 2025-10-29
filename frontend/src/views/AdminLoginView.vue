<template>
  <section class="py-16 bg-gray-100 min-h-[60vh]">
    <div class="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-10">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Admin Login</h2>
      <p class="text-sm text-gray-600 mb-8">Bitte gib das Administrator-Passwort ein.</p>
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1" for="password">Passwort</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full rounded-xl border-gray-200 focus:border-gray-900 focus:ring-gray-900"
            autocomplete="current-password"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-gray-900 text-white rounded-xl py-3 font-semibold hover:bg-gray-700 transition disabled:opacity-50"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Wird geprüft…' : 'Anmelden' }}
        </button>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import client from '../api/client';

const router = useRouter();
const password = ref('');
const error = ref('');
const isLoading = ref(false);

async function handleLogin() {
  error.value = '';
  if (!password.value) return;
  try {
    isLoading.value = true;
    await client.post('/auth/login', { password: password.value });
    router.push({ name: 'admin-services' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Login fehlgeschlagen';
  } finally {
    isLoading.value = false;
  }
}
</script>

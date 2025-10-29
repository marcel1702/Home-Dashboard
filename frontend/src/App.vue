<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white shadow-sm">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <h1 class="text-2xl font-semibold tracking-tight text-gray-900">Home Dashboard</h1>
        <nav class="space-x-4 text-sm">
          <RouterLink class="text-gray-600 hover:text-gray-900 transition-colors" to="/">Übersicht</RouterLink>
          <RouterLink class="text-gray-600 hover:text-gray-900 transition-colors" to="/admin/login">Admin</RouterLink>
        </nav>
      </div>
    </header>
    <main class="flex-1">
      <RouterView />
    </main>
    <footer class="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
      © {{ new Date().getFullYear() }} Home Dashboard
    </footer>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

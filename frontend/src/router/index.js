import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import AdminLoginView from '../views/AdminLoginView.vue';
import AdminServicesView from '../views/AdminServicesView.vue';

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLoginView,
  },
  {
    path: '/admin/services',
    name: 'admin-services',
    component: AdminServicesView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

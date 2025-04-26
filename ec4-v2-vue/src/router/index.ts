import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import RecoveryView from '@/views/RecoveryView.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/new',
    },
    {
      path: '/new',
      name: 'new',
      component: HomeView,
    },
    {
      path: '/bundle/:bundleId',
      name: 'bundle',
      props: true,
      component: HomeView,
    },
    {
      path: '/password-reset/:token',
      name: 'password-reset',
      component: RecoveryView,
      props: true,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
});

export default router;

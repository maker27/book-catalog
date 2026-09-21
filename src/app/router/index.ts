import { createRouter, createWebHistory } from 'vue-router';

import { useSessionStore } from '@/features/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/books',
    },
    {
      path: '/books',
      name: 'books',
      component: () => import('@/pages/books'),
    },
    {
      path: '/books/new',
      name: 'book-create',
      component: () => import('@/pages/book-create'),
      meta: { requiresAuth: true },
    },
    {
      path: '/books/:id(\\d+)',
      name: 'book-details',
      component: () => import('@/pages/book-details'),
      props: true,
    },
    {
      path: '/books/:id(\\d+)/edit',
      name: 'book-edit',
      component: () => import('@/pages/book-edit'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/authors',
      name: 'authors',
      component: () => import('@/pages/authors'),
    },
    {
      path: '/authors/new',
      name: 'author-create',
      component: () => import('@/pages/author-create'),
      meta: { requiresAuth: true },
    },
    {
      path: '/authors/:id(\\d+)',
      name: 'author-details',
      component: () => import('@/pages/author-details'),
      props: true,
    },
    {
      path: '/authors/:id(\\d+)/edit',
      name: 'author-edit',
      component: () => import('@/pages/author-edit'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/login'),
    },
    {
      path: '/top-authors',
      name: 'top-authors',
      component: () => import('@/pages/top-authors'),
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('@/pages/forbidden'),
    },
    {
      path: '/not-found',
      name: 'not-found',
      component: () => import('@/pages/not-found'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/not-found',
    },
  ],
});

router.beforeEach((to) => {
  const session = useSessionStore();
  session.checkSessionExpiration();

  if (!to.meta.requiresAuth) {
    return true;
  }

  if (session.isAuthenticated) {
    return true;
  }

  return { path: '/login', query: { redirect: to.fullPath } };
});

export default router;

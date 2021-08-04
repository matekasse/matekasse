import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store/index';

Vue.use(VueRouter);

const routes = [
    {
        path: '*',
        meta: {
            name: '',
            requiresAuth: true,
        },
        redirect: {
            path: '/menu',
        },
    },
    {
        path: '/',
        meta: {
            name: '',
            requiresAuth: false,
        },
        component: () => import('../views/login-view.vue'),
        beforeEnter: (to, from, next) => {
            if (store.getters.jwt) {
                next('/menu');
            } else {
                next();
            }
        },
        children: [
            {
                path: '',
                component: () => import('@/components/auth/login.vue'),
            },
            {
                path: '/register',
                name: '',
                component: () => import('@/components/auth/register.vue'),
            },
        ],
    },
    {
        path: '/home',
        meta: {
            name: '',
            requiresAuth: true,
        },
        component: () => import('@/views/home-view.vue'),
        children: [
            {
                path: '/menu',
                name: 'menu',
                component: () => import('@/components/product-page/product-list.vue'),
                meta: {
                    requiresAuth: true,
                },
            },
            {
                path: '/admin',
                name: 'admin-page',
                component: () => import('@/components/admin-page/admin-page.vue'),
                meta: {
                    requiresAuth: true,
                },
            },
            {
                path: '/userpage',
                name: 'user-page',
                component: () => import('@/components/user-page/user-page.vue'),
                meta: {
                    requiresAuth: true,
                },
            },
        ],
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

router.beforeEach((to, from, next) => {
    // Use next tick to handle router history correctly
    // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
    Vue.nextTick(() => {
        document.title = 'matekasse';
    });

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (store.getters.jwt == null) {
            next({
                path: '/',
            });
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;

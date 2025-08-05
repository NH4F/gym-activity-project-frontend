import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/index.vue';
import CartPage from "../pages/CartPage.vue";
import WarehousePage from "../pages/WarehousePage.vue";

const routes = [
    {
        path: '/',
        name: 'index',
        component: HomePage
    },
    {
        path: '/cart',
        name: 'cart',
        component: CartPage,
    },
    {
        path: '/warehouse',
        name: 'warehouse',
        component: WarehousePage,
    },
    //其他路由配置
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.path !== '/login' && !token) {
        next('/login')
    } else if (to.path === '/login' && token) {
        next('/')
    } else {
        next()
    }
})

export default router;

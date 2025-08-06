import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/home.vue'
import LoginPage from '../pages/User/login.vue'
import RegisterPage from '../pages/User/register.vue'
import UserProfilePage from '../pages/User/userInfo.vue'

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'index',
        component: HomePage,
        meta: {
            showNav: true,
            title: 'FA GYM',
            requiresAuth: true
        }
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage,
        meta: {
            showNav: false,
            title: '登录'
        }
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterPage,
        meta: {
            showNav: false,
            title: '注册'
        }
    },
    {
        path: '/user/profile',
        name: 'user-profile',
        component: UserProfilePage,
        meta: {
            showNav: true,
            title: '个人信息',
            requiresAuth: true,
            // 假设管理员页面需要管理员权限
            // requiresAdmin: true
        }
    },
    // 其他路由配置
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');

    // 1. 检查是否需要登录
    if (to.meta.requiresAuth && !isAuthenticated) {
        console.warn('未登录，重定向到登录页');
        next({ name: 'login' });
        return; // 终止后续操作
    }

    // 2. 检查是否需要管理员权限
    if (to.meta.requiresAdmin && role !== 'admin') {
        console.warn('无管理员权限，重定向到首页');
        alert('您没有权限访问此页面');
        next({ name: 'index' });
        return; // 终止后续操作
    }

    // 3. 如果已登录，且访问的是登录或注册页，则重定向到首页
    if (isAuthenticated && (to.name === 'login' || to.name === 'register')) {
        next({ name: 'index' });
        return; // 终止后续操作
    }

    // 4. 其他情况，正常放行
    next();
});

export default router;
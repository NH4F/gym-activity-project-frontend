import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/home.vue';
import LoginPage from '../pages/User/login.vue';
import RegisterPage from '../pages/User/register.vue';
import UserProfilePage from '../pages/User/userInfo.vue';
import ManageActivityPage from '../pages/Activity/manageActivity.vue';
import ActivityDetailPage from '../pages/Activity/activityDetail.vue';
import MyActivityPage from '../pages/Activity/myActivity.vue';
import MyOrderPage from '../pages/Order/myOrder.vue';

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'home',
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
            requiresAuth: true
        }
    },
    {
        path: '/manageActivity',
        name: 'manage-activity',
        component: ManageActivityPage,
        meta: {
            showNav: true,
            title: '活动管理',
            requiresAuth: true,
            requiresAdmin: true
        }
    },
    {
        path: '/activity/:id',
        name: 'activity-detail',
        component: ActivityDetailPage,
        meta: {
            showNav: true,
            title: '活动详情',
            requiresAuth: true
        }
    },
    {
        path: '/myActivity',
        name: 'my-activity',
        component: MyActivityPage,
        meta: {
            showNav: true,
            title: '我的活动',
            requiresAuth: true
        }
    },
    {
        path: "/order",
        name: "order",
        component: MyOrderPage,
        meta: {
            showNav: true,
            title: '我的订单',
            requiresAuth: true
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAdmin) {
        const role = sessionStorage.getItem('role');
        if (role === 'admin') {
            next();
        } else {
            alert('您没有权限访问此页面');
            next(from.path);
        }
    } else if (to.meta.requiresAuth) {
        const isAuthenticated = sessionStorage.getItem('token');
        if (isAuthenticated) {
            next();
        } else {
            next({ name: 'login' });
        }
    } else {
        next();
    }
});

export default router;
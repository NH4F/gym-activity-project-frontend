import axios from 'axios';
import {useRouter} from 'vue-router'
const router = useRouter()
// 创建 Axios 实例
export const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 通用响应结构
export interface ApiResponse<T = any> {
    code: string;
    message: string;
    data: T;
}
//配置拦截器
apiClient.interceptors.request.use(
    config => {
        const token = sessionStorage.getItem('token')
        if (token) {
            config.headers['token'] = token  // 👈 后端要求的字段名
        }
        return config
    },
)
// 响应拦截器：统一处理 401 未登录
apiClient.interceptors.response.use(
    response => {
        return response
    },
    error => {
        if (error.response && error.response.status === 401) {
            console.warn('未授权，登录失效')
            alert('登录失效，请重新登录')
            sessionStorage.removeItem('token')
            router.push('/login')
        }
    }
)
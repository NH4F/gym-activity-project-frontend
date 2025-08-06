import { apiClient, ApiResponse } from './apiClient';

export interface UserVO {
    id?: number;
    username: string;
    password: string;
    phoneNumber: string;
    role?: string;
    balance?: number;
}

// 获取用户详情
export function getUser(username: string) {
    return apiClient.get<ApiResponse<UserVO>>(`/accounts/${username}`);
}

// 注册新用户
export function register(user: UserVO) {
    return apiClient.post<ApiResponse<string>>('/accounts/register', user);
}

// 更新用户信息
export function updateUser(user: UserVO) {
    return apiClient.put<ApiResponse<boolean>>('/accounts', user);
}

// 登录
export function login(username: string, password: string) {
    return apiClient.post<ApiResponse<string>>(
        '/accounts/login',
        null,
        { params: { username, password } }
    );
}
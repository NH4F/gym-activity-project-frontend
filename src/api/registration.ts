import { apiClient, ApiResponse } from './apiClient';

// 报名信息的VO接口，与后端的RegistrationVO.java对应
export interface RegistrationVO {
    id?: number; // Registration ID
    userId: number; // User ID
    activityId: number; // Activity ID
    registrationTime?: string; // Registration time in ISO 8601 format
    status?: string; // e.g., "registered", "signable", etc.
    activityCost?: number; // Cost of the activity
}

/**
 * 报名活动
 * @param registrationVO 包含 userId 和 activityId 的报名信息
 */
export function registerActivity(registrationVO: RegistrationVO) {
    return apiClient.post<ApiResponse<string>>('/registration', registrationVO);
}

/**
 * 取消报名
 * @param registrationId 要取消的报名ID
 */
export function cancelRegistration(registrationId: number) {
    return apiClient.delete<ApiResponse<string>>('/registration', {
        params: { registrationId },
    });
}

/**
 * 获取个人报名列表
 * @param userId 用户的ID
 */
export function getPersonalRegistrations(userId: number) {
    return apiClient.get<ApiResponse<RegistrationVO[]>>('/registration', {
        params: { userId },
    });
}
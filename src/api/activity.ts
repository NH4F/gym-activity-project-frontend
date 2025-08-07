import { apiClient, ApiResponse } from './apiClient';

// 定义与后端 ActivityVO 匹配的接口
export interface ActivityVO {
    id?: number;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    status: string;
    location: string;
    price: string;
    capacity: number;
    currentParticipants?: number;
}

// 创建活动
export function createActivity(activity: ActivityVO) {
    return apiClient.post<ApiResponse<string>>('/activity', activity);
}

// 获取所有活动
export function getActivities() {
    return apiClient.get<ApiResponse<ActivityVO[]>>('/activity');
}

// 删除活动
export function deleteActivity(activityId: number) {
    return apiClient.delete<ApiResponse<string>>('/activity', {
        params: { activityId },
    });
}

// 更新活动
export function updateActivity(activity: ActivityVO) {
    return apiClient.put<ApiResponse<string>>('/activity', activity);
}

// 搜索活动
export function searchActivities(keyword: string) {
    return apiClient.get<ApiResponse<ActivityVO[]>>('/activity/search', {
        params: { keyword },
    });
}
// 获取活动详情
export function getActivityDetails(activityId: number) {
    return apiClient.get<ApiResponse<ActivityVO>>(`/activity/${activityId}`);
}
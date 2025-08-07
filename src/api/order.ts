import { apiClient, ApiResponse } from './apiClient';

/**
 * 订单数据传输对象接口
 * 对应后端的 OrderVO.java
 */
export interface OrderVO {
    id?: number;
    userId: number;
    amount: string; // 后端使用 BigDecimal，前端通常用 string 或 number 表示金额
    paymentStatus: string; // 支付状态，如 "pending", "completed"
}

/**
 * 创建新订单
 * @param userId - 用户ID
 * @param registrationIds - 报名的活动ID列表
 * @returns 包含操作结果的Promise
 */
export function addOrder(userId: number, registrationIds: number[]) {
    return apiClient.post<ApiResponse<string>>('/order', null, {
        params: {
            userId,
            registrationIds: registrationIds.join(',') // 将数组转为逗号分隔的字符串
        }
    });
}

/**
 * 获取某个用户的所有订单
 * @param userId - 用户ID
 * @returns 包含订单列表的Promise
 */
export function getOrders(userId: number) {
    return apiClient.get<ApiResponse<OrderVO[]>>('/order', {
        params: { userId }
    });
}

/**
 * 取消订单
 * @param orderId - 订单ID
 * @returns 包含操作结果的Promise
 */
export function cancelOrder(orderId: number) {
    return apiClient.delete<ApiResponse<string>>('/order', {
        params: { orderId }
    });
}

/**
 * 支付订单
 * @param orderId - 订单ID
 * @returns 包含操作结果的Promise
 */
export function payOrder(orderId: number) {
    return apiClient.post<ApiResponse<string>>(`/order/pay`, null, {
        params: { orderId }
    });
}
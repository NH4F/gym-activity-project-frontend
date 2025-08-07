import { apiClient, ApiResponse } from './apiClient';

/**
 * 评论数据传输对象接口
 * 对应后端的 CommentVO.java
 */
export interface CommentVO {
    id?: number;
    activityId: number;
    userId: number;
    commentText: string;
    commentTime?: string; // 后端为 Date，前端通常用 string 来表示
}

/**
 * 根据活动ID获取评论列表
 * 对应 GET /comment/{activityId}
 * @param activityId - 活动ID
 * @returns 包含评论列表的 Promise
 */
export function getCommentsByActivityId(activityId: number) {
    return apiClient.get<ApiResponse<CommentVO[]>>(`/comment`, {
        params: { activityId },
    });
}

/**
 * 新增评论
 * 对应 POST /comment
 * @param commentVO - 评论内容和关联信息
 * @returns 包含操作结果的 Promise
 */
export function addComment(commentVO: CommentVO) {
    return apiClient.post<ApiResponse<string>>('/comment', commentVO);
}

/**
 * 更新评论
 * 对应 PUT /comment/{commentId}
 * @param commentId - 评论ID
 * @param comment - 包含更新内容的评论对象
 * @returns 包含操作结果的 Promise
 */
export function updateComment(commentId: number, comment: { content: string }) {
    return apiClient.put<ApiResponse<string>>(`/comment/${commentId}`, comment);
}

/**
 * 删除评论
 * 对应 DELETE /comment/{commentId}
 * @param commentId - 评论ID
 * @returns 包含操作结果的 Promise
 */
export function deleteComment(commentId: number) {
    return apiClient.delete<ApiResponse<string>>(`/comment/${commentId}`);
}
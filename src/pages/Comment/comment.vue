<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getCommentsByActivityId,
  addComment,
  CommentVO,
} from '@/api/comment';
import {
  ChatDotSquare,
  User,
  Calendar,
} from '@element-plus/icons-vue';

const props = defineProps({
  activityId: {
    type: Number,
    required: true,
  },
});

const comments = ref<CommentVO[]>([]);
const newCommentContent = ref('');
const isLoading = ref(true);
const isSubmitting = ref(false);
const error = ref<string | null>(null);

const fetchComments = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await getCommentsByActivityId(props.activityId);
    if (res.data.code === '200') {
      comments.value = res.data.data;
    } else {
      ElMessage.error(res.data.message || '获取评论失败');
      error.value = '获取评论失败';
    }
  } catch (err) {
    ElMessage.error('获取评论失败，请检查网络');
    error.value = '网络请求失败';
  } finally {
    isLoading.value = false;
  }
};

const handleAddComment = async () => {
  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    ElMessage.warning('请先登录才能发表评论');
    return;
  }
  if (!newCommentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空');
    return;
  }

  isSubmitting.value = true;
  try {
    const commentData = {
      activityId: props.activityId,
      userId: Number(userId),
      commentText: newCommentContent.value,
    };
    const res = await addComment(commentData);
    if (res.data.code === '200') {
      ElMessage.success('评论发表成功！');
      newCommentContent.value = '';
      await fetchComments(); // 刷新评论列表
    } else {
      ElMessage.error(res.data.message || '评论发表失败');
    }
  } catch (err) {
    ElMessage.error('评论发表失败，请稍后再试');
  } finally {
    isSubmitting.value = false;
  }
};

// 监听 activityId 变化，当它改变时重新加载评论
watch(() => props.activityId, (newVal) => {
  if (newVal) {
    fetchComments();
  }
}, { immediate: true }); // immediate: true 可以在组件挂载时立即执行一次

const formatCommentTime = (time: string) => {
  const date = new Date(time);
  return date.toLocaleString();
};
</script>

<template>
  <div class="comment-section-container">
    <h3>
      <el-icon><ChatDotSquare /></el-icon>
      评论 ({{ comments.length }})
    </h3>

    <div class="add-comment-area">
      <el-input
          v-model="newCommentContent"
          placeholder="发表你的评论..."
          :rows="3"
          type="textarea"
          class="comment-input"
      />
      <el-button
          type="primary"
          :disabled="isSubmitting || !newCommentContent.trim()"
          :loading="isSubmitting"
          @click="handleAddComment"
      >
        发表评论
      </el-button>
    </div>

    <div v-if="isLoading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-else-if="comments.length > 0" class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-header">
                    <span class="user-id">
                        <el-icon><User /></el-icon>
                        用户ID: {{ comment.userId }}
                    </span>
          <span class="comment-time">
                        <el-icon><Calendar /></el-icon>
                        {{ formatCommentTime(comment.commentTime) }}
                    </span>
        </div>
        <div class="comment-content">
          {{ comment.commentText }}
        </div>
      </div>
    </div>
    <div v-else class="no-data-message">
      <el-empty description="还没有人发表评论，快来抢沙发吧！" />
    </div>
  </div>
</template>

<style scoped>
.comment-section-container {
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.add-comment-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
}

.comment-input {
  min-height: 80px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 15px;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.user-id,
.comment-time {
  display: flex;
  align-items: center;
  gap: 5px;
}

.comment-content {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
}

.loading,
.error-message,
.no-data-message {
  text-align: center;
  padding: 20px;
  color: #909399;
}
</style>
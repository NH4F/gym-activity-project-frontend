<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getActivityDetails, ActivityVO } from '@/api/activity';
import { registerActivity } from '@/api/registration'; // 👈 新增：引入报名API
import { ElMessage, ElIcon, ElMessageBox } from 'element-plus';
import { Location, Calendar, Money, User, Back } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const activity = ref<ActivityVO | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchActivityDetails = async () => {
  const activityId = route.params.id;
  if (!activityId) {
    ElMessage.error('缺少活动ID');
    error.value = '缺少活动ID';
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  error.value = null;
  try {
    const res = await getActivityDetails(Number(activityId));
    if (res.data.code === '200') {
      activity.value = res.data.data;
    } else {
      ElMessage.error(res.data.message);
      error.value = res.data.message;
    }
  } catch (err) {
    ElMessage.error('获取活动详情失败');
    error.value = '获取活动详情失败';
  } finally {
    isLoading.value = false;
  }
};

const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '时间未知';
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

const goBack = () => {
  router.back();
};

// 👈 新增：报名逻辑
const handleRegistration = async () => {
  // 检查用户是否登录
  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    ElMessage.warning('请先登录才能报名');
    router.push('/login');
    return;
  }

  if (!activity.value) {
    ElMessage.error('活动数据加载失败');
    return;
  }

  // 检查活动是否已开始或已结束
  if (activity.value.status !== '未开始') {
    ElMessage.warning('该活动已开始或已结束，无法报名');
    return;
  }

  // 检查活动是否已满
  if (activity.value.currentParticipants >= activity.value.capacity) {
    ElMessage.warning('该活动已满员');
    return;
  }

  try {
    await ElMessageBox.confirm(
        '确定要报名此活动吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        }
    );

    const registrationData = {
      userId: Number(userId),
      activityId: activity.value.id,
      status: 'unsettled', // 默认状态为未结算
      registrationTime: new Date().toISOString(),
    };

    const res = await registerActivity(registrationData);
    if (res.data.code === '200') {
      ElMessage.success('报名成功！');
      // 更新当前参与人数
      if (activity.value) {
        activity.value.currentParticipants = (activity.value.currentParticipants || 0) + 1;
      }
    } else {
      ElMessage.error('重复报名');
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('报名失败，请稍后再试');
    }
  }
};

onMounted(() => {
  fetchActivityDetails();
});
</script>

<template>
  <div class="page-container">
    <div class="page-card">
      <el-button :icon="Back" @click="goBack" class="back-button">返回</el-button>
      <h2 v-if="activity" class="card-title">{{ activity.name }}</h2>
      <div v-if="isLoading" class="loading">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-else-if="activity" class="activity-detail">
        <div class="detail-section">
          <h3 class="section-title">活动信息</h3>
          <div class="info-item">
            <span class="label">描述：</span>
            <p class="description">{{ activity.description }}</p>
          </div>
          <div class="info-item">
            <span class="label">状态：</span>
            <el-tag :type="activity.status === '进行中' ? 'success' : (activity.status === '已结束' ? 'info' : 'warning')">
              {{ activity.status }}
            </el-tag>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">时间与地点</h3>
          <div class="info-item">
            <span class="label"><el-icon><Calendar /></el-icon> 开始时间：</span>
            <span class="value">{{ formatDateTime(activity.startTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label"><el-icon><Calendar /></el-icon> 结束时间：</span>
            <span class="value">{{ formatDateTime(activity.endTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label"><el-icon><Location /></el-icon> 地点：</span>
            <span class="value">{{ activity.location }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">参与信息</h3>
          <div class="info-item">
            <span class="label"><el-icon><Money /></el-icon> 价格：</span>
            <span class="value">{{ activity.price }}</span>
          </div>
          <div class="info-item">
            <span class="label"><el-icon><User /></el-icon> 容量：</span>
            <span class="value">{{ activity.currentParticipants }} / {{ activity.capacity }}</span>
          </div>
        </div>

        <div class="registration-section">
          <el-button
              type="primary"
              class="registration-button"
              :disabled="activity.status !== '未开始' || activity.currentParticipants >= activity.capacity"
              @click="handleRegistration"
          >
            {{ activity.status !== '未开始' ? '活动已开始' : (activity.currentParticipants >= activity.capacity ? '已满员' : '立即报名') }}
          </el-button>
        </div>
      </div>
      <div v-else class="no-data-message">
        <el-empty description="未找到活动详情" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  background-color: #f0f2f5;
  padding: 20px;
  margin-top: 60px;
}

.page-card {
  width: 80%;
  max-width: 80%;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.back-button {
  margin-bottom: 20px;
}

.card-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  color: #333;
  font-weight: 600;
}

.activity-detail {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.detail-section {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  font-size: 16px;
  color: #606266;
}

.label {
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
}

.description {
  flex: 1;
  line-height: 1.6;
  margin: 0;
  padding-left: 10px;
}

.value {
  padding-left: 10px;
}

.loading, .error-message, .no-data-message {
  text-align: center;
  padding: 50px;
  color: #909399;
}

/* 👈 新增：报名按钮样式 */
.registration-section {
  text-align: center;
  margin-top: 20px;
}

.registration-button {
  width: 200px;
  height: 50px;
  font-size: 18px;
  font-weight: bold;
}
</style>
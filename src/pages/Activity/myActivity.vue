<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getPersonalRegistrations,
  cancelRegistration,
  RegistrationVO,
} from '@/api/registration';
import {
  getActivityDetails,
  ActivityVO,
} from '@/api/activity';
import {
  Location,
  Calendar,
  Money,
  User,
  Back,
} from '@element-plus/icons-vue';

const router = useRouter();
const registrations = ref<RegistrationVO[]>([]);
const activities = ref<ActivityVO[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchMyActivities = async () => {
  isLoading.value = true;
  error.value = null;
  const userId = sessionStorage.getItem('userId');

  if (!userId) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  try {
    const res = await getPersonalRegistrations(Number(userId));
    if (res.data.code === '200') {
      registrations.value = res.data.data;

      // 获取每个报名记录对应的活动详情
      if (registrations.value.length > 0) {
        const activityDetailsPromises = registrations.value.map(reg =>
            getActivityDetails(reg.activityId)
        );
        const activityDetailsResponses = await Promise.all(activityDetailsPromises);

        activities.value = activityDetailsResponses
            .filter(res => res.data.code === '200' && res.data.data)
            .map(res => res.data.data);
      } else {
        activities.value = [];
      }
    } else {
      ElMessage.error(res.data.message);
      error.value = '获取报名列表失败';
    }
  } catch (err) {
    ElMessage.error('获取报名列表失败');
    error.value = '网络请求失败';
  } finally {
    isLoading.value = false;
  }
};

const handleCancelRegistration = async (registrationId: number, activityName: string) => {
  try {
    await ElMessageBox.confirm(
        `确定要取消报名活动 "${activityName}" 吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    );

    const res = await cancelRegistration(registrationId);
    if (res.data.code === '200') {
      ElMessage.success('取消报名成功！');
      // 从列表中移除已取消的活动
      await fetchMyActivities();
    } else {
      ElMessage.error(res.data.message);
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('取消报名失败，请稍后再试');
    }
  }
};

const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '时间未知';
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

const getRegistrationId = (activityId: number): number | undefined => {
  const registration = registrations.value.find(reg => reg.activityId === activityId);
  return registration?.id;
};

onMounted(() => {
  fetchMyActivities();
});
</script>

<template>
  <div class="page-container">
    <div class="page-card">
      <h2 class="card-title">我的活动</h2>

      <div v-if="isLoading" class="loading">
        <el-skeleton animated />
      </div>
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-else-if="activities.length > 0" class="activity-grid">
        <el-card
            v-for="activity in activities"
            :key="activity.id"
            class="activity-card"
            shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span>{{ activity.name }}</span>
              <el-tag :type="activity.status === '进行中' ? 'success' : (activity.status === '已结束' ? 'info' : 'warning')">
                {{ activity.status }}
              </el-tag>
            </div>
          </template>
          <div class="card-content">
            <p class="description">{{ activity.description }}</p>
            <div class="info-row">
              <span><el-icon><Location /></el-icon> 地点: {{ activity.location }}</span>
              <span><el-icon><Calendar /></el-icon> 时间: {{ formatDateTime(activity.startTime) }}</span>
            </div>
            <div class="info-row">
              <span><el-icon><Money /></el-icon> 价格: {{ activity.price }}</span>
              <span><el-icon><User /></el-icon> 人数: {{ activity.currentParticipants }} / {{ activity.capacity }}</span>
            </div>
          </div>
          <div class="card-actions">
            <el-button
                type="danger"
                :disabled="activity.status === '已结束'"
                @click="handleCancelRegistration(getRegistrationId(activity.id)!, activity.name)"
            >
              取消报名
            </el-button>
          </div>
        </el-card>
      </div>
      <div v-else class="no-data-message">
        <el-empty description="您还没有报名任何活动" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 通用页面布局样式 */
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

.card-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  color: #333;
  font-weight: 600;
}

/* 活动卡片列表样式 */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.activity-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #909399;
}

.info-row span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.card-actions {
  margin-top: 20px;
  text-align: right;
}

.loading,
.error-message,
.no-data-message {
  text-align: center;
  padding: 50px;
  color: #909399;
}
</style>
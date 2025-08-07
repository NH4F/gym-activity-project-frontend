<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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
// 👈 新增：引入 addOrder API
import { addOrder } from '@/api/order';

const router = useRouter();
const registrations = ref<RegistrationVO[]>([]);
const activities = ref<ActivityVO[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const selectedActivityIds = ref<number[]>([]);
const isAllSelected = computed({
  get: () => {
    const unsettledActivities = activities.value.filter(act => {
      const reg = registrations.value.find(r => r.activityId === act.id);
      // 👈 状态判断更新：使用 'unsettled'
      return reg && reg.status === 'unsettled';
    });
    return unsettledActivities.length > 0 && selectedActivityIds.value.length === unsettledActivities.length;
  },
  set: (value) => {
    if (value) {
      const unsettledActivities = activities.value.filter(act => {
        const reg = registrations.value.find(r => r.activityId === act.id);
        // 👈 状态判断更新：使用 'unsettled'
        return reg && reg.status === 'unsettled';
      });
      selectedActivityIds.value = unsettledActivities.map(act => act.id!);
    } else {
      selectedActivityIds.value = [];
    }
  }
});

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
      if (registrations.value.length > 0) {
        const activityDetailsPromises = registrations.value.map(reg =>
            getActivityDetails(reg.activityId)
        );
        const activityDetailsResponses = await Promise.all(activityDetailsPromises);

        activities.value = activityDetailsResponses
            .filter(res => res.data.code === '200' && res.data.data)
            .map(res => {
              const activityDetail = res.data.data;
              const registration = registrations.value.find(reg => reg.activityId === activityDetail.id);
              return {
                ...activityDetail,
                registrationStatus: registration?.status,
              };
            });
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

const handleCancelRegistration = async (registrationId: number, activityId: number, activityName: string) => {
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
      await fetchMyActivities();
      selectedActivityIds.value = selectedActivityIds.value.filter(id => id !== activityId);
    } else {
      ElMessage.error(res.data.message || '取消报名失败');
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('取消报名失败，请稍后再试');
    } else {
      ElMessage.info('已取消操作');
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

// 👈 关键修改：补全 handleSubmitOrder 函数逻辑
const handleSubmitOrder = async () => {
  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  if (selectedActivityIds.value.length === 0) {
    ElMessage.warning('请至少选择一个活动');
    return;
  }

  // 获取选中的未结算活动的 registrationId 列表
  const unsettledSelectedRegistrations = registrations.value.filter(reg =>
      selectedActivityIds.value.includes(reg.activityId!) && reg.status === 'unsettled'
  );

  if (unsettledSelectedRegistrations.length === 0) {
    ElMessage.warning('您选择的活动都已结算，请勿重复提交订单');
    return;
  }

  const registrationIdsToOrder = unsettledSelectedRegistrations.map(reg => reg.id!);

  try {
    const res = await addOrder(Number(userId), registrationIdsToOrder);
    if (res.data.code === '200') {
      ElMessage.success('提交订单成功！');
      // 重新加载活动列表，以更新活动状态
      await fetchMyActivities();
      // 清空选中项
      selectedActivityIds.value = [];
    } else {
      ElMessage.error(res.data.message || '提交订单失败');
    }
  } catch (err) {
    ElMessage.error('提交订单失败，请稍后再试');
  }
};

onMounted(() => {
  fetchMyActivities();
});
</script>

<template>
  <div class="page-container">
    <div class="page-card">
      <h2 class="card-title">我的活动</h2>

      <div v-if="activities.length > 0" class="cart-actions">
        <el-checkbox v-model="isAllSelected" class="select-all-checkbox">
          全选 (未结算)
        </el-checkbox>
        <el-button
            type="primary"
            :disabled="selectedActivityIds.length === 0"
            @click="handleSubmitOrder"
        >
          提交订单
        </el-button>
      </div>

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
              <el-checkbox-group v-model="selectedActivityIds">
                <el-checkbox
                    :value="activity.id"
                    :disabled="activity.registrationStatus === 'settled'"
                />
              </el-checkbox-group>

              <span class="activity-name">{{ activity.name }}</span>

              <div class="tags-container">
                <el-tag
                    :type="activity.registrationStatus === 'settled' ? 'success' : 'warning'"
                >
                  {{ activity.registrationStatus === 'settled' ? '已结算' : '未结算' }}
                </el-tag>
                <el-tag
                    :type="activity.status === '进行中' ? 'success' : (activity.status === '已结束' ? 'info' : 'warning')"
                    style="margin-left: 10px;"
                >
                  {{ activity.status }}
                </el-tag>
              </div>
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
                :disabled="activity.status === '已结束' || activity.registrationStatus === 'settled'"
                @click="handleCancelRegistration(getRegistrationId(activity.id)!, activity.id!, activity.name)"
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

.cart-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 0;
}

.select-all-checkbox {
  margin-right: 10px;
}

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
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.card-header .el-checkbox-group {
  flex-shrink: 0;
}

.activity-name {
  flex-grow: 1;
}

.tags-container {
  display: flex;
  align-items: center;
  gap: 10px;
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
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getOrders,
  payOrder,
  cancelOrder, // 👈 用于取消和删除订单
  OrderVO,
} from '@/api/order';

const router = useRouter();
const orders = ref<OrderVO[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchMyOrders = async () => {
  isLoading.value = true;
  error.value = null;
  const userId = sessionStorage.getItem('userId');

  if (!userId) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  try {
    const res = await getOrders(Number(userId));
    if (res.data.code === '200') {
      orders.value = res.data.data;
    } else {
      ElMessage.error(res.data.message);
      error.value = '获取订单列表失败';
    }
  } catch (err) {
    ElMessage.error('获取订单列表失败，请检查网络');
    error.value = '网络请求失败';
  } finally {
    isLoading.value = false;
  }
};

const handlePayOrder = async (orderId: number) => {
  try {
    await ElMessageBox.confirm(
        '确定要支付此订单吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success',
        }
    );

    const res = await payOrder(orderId);
    if (res.data.code === '200') {
      ElMessage.success('支付成功！');
      await fetchMyOrders(); // 刷新列表
    } else {
      ElMessage.error(res.data.message || '支付失败');
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('支付失败，请稍后再试');
    } else {
      ElMessage.info('已取消操作');
    }
  }
};

const handleCancelOrder = async (orderId: number) => {
  try {
    await ElMessageBox.confirm(
        '确定要取消此订单吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    );

    const res = await cancelOrder(orderId);
    if (res.data.code === '200') {
      ElMessage.success('取消订单成功！');
      await fetchMyOrders(); // 刷新列表
    } else {
      ElMessage.error(res.data.message || '取消订单失败');
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('取消订单失败，请稍后再试');
    } else {
      ElMessage.info('已取消操作');
    }
  }
};

// 👈 新增：处理删除已支付订单的方法
const handleDeleteOrder = async (orderId: number) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除此已支付订单吗？删除后将无法恢复。',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error',
        }
    );

    // 使用同一个取消订单的API，因为后端DELETE请求通常用于删除资源
    const res = await cancelOrder(orderId);
    if (res.data.code === '200') {
      ElMessage.success('订单删除成功！');
      await fetchMyOrders(); // 刷新列表
    } else {
      ElMessage.error(res.data.message || '订单删除失败');
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('订单删除失败，请稍后再试');
    } else {
      ElMessage.info('已取消操作');
    }
  }
};

onMounted(() => {
  fetchMyOrders();
});
</script>

<template>
  <div class="page-container">
    <div class="page-card">
      <h2 class="card-title">我的订单</h2>

      <div v-if="isLoading" class="loading">
        <el-skeleton animated />
      </div>
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-else-if="orders.length > 0">
        <el-table :data="orders" style="width: 100%" class="order-table">
          <el-table-column prop="id" label="订单号" width="100" />
          <el-table-column prop="amount" label="订单金额" width="120" />
          <el-table-column label="支付状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.paymentStatus === 'completed' ? 'success' : 'warning'">
                {{ row.paymentStatus === 'completed' ? '已支付' : '待支付' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <template v-if="row.paymentStatus === 'pending'">
                <el-button
                    type="primary"
                    size="small"
                    @click="handlePayOrder(row.id!)"
                >
                  支付订单
                </el-button>
                <el-button
                    type="danger"
                    size="small"
                    @click="handleCancelOrder(row.id!)"
                >
                  取消订单
                </el-button>
              </template>
              <template v-else-if="row.paymentStatus === 'completed'">
                <el-button
                    type="danger"
                    size="small"
                    @click="handleDeleteOrder(row.id!)"
                >
                  删除订单
                </el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-else class="no-data-message">
        <el-empty description="您还没有任何订单" />
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

.card-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  color: #333;
  font-weight: 600;
}

.order-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.loading,
.error-message,
.no-data-message {
  text-align: center;
  padding: 50px;
  color: #909399;
}
</style>
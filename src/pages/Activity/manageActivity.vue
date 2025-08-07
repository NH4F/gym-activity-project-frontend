<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  searchActivities,
  ActivityVO,
} from '@/api/activity';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import {
  Plus,
  Search,
  Edit,
  Delete,
} from '@element-plus/icons-vue';

const activities = ref<ActivityVO[]>([]);
const isLoading = ref(true);
const searchKeyword = ref('');
const dialogVisible = ref(false);
const isEdit = ref(false);
const formTitle = ref('');
const formRef = ref<FormInstance>();
const form = ref<ActivityVO>({
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  status: '未开始',
  location: '',
  price: '',
  capacity: 0,
});

// 表单验证规则
const rules = ref<FormRules>({
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  price: [{ required: true, message: '请输入活动价格', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入活动容量', trigger: 'blur', type: 'number' }],
});

// 新增的日期时间格式化函数
const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) {
    return '';
  }
  const date = new Date(dateTimeString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  return date.toLocaleString(undefined, options);
};

const fetchActivities = async () => {
  isLoading.value = true;
  try {
    const res = await getActivities();
    if (res.data.code === '200') {
      activities.value = res.data.data;
    } else {
      ElMessage.error(res.data.message);
    }
  } catch (error) {
    ElMessage.error('获取活动列表失败');
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = async () => {
  if (!searchKeyword.value) {
    fetchActivities();
    return;
  }
  isLoading.value = true;
  try {
    const res = await searchActivities(searchKeyword.value);
    if (res.data.code === '200') {
      activities.value = res.data.data;
    } else {
      ElMessage.warning(res.data.message);
      activities.value = [];
    }
  } catch (error) {
    ElMessage.error('搜索活动失败');
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    status: '未开始',
    location: '',
    price: '',
    capacity: 0,
  };
  formRef.value?.resetFields();
};

const handleCreate = () => {
  isEdit.value = false;
  formTitle.value = '新增活动';
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: ActivityVO) => {
  isEdit.value = true;
  formTitle.value = '编辑活动';
  form.value = {
    ...row,
    startTime: row.startTime ? new Date(row.startTime).toISOString().slice(0, 16) : '',
    endTime: row.endTime ? new Date(row.endTime).toISOString().slice(0, 16) : '',
  };
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  formRef.value.validate(async (valid) => {
    if (valid) {
      if (!form.value.startTime || !form.value.endTime) {
        ElMessage.warning('开始时间和结束时间不能为空，请检查表单');
        return;
      }

      try {
        const activityToSend = {
          ...form.value,
          startTime: form.value.startTime + ':00Z',
          endTime: form.value.endTime + ':00Z',
        };

        let res;
        if (isEdit.value) {
          res = await updateActivity(activityToSend);
        } else {
          res = await createActivity(activityToSend);
        }

        if (res.data.code === '200') {
          ElMessage.success(`${formTitle.value}成功`);
          dialogVisible.value = false;
          fetchActivities();
        } else {
          ElMessage.error(res.data.message);
        }
      } catch (error) {
        ElMessage.error(`${formTitle.value}失败`);
      }
    } else {
      ElMessage.warning('请填写所有必填字段');
      return false;
    }
  });
};

const handleDelete = async (row: ActivityVO) => {
  ElMessageBox.confirm(
      `确定要删除活动 "${row.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  )
      .then(async () => {
        try {
          const res = await deleteActivity(row.id as number);
          if (res.data.code === '200') {
            ElMessage.success('删除成功');
            fetchActivities();
          } else {
            ElMessage.error(res.data.message);
          }
        } catch (error) {
          ElMessage.error('删除失败');
        }
      })
      .catch(() => {
        ElMessage.info('已取消删除');
      });
};

onMounted(() => {
  fetchActivities();
});
</script>

<template>
  <div class="page-container">
    <div class="page-card">
      <h2 class="card-title">活动管理</h2>
      <div class="header-actions">
        <el-input
            v-model="searchKeyword"
            placeholder="请输入活动名称或描述"
            class="search-input"
            @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          新增活动
        </el-button>
      </div>

      <el-table
          :data="activities"
          v-loading="isLoading"
          style="width: 100%"
          class="activity-table"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="活动名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="开始时间" width="180">
          <template #default="{ row }">
            <span>{{ formatDateTime(row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="180">
          <template #default="{ row }">
            <span>{{ formatDateTime(row.endTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="location" label="地点" />
        <el-table-column prop="price" label="价格" width="100" />
        <el-table-column prop="capacity" label="容量" width="100" />
        <el-table-column prop="currentParticipants" label="参与人数" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" :icon="Delete" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="dialogVisible" :title="formTitle" width="500">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
          <el-form-item label="活动名称" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" />
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-input v-model="form.startTime" type="datetime-local" />
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-input v-model="form.endTime" type="datetime-local" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择活动状态">
              <el-option label="未开始" value="未开始" />
              <el-option label="进行中" value="进行中" />
              <el-option label="已结束" value="已结束" />
            </el-select>
          </el-form-item>
          <el-form-item label="地点" prop="location">
            <el-input v-model="form.location" />
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input v-model="form.price" />
          </el-form-item>
          <el-form-item label="容量" prop="capacity">
            <el-input-number v-model="form.capacity" :min="1" />
          </el-form-item>
        </el-form>
        <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="dialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="handleSubmit">
                            {{ formTitle }}
                        </el-button>
                    </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  /* 👈 更改：移除垂直居中，让内容可以从顶部开始填充 */
  /* align-items: center; */
  background-color: #f0f2f5;
  padding: 20px;
  margin-top: 60px;
}

.page-card {
  /* 👈 更改：卡片宽度和最大宽度设置为80% */
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

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.activity-table {
  box-shadow: none;
}

.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
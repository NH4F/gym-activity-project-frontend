<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getUser, updateUser, UserVO } from '@/api/user';

const router = useRouter();
const user = ref<UserVO | null>(null);
const userForm = ref<UserVO>({
  username: '',
  password: '',
  phoneNumber: '',
  role: '',
  balance: 0,
});
const isEditingInfo = ref(false);
const showPasswordChange = ref(false);
const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(true);
const error = ref<string | null>(null);

// 映射角色英文到中文
const roleMapping = {
  'admin': '管理员',
  'user': '普通用户'
};

const userRoleCn = computed(() => {
  if (user.value && user.value.role) {
    return roleMapping[user.value.role as keyof typeof roleMapping] || user.value.role;
  }
  return '未知';
});

// 获取用户信息
const fetchUser = async () => {
  const username = sessionStorage.getItem('username');
  if (!username) {
    await router.push('/login');
    return;
  }
  try {
    const res = await getUser(username);
    if (res.data.code === '200') {
      user.value = res.data.data;
      // 复制数据到表单
      userForm.value.username = res.data.data.username;
      userForm.value.phoneNumber = res.data.data.phoneNumber;
      userForm.value.role = res.data.data.role || 'user';
    } else {
      error.value = res.data.message;
    }
  } catch (err) {
    console.error(err);
    error.value = '获取用户信息失败';
  } finally {
    isLoading.value = false;
  }
};

// 提交修改基本信息
const handleUpdateUserInfo = async () => {
  try {
    const updatedUser: UserVO = {
      id: user.value?.id,
      username: userForm.value.username, // 👈 修改：使用表单中的用户名
      phoneNumber: userForm.value.phoneNumber,
      role: user.value?.role, // 角色依然不能修改
      balance: user.value?.balance
    };

    const res = await updateUser(updatedUser);
    if (res.data.code === '200') {
      alert('个人信息修改成功');
      isEditingInfo.value = false;
      // 更新 sessionStorage 中的用户名
      sessionStorage.setItem('username', updatedUser.username);
      fetchUser(); // 重新加载用户信息
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    console.error('修改失败:', err);
    alert('修改失败，请稍后重试');
  }
};

// 提交修改密码
const handleUpdatePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('两次输入的密码不一致！');
    return;
  }

  try {
    const updatedUser: UserVO = {
      id: user.value?.id,
      username: user.value?.username as string,
      password: newPassword.value,
      phoneNumber: user.value?.phoneNumber as string,
      role: user.value?.role,
      balance: user.value?.balance
    };
    const res = await updateUser(updatedUser);
    if (res.data.code === '200') {
      alert('密码修改成功，请重新登录');
      handleLogout(); // 密码修改成功后强制用户重新登录
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    console.error('修改密码失败:', err);
    alert('修改密码失败，请稍后重试');
  }
};

// 登出功能
const handleLogout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('username');
  alert('已成功退出登录');
  router.push('/login');
};

onMounted(() => {
  fetchUser();
});
</script>

<template>
  <div class="user-profile-container">
    <div class="user-profile-card">
      <h2 class="card-title">个人信息</h2>
      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="user" class="user-info">
        <form @submit.prevent="handleUpdateUserInfo">
          <div class="info-item">
            <label class="label" for="username">用户名:</label>
            <input
                v-if="isEditingInfo"
                id="username"
                v-model="userForm.username"
                type="text"
                class="edit-input"
                required
            >
            <span v-else class="value">{{ user.username }}</span>
          </div>
          <div class="info-item">
            <label class="label" for="phoneNumber">手机号:</label>
            <input
                v-if="isEditingInfo"
                id="phoneNumber"
                v-model="userForm.phoneNumber"
                type="tel"
                class="edit-input"
                required
            >
            <span v-else class="value">{{ user.phoneNumber }}</span>
          </div>
          <div class="info-item">
            <span class="label">角色:</span>
            <span class="value">{{ userRoleCn }}</span>
          </div>
          <div class="info-item">
            <span class="label">余额:</span>
            <span class="value">¥{{ user.balance }}</span>
          </div>

          <div class="button-group">
            <button v-if="!isEditingInfo" @click="isEditingInfo = true" type="button" class="edit-button">编辑</button>
            <button v-else type="submit" class="save-button">保存</button>
            <button v-if="isEditingInfo" @click="isEditingInfo = false" type="button" class="cancel-button">取消</button>
          </div>
        </form>

        <div class="password-change-section">
          <button @click="showPasswordChange = !showPasswordChange" class="change-password-button">
            {{ showPasswordChange ? '取消修改密码' : '修改密码' }}
          </button>

          <form v-if="showPasswordChange" @submit.prevent="handleUpdatePassword" class="password-form">
            <div class="form-group">
              <label for="newPassword">新密码:</label>
              <input id="newPassword" v-model="newPassword" type="password" required>
            </div>
            <div class="form-group">
              <label for="confirmPassword">确认密码:</label>
              <input id="confirmPassword" v-model="confirmPassword" type="password" required>
            </div>
            <button type="submit" class="save-password-button">确认修改</button>
          </form>
        </div>

        <button @click="handleLogout" class="logout-button">退出登录</button>
      </div>
      <div v-else class="no-data-message">
        <p>未找到用户信息，请<router-link to="/login">重新登录</router-link>。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile-container {
  /* 使用绝对定位来填充整个视口 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  padding: 20px;
}

.user-profile-card {
  width: 100%;
  max-width: 500px;
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

.user-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}

.value {
  color: #333;
  text-align: right;
  word-break: break-all;
}

.edit-input {
  width: 60%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  text-align: right;
}

.button-group {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.edit-button, .save-button, .cancel-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.edit-button {
  background-color: #007bff;
  color: white;
}

.edit-button:hover {
  background-color: #0056b3;
}

.save-button {
  background-color: #28a745;
  color: white;
}

.save-button:hover {
  background-color: #218838;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}

.cancel-button:hover {
  background-color: #5a6268;
}

.logout-button {
  width: 100%;
  padding: 12px;
  margin-top: 30px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-button:hover {
  background-color: #c82333;
}

.password-change-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #ccc;
}

.change-password-button {
  width: 100%;
  padding: 12px;
  border: 1px solid #007bff;
  background-color: transparent;
  color: #007bff;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.change-password-button:hover {
  background-color: #007bff;
  color: white;
}

.password-form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.password-form .form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.password-form .form-group label {
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
}

.password-form .form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
}

.save-password-button {
  width: 100%;
  padding: 12px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-password-button:hover {
  background-color: #0056b3;
}
</style>
```
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register, UserVO } from '@/api/user';

const router = useRouter();

const form = ref<UserVO>({
  username: '',
  password: '',
  phoneNumber: '',
  role: 'user', // 默认角色为用户
  balance: 0, // 默认余额为0
});

const handleRegister = async () => {
  try {
    const res = await register(form.value);
    if (res.data.code === '200') {
      // Replaced alert with console.log for better handling in the Canvas environment
      console.log('注册成功，请登录');
      await router.push('/login');
    } else {
      console.log(res.data.message);
    }
  } catch (error) {
    console.error('注册失败:', error);
    console.log('注册失败，请稍后重试');
  }
};
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="card-title">用户注册</h2>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username">用户名:</label>
          <input type="text" id="username" v-model="form.username" required class="form-input">
        </div>
        <div class="form-group">
          <label for="password">密码:</label>
          <input type="password" id="password" v-model="form.password" required class="form-input">
        </div>
        <div class="form-group">
          <label for="phoneNumber">手机号:</label>
          <input type="tel" id="phoneNumber" v-model="form.phoneNumber" required class="form-input">
        </div>
        <div class="form-group">
          <label for="role">角色:</label>
          <select id="role" v-model="form.role" required class="form-select">
            <option value="user">用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <button type="submit" class="register-button">注册</button>
      </form>
      <div class="login-link">
        <p>已有账号？<router-link to="/login" class="login-text">去登录</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* A more robust way to ensure the container fills the entire viewport */
.register-container {
  /* Use absolute positioning to fill the entire viewport */
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

.register-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.register-card:hover {
  transform: translateY(-5px);
}

.card-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  color: #333;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

.form-select {
  /* This is to ensure the select element has the same height as the input */
  height: 48px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 32px;
  background-color: white;
}

.register-button {
  width: 100%;
  padding: 12px;
  border: none;
  background-color: #28a745;
  color: white;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.register-button:hover {
  background-color: #218838;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #777;
}

.login-link p {
  margin: 0;
}

.login-text {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.login-text:hover {
  text-decoration: underline;
  color: #0056b3;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {getUser, login} from '@/api/user';

const router = useRouter();

// reactive form data
const form = ref({
  username: '',
  password: '',
});

const handleLogin = async () => {
  try {
    const res = await login(form.value.username, form.value.password);
    if (res.data.code === '200') {
      sessionStorage.setItem('token', res.data.data);
      alert('登录成功');
      const resUser = await getUser(form.value.username);
      sessionStorage.setItem('role', resUser.data.data.role || '');
      sessionStorage.setItem('username', resUser.data.data.username || '');
      sessionStorage.setItem('userId', resUser.data.data.id.toString() || '');
      await router.push('/');
    } else {
      alert(res.data.message);
    }
  } catch (error) {
    console.error('登录失败:', error);
    alert('登录失败，请稍后重试');
  }
};

</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="card-title">用户登录</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名:</label>
          <input type="text" id="username" v-model="form.username" required class="form-input">
        </div>
        <div class="form-group">
          <label for="password">密码:</label>
          <input type="password" id="password" v-model="form.password" required class="form-input">
        </div>
        <button type="submit" class="login-button">登录</button>
      </form>
      <div class="register-link">
        <p>还没有账号？<router-link to="/register" class="register-text">去注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* A more robust way to ensure the container fills the entire viewport */
.login-container {
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

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.login-card:hover {
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

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

.login-button {
  width: 100%;
  padding: 12px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #0056b3;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #777;
}

.register-link p {
  margin: 0;
}

.register-text {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.register-text:hover {
  text-decoration: underline;
  color: #0056b3;
}
</style>

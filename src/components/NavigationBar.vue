<script setup>
import { computed } from "vue";
import { ElMenu, ElMenuItem } from "element-plus";
import { HomeFilled, ShoppingCartFull,Basketball, Management, UserFilled } from "@element-plus/icons-vue";

// 计算属性：检查用户是否为管理员
const isAdmin = computed(() => {
  // 假设用户角色存储在 sessionStorage 中
  return sessionStorage.getItem('role') === 'admin';
});
</script>

<template>
  <div class="nav-bar-container">
    <el-menu
        class="nav-bar"
        mode="horizontal"
        :router="true"
    >
      <el-menu-item index="/">
        <el-icon><HomeFilled /></el-icon>
        活动列表
      </el-menu-item>
      <el-menu-item v-if="isAdmin" index="/manageActivity">
        <el-icon><Management /></el-icon>
        活动管理
      </el-menu-item>
      <el-menu-item index="/myActivity">
        <el-icon><Basketball /></el-icon>
        我的活动
      </el-menu-item>
      <el-menu-item index="/order">
        <el-icon><ShoppingCartFull /></el-icon>
        历史订单
      </el-menu-item>
      <el-menu-item index="/user/profile">
        <el-icon><UserFilled /></el-icon>
        个人信息
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.nav-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 60px;
}

.nav-bar {
  display: inline-block;
  width: 100%;
  margin: 0 auto;
  height: 100%;
}
</style>
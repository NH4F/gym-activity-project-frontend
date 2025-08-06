<script setup>
import { ElMenu, ElMenuItem } from "element-plus";
import { HomeFilled, ShoppingCartFull, Management, UserFilled } from "@element-plus/icons-vue";
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
      <el-menu-item index="/cart">
        <el-icon><ShoppingCartFull /></el-icon>
        订单管理
      </el-menu-item>
      <el-menu-item index="/warehouse">
        <el-icon><Management /></el-icon>
        活动管理
      </el-menu-item>
      <el-menu-item index="/user/profile">
        <el-icon><UserFilled /></el-icon>
        个人中心
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

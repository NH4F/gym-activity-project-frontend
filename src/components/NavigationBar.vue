<script setup>
import { ElMenu, ElMenuItem } from "element-plus";
</script>

<template>
  <div class="nav-bar-container">
    <el-menu
        class="nav-bar"
        mode="horizontal"
        :router="true"
    >
      <el-menu-item index="/">活动列表</el-menu-item>
      <el-menu-item index="/cart">订单管理</el-menu-item>
      <el-menu-item index="/warehouse">活动管理</el-menu-item>
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

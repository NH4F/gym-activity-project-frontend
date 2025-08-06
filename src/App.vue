<template>
  <NavigationBar v-if="showNav"/>
  <router-view/>
</template>

<style>
</style>
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavigationBar from "@/components/NavigationBar.vue";

const route = useRoute();
const showNav = computed(() => route.meta.showNav ?? true);
</script>

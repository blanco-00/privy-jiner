<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "TasksManagement"
});
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">{{ $t("pageContent.tasksManagement") }}</h2>
    <p class="text-gray-500">{{ $t("pageContent.tasksManagementDesc") }}</p>
    <div class="mt-4 p-4 bg-white rounded-lg shadow">
      <p class="text-gray-600">{{ $t("pageContent.tasksManagementInDev") }}</p>
    </div>
  </div>
</template>

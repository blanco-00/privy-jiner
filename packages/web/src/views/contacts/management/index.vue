<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "ContactsManagement"
});
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">{{ $t("pageContent.contactsManagement") }}</h2>
    <p class="text-gray-500">{{ $t("pageContent.contactsManagementDesc") }}</p>
    <div class="mt-4 p-4 bg-white rounded-lg shadow">
      <p class="text-gray-600">{{ $t("pageContent.contactsManagementInDev") }}</p>
    </div>
  </div>
</template>

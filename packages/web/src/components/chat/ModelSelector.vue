<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { http } from "@/utils/http";

interface ModelOption {
  id: string;
  provider: string;
  name: string;
  model: string;
  enabled: boolean;
}

const props = defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const loading = ref(false);
const models = ref<ModelOption[]>([]);
const error = ref<string | null>(null);

const providerLogos: Record<string, string> = {
  openai: "🤖",
  claude: "🧠",
  zhipu: "📘",
  minimax: "⚡",
  gemini: "✨",
  custom: "🔧",
};

const selectedModelId = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const modelOptions = computed(() =>
  models.value
    .filter((m) => m.enabled)
    .map((m) => ({
      value: m.id,
      label: `${providerLogos[m.provider] || "📦"} ${m.name || m.model} (${m.provider})`,
    }))
);

const currentModelName = computed(() => {
  const model = models.value.find((m) => m.id === selectedModelId.value);
  if (!model) return "Select Model";
  return `${providerLogos[model.provider] || "📦"} ${model.name || model.model}`;
});

const fetchModels = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await http.request<{ models: ModelOption[] }>(
      "get",
      "/api/ai/models"
    );
    models.value = res.models || [];
    if (models.value.length > 0 && !selectedModelId.value) {
      selectedModelId.value = models.value[0].id;
    }
  } catch (err) {
    error.value = "Failed to load models";
    console.error("Failed to fetch models:", err);
  } finally {
    loading.value = false;
  }
};

const handleModelChange = (val: string) => {
  selectedModelId.value = val;
};

onMounted(() => {
  fetchModels();
});

defineExpose({
  fetchModels,
});
</script>

<template>
  <div class="model-selector">
    <el-select
      v-model="selectedModelId"
      placeholder="Select Model"
      :loading="loading"
      :disabled="loading || error !== null"
      size="small"
      class="w-full"
      @change="handleModelChange"
    >
      <el-option
        v-for="option in modelOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>

    <div v-if="error" class="mt-2">
      <el-button size="small" type="primary" link @click="fetchModels">
        Retry
      </el-button>
      <span class="text-xs text-gray-500 ml-1">or</span>
      <el-button
        size="small"
        type="primary"
        link
        @click="$router.push('/ai-config')"
      >
        Configure
      </el-button>
    </div>

    <div v-else-if="models.length === 0 && !loading" class="mt-2">
      <span class="text-xs text-gray-500">No models configured.</span>
      <el-button
        size="small"
        type="primary"
        link
        @click="$router.push('/ai-config')"
      >
        Configure
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.model-selector {
  min-width: 180px;
}
</style>

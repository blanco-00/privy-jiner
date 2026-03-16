<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { http } from "@/utils/http";

const { t } = useI18n();

defineOptions({
  name: "AiConfig"
});

interface AiConfig {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl: string;
}

const loading = ref(false);
const testing = ref(false);
const fetchingModels = ref(false);

const configForm = reactive<AiConfig>({
  provider: "openai",
  apiKey: "",
  model: "",
  baseUrl: "https://api.openai.com/v1"
});

const providers = [
  { label: t("aiConfigPage.providerOpenai"), value: "openai" },
  { label: t("aiConfigPage.providerClaude"), value: "claude" },
  { label: t("aiConfigPage.providerZhipu"), value: "zhipu" },
  { label: t("aiConfigPage.providerMiniMax"), value: "minimax" },
  { label: t("aiConfigPage.providerCustom"), value: "custom" }
];

const currentModels = ref<{ label: string; value: string }[]>([]);

const fetchModels = async () => {
  if (!configForm.apiKey || configForm.provider === "custom") {
    currentModels.value = [];
    return;
  }
  
  fetchingModels.value = true;
  try {
    const res = await http.request<{ code: number; models?: Array<{ id: string; name: string }>; error?: string }>(
      "post",
      "/api/ai/models",
      { data: { apiKey: configForm.apiKey, provider: configForm.provider, baseUrl: configForm.baseUrl } }
    );
    if (res.code === 0 && res.models) {
      currentModels.value = res.models.map(m => ({ label: m.name, value: m.id }));
      if (currentModels.value.length > 0 && !configForm.model) {
        configForm.model = currentModels.value[0].value;
      }
    } else if (res.error) {
      console.error("Failed to fetch models:", res.error);
    }
  } catch (error) {
    console.error("Failed to fetch models:", error);
  } finally {
    fetchingModels.value = false;
  }
};

const handleProviderChange = (provider: string) => {
  configForm.model = "";
  currentModels.value = [];
  
  if (provider === "openai") {
    configForm.baseUrl = "https://api.openai.com/v1";
  } else if (provider === "claude") {
    configForm.baseUrl = "https://api.anthropic.com/v1";
  } else if (provider === "zhipu") {
    configForm.baseUrl = "https://open.bigmodel.cn/api/paas/v4";
  } else if (provider === "minimax") {
    configForm.baseUrl = "https://api.minimax.chat/v1";
  } else if (provider === "custom") {
    configForm.baseUrl = "";
  }
};

const handleApiKeyChange = () => {
  if (configForm.apiKey && configForm.provider !== "custom") {
    fetchModels();
  }
};

const loadConfig = async () => {
  loading.value = true;
  try {
    const res = await http.request<{ code: number; data: AiConfig }>(
      "get",
      "/api/ai/config"
    );
    if (res.code === 0 && res.data) {
      Object.assign(configForm, res.data);
      handleProviderChange(configForm.provider);
      if (configForm.apiKey && configForm.provider !== "custom") {
        fetchModels();
      }
    }
  } catch (error) {
    console.error("Failed to load AI config:", error);
  } finally {
    loading.value = false;
  }
};

const saveConfig = async () => {
  if (!configForm.apiKey) {
    message(t("aiConfigPage.apiKeyRequired"), { type: "warning" });
    return;
  }
  
  loading.value = true;
  try {
    await http.request("post", "/api/ai/config", { data: configForm });
    message(t("aiConfigPage.saveSuccess"), { type: "success" });
    if (configForm.provider !== "custom") {
      fetchModels();
    }
  } catch (error) {
    message(t("aiConfigPage.saveFailed"), { type: "error" });
  } finally {
    loading.value = false;
  }
};

const testConnection = async () => {
  if (!configForm.apiKey) {
    message(t("aiConfigPage.apiKeyRequired"), { type: "warning" });
    return;
  }
  
  testing.value = true;
  try {
    const res = await http.request<{ code: number; message: string }>(
      "post",
      "/api/ai/test",
      { data: { apiKey: configForm.apiKey, provider: configForm.provider } }
    );
    if (res.code === 0) {
      message(t("aiConfigPage.testSuccess"), { type: "success" });
    } else {
      message(res.message || t("aiConfigPage.testFailed"), { type: "error" });
    }
  } catch (error) {
    message(t("aiConfigPage.testFailed"), { type: "error" });
  } finally {
    testing.value = false;
  }
};

onMounted(() => {
  loadConfig();
});
</script>

<template>
  <div class="ai-config-container p-6">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="text-lg font-medium">{{ t("aiConfigPage.title") }}</span>
        </div>
      </template>
      
      <el-form :model="configForm" label-width="120px">
        <el-form-item :label="t('aiConfigPage.provider')">
          <el-select
            v-model="configForm.provider"
            :placeholder="t('aiConfigPage.selectProvider')"
            @change="handleProviderChange"
          >
            <el-option
              v-for="item in providers"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="t('aiConfigPage.apiKey')">
          <el-input
            v-model="configForm.apiKey"
            type="password"
            show-password
            :placeholder="t('aiConfigPage.apiKeyPlaceholder')"
            @input="handleApiKeyChange"
          />
        </el-form-item>
        
        <el-form-item :label="t('aiConfigPage.model')">
          <el-select
            v-model="configForm.model"
            :placeholder="t('aiConfigPage.selectModel')"
            :loading="fetchingModels"
            :disabled="fetchingModels || configForm.provider === 'custom'"
          >
            <el-option
              v-for="item in currentModels"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item :label="t('aiConfigPage.baseUrl')" v-if="configForm.provider === 'custom'">
          <el-input
            v-model="configForm.baseUrl"
            :placeholder="t('aiConfigPage.baseUrlPlaceholder')"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="saveConfig"
          >
            {{ t("common.save") }}
          </el-button>
          <el-button
            :loading="testing"
            @click="testConnection"
          >
            {{ t("aiConfigPage.testConnection") }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span class="text-lg font-medium">{{ t("aiConfigPage.nluSettings") }}</span>
        </div>
      </template>
      
      <el-form label-width="120px">
        <el-form-item :label="t('aiConfigPage.nlEnabled')">
          <el-switch v-model="configForm.nlEnabled" />
        </el-form-item>
        
        <el-form-item :label="t('aiConfigPage.nlExamples')">
          <div class="text-sm text-gray-500">
            <p>{{ t("aiConfigPage.nlExample1") }}</p>
            <p>{{ t("aiConfigPage.nlExample2") }}</p>
            <p>{{ t("aiConfigPage.nlExample3") }}</p>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.ai-config-container {
  max-width: 800px;
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { http } from "@/utils/http";
import { ElMessageBox } from "element-plus";

const { t } = useI18n();

defineOptions({
  name: "AiConfig"
});

interface AiConfig {
  id?: string;
  provider: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  temperature?: number;
  maxTokens?: number;
  isActive?: boolean;
}

interface SavedConfig {
  id: string;
  provider: string;
  api_key: string;
  base_url: string;
  model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

const savedConfigs = ref<SavedConfig[]>([]);
const currentConfigId = ref<string | null>(null);

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

const loadSavedConfigs = async () => {
  try {
    const res = await http.request<{ code: number; data: SavedConfig[] }>(
      "get",
      "/api/ai/configs"
    );
    if (res.code === 0 && res.data) {
      savedConfigs.value = res.data;
    }
  } catch (error) {
    console.error("Failed to load saved configs:", error);
  }
};

const loadConfigById = async (id: string) => {
  const config = savedConfigs.value.find(c => c.id === id);
  if (config) {
    currentConfigId.value = id;
    configForm.provider = config.provider;
    configForm.apiKey = config.api_key;
    configForm.baseUrl = config.base_url;
    configForm.model = config.model;
    handleProviderChange(config.provider);
    if (config.api_key && config.provider !== "custom") {
      fetchModels();
    }
  }
};

const deleteConfig = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      t("aiConfigPage.confirmDelete"),
      t("common.warning"),
      { confirmButtonText: t("common.confirm"), cancelButtonText: t("common.cancel"), type: "warning" }
    );
    
    const res = await http.request<{ code: number }>(
      "delete",
      `/api/ai/configs/${id}`
    );
    if (res.code === 0) {
      message(t("aiConfigPage.deleteSuccess"), { type: "success" });
      await loadSavedConfigs();
      if (currentConfigId.value === id) {
        currentConfigId.value = null;
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      message(t("aiConfigPage.deleteFailed"), { type: "error" });
    }
  }
};

const saveAsNew = async () => {
  if (!configForm.apiKey) {
    message(t("aiConfigPage.apiKeyRequired"), { type: "warning" });
    return;
  }
  
  loading.value = true;
  try {
    const res = await http.request<{ code: number; data: { id: string } }>(
      "post",
      "/api/ai/config",
      { data: { ...configForm, isNew: true } }
    );
    if (res.code === 0) {
      message(t("aiConfigPage.saveAsNewSuccess"), { type: "success" });
      currentConfigId.value = res.data?.id || null;
      await loadSavedConfigs();
    }
  } catch (error) {
    message(t("aiConfigPage.saveFailed"), { type: "error" });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadConfig();
  loadSavedConfigs();
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
            :loading="loading"
            @click="saveAsNew"
          >
            {{ t("aiConfigPage.saveAsNew") }}
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

    <el-card class="mt-4" v-if="savedConfigs.length > 0">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="text-lg font-medium">{{ t("aiConfigPage.savedConfigs") }}</span>
        </div>
      </template>
      
      <el-table :data="savedConfigs" style="width: 100%">
        <el-table-column prop="provider" :label="t('aiConfigPage.provider')" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.provider }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="model" :label="t('aiConfigPage.model')" />
        <el-table-column prop="api_key" :label="t('aiConfigPage.apiKey')" width="150">
          <template #default="{ row }">
            {{ row.api_key ? '********' : '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('common.actions')" width="180" align="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click="loadConfigById(row.id)"
            >
              {{ t("common.load") }}
            </el-button>
            <el-button 
              type="danger" 
              link 
              size="small" 
              @click="deleteConfig(row.id)"
            >
              {{ t("common.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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

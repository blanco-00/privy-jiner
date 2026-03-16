<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "@/utils/message";
import { http } from "@/utils/http";
import { processNaturalLanguage } from "@/api/dashboard";
import ModelSelector from "@/components/chat/ModelSelector.vue";

const { t } = useI18n();

defineOptions({
  name: "AiChatChat"
});

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  isNLU?: boolean;
  toolResult?: any;
  modelName?: string;
}

const nlEnabled = ref(true);
const inputMessage = ref("");
const loading = ref(false);
const selectedModelId = ref<string>("");
const modelSelectorRef = ref<InstanceType<typeof ModelSelector> | null>(null);
const messages = reactive<ChatMessage[]>([
  {
    id: "1",
    role: "assistant",
    content: t("aiChat.welcomeMessage"),
    timestamp: Date.now(),
  },
]);

const chatContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  const text = inputMessage.value.trim();
  if (!text || loading.value) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    role: "user",
    content: text,
    timestamp: Date.now(),
  };
  messages.push(userMessage);
  inputMessage.value = "";
  loading.value = true;
  scrollToBottom();

  try {
    const isNaturalLanguage = nlEnabled.value && (
      text.includes("喝了") ||
      text.includes("喝") ||
      text.includes("水") ||
      text.includes("跑步") ||
      text.includes("运动") ||
      text.includes("分钟") ||
      text.includes("花了") ||
      text.includes("钱") ||
      text.includes("spent") ||
      text.includes("drank") ||
      text.includes("water") ||
      text.includes("exercise") ||
      text.includes("ran") ||
      text.includes("money")
    );

    if (isNaturalLanguage && nlEnabled.value) {
      const res = await processNaturalLanguage(text);

      if (res.success) {
        const nlResult: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: res.message,
          timestamp: Date.now(),
          isNLU: true,
          toolResult: res.result,
        };
        messages.push(nlResult);
      } else {
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("aiChat.fallbackMessage"),
        timestamp: Date.now(),
      };
        messages.push(fallbackMessage);
      }
    } else {
      const chatRes = await http.request<{ code: number; data: { response: string; modelName?: string } }>(
        "post",
        "/api/ai/chat",
        { data: { message: text, modelId: selectedModelId.value } }
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: chatRes.data?.response || t("aiChat.requestError"),
        timestamp: Date.now(),
        modelName: chatRes.data?.modelName,
      };
      messages.push(assistantMessage);
    }
  } catch (error) {
    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: t("aiChat.errorMessage"),
      timestamp: Date.now(),
    };
    messages.push(errorMessage);
  } finally {
    loading.value = false;
    scrollToBottom();
  }
};

const clearChat = () => {
  messages.splice(1);
  http.request("post", "/api/ai/chat/clear");
};

const formatTime = (timestamp: number) => {
  const locale = localStorage.getItem("responsive-locale") === "en" ? "en-US" : "zh-CN";
  return new Date(timestamp).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">{{ t("aiChat.title") }}</h2>
      <div class="flex items-center gap-4">
        <ModelSelector
          ref="modelSelectorRef"
          v-model="selectedModelId"
          class="w-48"
        />
        <el-switch
          v-model="nlEnabled"
          :active-text="t('aiConfigPage.nlEnabled')"
        />
        <el-button size="small" @click="clearChat">
          {{ t("aiChat.clear") }}
        </el-button>
      </div>
    </div>

    <el-card class="flex-1 flex flex-col" :body-style="{ flex: 1, overflow: 'hidden' }">
      <div ref="chatContainer" class="h-full overflow-y-auto p-4 space-y-4">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            :class="[
              'max-w-[70%] rounded-lg p-3',
              msg.role === 'user'
                ? 'bg-blue-500 text-white'
                : msg.isNLU
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-800'
            ]"
          >
            <div v-if="msg.isNLU" class="text-xs text-green-600 mb-1">
              🤖 {{ t("aiConfigPage.nluSettings") }}
            </div>
            <div class="whitespace-pre-wrap">{{ msg.content }}</div>
            <div
              :class="[
                'text-xs mt-1 flex items-center gap-2',
                msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'
              ]"
            >
              <span>{{ formatTime(msg.timestamp) }}</span>
              <span v-if="msg.role === 'assistant' && msg.modelName" class="text-xs opacity-70">
                · {{ msg.modelName }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="loading" class="flex justify-start">
          <div class="bg-gray-100 rounded-lg p-3">
            <span class="animate-pulse">{{ t("aiChat.thinking") }}</span>
          </div>
        </div>
      </div>

      <div class="border-t p-4">
        <div class="flex gap-2">
          <el-input
            v-model="inputMessage"
            :placeholder="nlEnabled ? t('aiChat.placeholder') : t('aiChat.placeholderDisabled')"
            @keyup.enter="sendMessage"
            :disabled="loading"
          />
          <el-button
            type="primary"
            :loading="loading"
            @click="sendMessage"
          >
            {{ t("aiChat.send") }}
          </el-button>
        </div>
        <div v-if="nlEnabled" class="mt-2 text-xs text-gray-500">
          💡 {{ t("aiChat.nluTip") }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
:deep(.el-card__body) {
  height: calc(100% - 60px);
  display: flex;
  flex-direction: column;
}
</style>

<script setup lang="ts">
import { ref, markRaw, onMounted, reactive, computed } from "vue";
import { $t } from "@/plugins/i18n";
import ReCol from "@/components/ReCol";
import { useDark, randomGradient } from "./utils";
import WelcomeTable from "./components/table/index.vue";
import { ReNormalCountTo } from "@/components/ReCountTo";
import { useRenderFlicker } from "@/components/ReFlicker";
import { ChartBar, ChartLine, ChartRound } from "./components/charts";
import Segmented, { type OptionsType } from "@/components/ReSegmented";
import { barChartData, progressData, latestNewsData } from "./data";
import { getWaterToday, getHealthSummary, getFinanceSummary } from "@/api/dashboard";
import WalletLine from "~icons/ri/wallet-3-line";
import DropLine from "~icons/ri/drop-line";
import TaskLine from "~icons/ri/task-line";
import HeartPulseLine from "~icons/ri/heart-pulse-line";

defineOptions({
  name: "Welcome"
});

const { isDark } = useDark();

let curWeek = ref(1);
const optionsBasis = computed<OptionsType[]>(() => [
  {
    label: $t("welcome.lastWeek")
  },
  {
    label: $t("welcome.thisWeek")
  }
]);

interface ChartItem {
  icon: any;
  bgColor: string;
  color: string;
  duration: number;
  name: string;
  value: number;
  unit: string;
  percent: string;
  data: number[];
}

const getChartData = (): ChartItem[] => [
  {
    icon: markRaw(WalletLine),
    bgColor: "#effaff",
    color: "#3b82f6",
    duration: 2200,
    name: $t("welcome.todayExpense"),
    value: 0,
    unit: $t("welcome.unitYuan"),
    percent: "0%",
    data: [0]
  },
  {
    icon: markRaw(DropLine),
    bgColor: "#eff8f4",
    color: "#06b6d4",
    duration: 1600,
    name: $t("welcome.waterIntake"),
    value: 0,
    unit: $t("welcome.unitCup"),
    percent: "0%",
    data: [0]
  },
  {
    icon: markRaw(TaskLine),
    bgColor: "#fef3c7",
    color: "#f59e0b",
    duration: 1500,
    name: $t("welcome.todoTasks"),
    value: 5,
    unit: $t("welcome.unitItem"),
    percent: "+25%",
    data: [8, 6, 7, 5, 4, 5, 6]
  },
  {
    icon: markRaw(HeartPulseLine),
    bgColor: "#fef2f2",
    color: "#ef4444",
    duration: 100,
    name: $t("welcome.healthScore"),
    value: 0,
    unit: $t("welcome.unitPoint"),
    percent: "0%",
    data: [0]
  }
];

const chartData = reactive<ChartItem[]>(getChartData());

const loadDashboardData = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const [waterRes, healthRes, financeRes] = await Promise.all([
      getWaterToday(),
      getHealthSummary(),
      getFinanceSummary(today, today)
    ]);

    if (waterRes.code === 0 && waterRes.data) {
      const waterCups = Math.round(waterRes.data.today / 250);
      chartData[1].value = waterCups;
      chartData[1].unit = $t("welcome.unitCup");
      chartData[1].percent = waterCups >= 8 ? "+100%" : `-${Math.round((1 - waterCups / 8) * 100)}%`;
    }

    if (healthRes.code === 0 && healthRes.data) {
      chartData[3].value = healthRes.data.healthScore || 85;
      chartData[3].unit = $t("welcome.unitPoint");
      chartData[3].percent = "+0%";
    }

    if (financeRes.code === 0 && financeRes.data) {
      chartData[0].value = Math.round(financeRes.data.totalExpense || 0);
      chartData[0].unit = $t("welcome.unitYuan");
      const income = financeRes.data.totalIncome || 0;
      const expense = financeRes.data.totalExpense || 0;
      const change = income > 0 ? ((income - expense) / income * 100).toFixed(0) : "0";
      chartData[0].percent = `${Number(change) >= 0 ? "+" : ""}${change}%`;
    }
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div>
    <el-row :gutter="24" justify="space-around">
      <re-col
        v-for="(item, index) in chartData"
        :key="index"
        v-motion
        class="mb-4.5"
        :value="6"
        :md="12"
        :sm="12"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 80 * (index + 1)
          }
        }"
      >
        <el-card class="line-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">
              {{ item.name }}
            </span>
            <div
              class="size-8 flex-c rounded-md"
              :style="{
                backgroundColor: isDark ? 'transparent' : item.bgColor
              }"
            >
              <IconifyIconOffline
                :icon="item.icon"
                :color="item.color"
                width="18"
                height="18"
              />
            </div>
          </div>
          <div class="flex justify-between items-start mt-3">
            <div class="w-1/2">
              <ReNormalCountTo
                :duration="item.duration"
                :fontSize="'1.6em'"
                :startVal="100"
                :endVal="item.value"
              />
              <p class="font-medium text-green-500">{{ item.percent }}</p>
            </div>
            <ChartLine
              v-if="item.data.length > 1"
              class="w-1/2!"
              :color="item.color"
              :data="item.data"
            />
            <ChartRound v-else class="w-1/2!" />
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-4.5"
        :value="18"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 400
          }
        }"
      >
        <el-card class="bar-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">{{ $t("welcome.analysisOverview") }}</span>
            <Segmented v-model="curWeek" :options="optionsBasis" />
          </div>
          <div class="flex justify-between items-start mt-3">
            <ChartBar
              :requireData="barChartData[curWeek].requireData"
              :questionData="barChartData[curWeek].questionData"
            />
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-4.5"
        :value="6"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 480
          }
        }"
      >
        <el-card shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">{{ $t("welcome.resolutionProbability") }}</span>
          </div>
          <div
            v-for="(item, index) in progressData"
            :key="index"
            :class="[
              'flex',
              'justify-between',
              'items-start',
              index === 0 ? 'mt-8' : 'mt-[2.15rem]'
            ]"
          >
            <el-progress
              :text-inside="true"
              :percentage="item.percentage"
              :stroke-width="21"
              :color="item.color"
              striped
              striped-flow
              :duration="item.duration"
            />
            <span class="text-nowrap ml-2 text-text_color_regular text-sm">
              {{ item.week }}
            </span>
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-4.5"
        :value="18"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 560
          }
        }"
      >
        <el-card shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">{{ $t("welcome.dataStatistics") }}</span>
          </div>
          <el-scrollbar max-height="504" class="mt-3">
            <WelcomeTable />
          </el-scrollbar>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-4.5"
        :value="6"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 640
          }
        }"
      >
        <el-card shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">{{ $t("welcome.latestNews") }}</span>
          </div>
          <el-scrollbar max-height="504" class="mt-3">
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in latestNewsData"
                :key="index"
                center
                placement="top"
                :icon="
                  markRaw(
                    useRenderFlicker({
                      background: randomGradient({
                        randomizeHue: true
                      })
                    })
                  )
                "
                :timestamp="item.date"
              >
                <p class="text-sm">
                  {-text_color_regular text{
                    $t("welcome.newIssues", { required: item.requiredNumber, resolved: item.resolveNumber })
                  }}
                </p>
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </el-card>
      </re-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  --el-card-border-color: none;

  /* 解决概率进度条宽度 */
  .el-progress--line {
    width: 85%;
  }

  /* 解决概率进度条字体大小 */
  .el-progress-bar__innerText {
    font-size: 15px;
  }

  /* 隐藏 el-scrollbar 滚动条 */
  .el-scrollbar__bar {
    display: none;
  }

  /* el-timeline 每一项上下、左右边距 */
  .el-timeline-item {
    margin: 0 6px;
  }
}

:deep(.el-timeline.is-start) {
  padding-left: 0;
}

.main-content {
  margin: 20px 20px 0 !important;
}
</style>

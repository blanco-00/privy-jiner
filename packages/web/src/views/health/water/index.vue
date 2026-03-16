<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";

import Water from "~icons/ri/cup-line";
import Add from "~icons/ri/add-circle-line";
import Refresh from "~icons/ep/refresh";

defineOptions({
  name: "HealthWater"
});

const WATER_GOAL_KEY = "water_daily_goal";
const DEFAULT_GOAL = 2000;

const loading = ref(false);
const todayTotal = ref(0);
const dailyGoal = ref(DEFAULT_GOAL);
const waterLogs = ref<Array<{ id: string; amount: number; date: string; created_at: string }>>([]);
const inputAmount = ref(250);

const progressPercent = computed(() => {
  if (dailyGoal.value <= 0) return 0;
  return Math.min(100, Math.round((todayTotal.value / dailyGoal.value) * 100));
});

const groupedLogs = computed(() => {
  const groups: Record<string, typeof waterLogs.value> = {};
  waterLogs.value.forEach(log => {
    const date = log.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
  });
  return groups;
});

const sortedDates = computed(() => {
  return Object.keys(groupedLogs.value).sort((a, b) => b.localeCompare(a));
});

function loadGoal() {
  const saved = localStorage.getItem(WATER_GOAL_KEY);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed > 0) {
      dailyGoal.value = parsed;
    }
  }
}

function saveGoal() {
  localStorage.setItem(WATER_GOAL_KEY, dailyGoal.value.toString());
  console.log("[WaterPage] Goal saved:", dailyGoal.value);
  ElMessage.success("Goal saved!");
}

async function fetchTodayWater() {
  try {
    console.log("[WaterPage] Fetching today's water data...");
    const res = await fetch("/api/health/water/today");
    const data = await res.json();
    todayTotal.value = data.today ?? 0;
    dailyGoal.value = data.goal ?? DEFAULT_GOAL;
    console.log("[WaterPage] Today's water:", todayTotal.value, "Goal:", dailyGoal.value);
  } catch (error) {
    console.error("[WaterPage] Error fetching today's water:", error);
  }
}

async function fetchWaterLogs() {
  try {
    console.log("[WaterPage] Fetching water logs...");
    const res = await fetch("/api/health/water");
    const data = await res.json();
    waterLogs.value = Array.isArray(data) ? data : [];
    console.log("[WaterPage] Water logs received:", waterLogs.value.length);
  } catch (error) {
    console.error("[WaterPage] Error fetching water logs:", error);
    waterLogs.value = [];
  }
}

async function addWater(amount: number) {
  if (amount <= 0 || isNaN(amount)) {
    ElMessage.warning("Please enter a valid amount");
    return;
  }

  loading.value = true;
  try {
    console.log("[WaterPage] Adding water:", amount, "ml");
    const res = await fetch("/api/health/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, date: new Date().toISOString().split("T")[0] })
    });

    if (res.ok) {
      const data = await res.json();
      console.log("[WaterPage] Water added successfully:", data);
      ElMessage.success(`Added ${amount}ml of water!`);
      await Promise.all([fetchTodayWater(), fetchWaterLogs()]);
    } else {
      console.error("[WaterPage] Failed to add water:", res.status);
      ElMessage.error("Failed to add water record");
    }
  } catch (error) {
    console.error("[WaterPage] Error adding water:", error);
    ElMessage.error("Failed to add water record");
  } finally {
    loading.value = false;
  }
}

function handleQuickAdd(amount: number) {
  addWater(amount);
}

function handleManualAdd() {
  addWater(inputAmount.value);
}

async function handleRefresh() {
  console.log("[WaterPage] Refreshing data...");
  await Promise.all([fetchTodayWater(), fetchWaterLogs()]);
  ElMessage.success("Data refreshed!");
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string): string {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return dateStr;
}

onMounted(() => {
  console.log("[WaterPage] Component mounted");
  loadGoal();
  fetchTodayWater();
  fetchWaterLogs();
});
</script>

<template>
  <div class="health-water-container">
    <div class="page-header">
      <h2 class="page-title">喝水记录</h2>
      <el-button type="primary" :icon="Refresh" :loading="loading" @click="handleRefresh">
        刷新
      </el-button>
    </div>
    <div class="water-content">
      <el-row :gutter="20">
        <el-col :span="24" :md="8">
          <div class="stats-card">
            <div class="stats-icon">
              <el-icon :size="40" color="#409EFF">
                <Water />
              </el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-label">今日饮水</div>
              <div class="stats-value">
                <span class="today-value">{{ todayTotal }}</span>
                <span class="unit">ml</span>
              </div>
              <div class="stats-goal">
                目标: {{ dailyGoal }}ml
              </div>
            </div>
            <el-progress
              :percentage="progressPercent"
              :color="'#409EFF'"
              :stroke-width="10"
              class="progress-bar"
            />
          </div>
        </el-col>

        <el-col :span="24" :md="16">
          <div class="add-card">
            <h3 class="card-title">快速添加</h3>
            <div class="quick-buttons">
              <el-button
                v-for="amount in [100, 250, 500]"
                :key="amount"
                type="primary"
                plain
                size="large"
                :loading="loading"
                @click="handleQuickAdd(amount)"
              >
                +{{ amount }}ml
              </el-button>
            </div>

            <el-divider />

            <h3 class="card-title">手动添加</h3>
            <div class="manual-add">
              <el-input-number
                v-model="inputAmount"
                :min="1"
                :max="5000"
                :step="50"
                size="large"
                class="amount-input"
              />
              <span class="unit-label">ml</span>
              <el-button
                type="primary"
                size="large"
                :icon="Add"
                :loading="loading"
                @click="handleManualAdd"
              >
                添加
              </el-button>
            </div>

            <el-divider />

            <h3 class="card-title">设置每日目标</h3>
            <div class="goal-setting">
              <el-input-number
                v-model="dailyGoal"
                :min="500"
                :max="5000"
                :step="100"
                size="default"
                class="goal-input"
              />
              <span class="unit-label">ml/天</span>
              <el-button type="success" @click="saveGoal">
                保存目标
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="records-section">
        <h3 class="section-title">喝水记录</h3>
        
        <div v-if="sortedDates.length === 0" class="empty-state">
          <el-empty description="暂无喝水记录" />
        </div>

        <div v-else class="records-list">
          <div v-for="date in sortedDates" :key="date" class="date-group">
            <div class="date-header">
              <span class="date-label">{{ formatDate(date) }}</span>
              <span class="date-total">
                {{ groupedLogs[date].reduce((sum, log) => sum + log.amount, 0) }}ml
              </span>
            </div>
            <div class="log-items">
              <div
                v-for="log in groupedLogs[date]"
                :key="log.id"
                class="log-item"
              >
                <span class="log-amount">{{ log.amount }}ml</span>
                <span class="log-time">{{ formatTime(log.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.health-water-container {
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.water-content {
  margin-top: 20px;
}

.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  pointer-events: none;
}

.stats-icon {
  margin-bottom: 16px;
}

.stats-info {
  margin-bottom: 20px;
}

.stats-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.stats-value {
  display: flex;
  align-items: baseline;
}

.today-value {
  font-size: 48px;
  font-weight: bold;
}

.unit {
  font-size: 18px;
  margin-left: 8px;
  opacity: 0.8;
}

.stats-goal {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 8px;
}

.progress-bar {
  margin-top: 16px;
}

.add-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.quick-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.manual-add,
.goal-setting {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount-input,
.goal-input {
  width: 150px;
}

.unit-label {
  color: #606266;
  font-size: 14px;
}

.records-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.empty-state {
  padding: 40px 0;
}

.date-group {
  margin-bottom: 20px;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.date-label {
  font-weight: 600;
  color: #303133;
}

.date-total {
  color: #409EFF;
  font-weight: 600;
}

.log-items {
  padding-left: 12px;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.log-item:last-child {
  border-bottom: none;
}

.log-amount {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.log-time {
  color: #909399;
  font-size: 14px;
}
</style>

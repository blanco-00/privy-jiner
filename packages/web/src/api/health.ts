import { http } from "@/utils/http";

export interface WaterLog {
  id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface WaterToday {
  today: number;
  goal: number;
}

export interface HealthSummary {
  water: {
    today: number;
    goal: number;
  };
  exercise: {
    duration: number;
    calories: number;
    steps: number;
  };
}

/**
 * 获取今日喝水总量
 */
export const getWaterToday = () => {
  console.log("[WaterPage API] Fetching today's water data...");
  return http.request<{ code: number; data: WaterToday }>(
    "get",
    "/api/health/water/today"
  );
};

/**
 * 获取喝水记录列表
 */
export const getWaterLogs = (date?: string) => {
  console.log("[WaterPage API] Fetching water logs...", { date });
  return http.request<{ code: number; data: WaterLog[] }>("get", "/api/health/water", {
    params: { date }
  });
};

/**
 * 添加喝水记录
 */
export const addWaterLog = (amount: number, date?: string) => {
  console.log("[WaterPage API] Adding water log...", { amount, date });
  return http.request<{ code: number; data: WaterLog }>("post", "/api/health/water", {
    data: { amount, date }
  });
};

/**
 * 获取健康摘要
 */
export const getHealthSummary = () => {
  console.log("[WaterPage API] Fetching health summary...");
  return http.request<{ code: number; data: HealthSummary }>("get", "/api/health/summary");
};

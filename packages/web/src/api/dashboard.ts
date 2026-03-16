import { http } from "@/utils/http";

export interface WaterToday {
  today: number;
  goal: number;
}

export interface HealthSummary {
  todayWater: number;
  waterGoal: number;
  todayExercise: number;
  exerciseGoal: number;
  healthScore: number;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  budgetUsed: number;
}

export interface NLUResponse {
  success: boolean;
  message: string;
  tool?: string;
  result?: any;
  originalMessage?: string;
}

export const getWaterToday = () => {
  return http.request<{ code: number; data: WaterToday }>(
    "get",
    "/api/health/water/today"
  );
};

export const getHealthSummary = () => {
  return http.request<{ code: number; data: HealthSummary }>(
    "get",
    "/api/health/summary"
  );
};

export const getFinanceSummary = (startDate?: string, endDate?: string) => {
  return http.request<{ code: number; data: FinanceSummary }>("get", "/api/finance/summary", {
    params: { startDate, endDate }
  });
};

export const getTodayExpense = () => {
  const today = new Date().toISOString().split("T")[0];
  return http.request<{ code: number; data: any[] }>("get", "/api/finance/transactions", {
    params: { startDate: today, endDate: today, type: "expense" }
  });
};

export const processNaturalLanguage = (message: string) => {
  return http.request<{ code: number } & NLUResponse>("post", "/api/ai/nlu", {
    data: { message }
  });
};

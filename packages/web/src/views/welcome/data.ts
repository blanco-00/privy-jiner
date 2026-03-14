import { dayjs, cloneDeep, getRandomIntBetween } from "./utils";
import WalletLine from "~icons/ri/wallet-3-line";
import DropLine from "~icons/ri/drop-line";
import TaskLine from "~icons/ri/task-line";
import HeartPulseLine from "~icons/ri/heart-pulse-line";

const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const chartData = [
  {
    icon: WalletLine,
    bgColor: "#effaff",
    color: "#3b82f6",
    duration: 2200,
    name: "今日支出",
    value: 328,
    unit: "元",
    percent: "-12%",
    data: [210, 188, 239, 162, 252, 308, 275]
  },
  {
    icon: DropLine,
    bgColor: "#eff8f4",
    color: "#06b6d4",
    duration: 1600,
    name: "喝水记录",
    value: 6,
    unit: "杯",
    percent: "+20%",
    data: [5, 4, 6, 7, 5, 6, 8]
  },
  {
    icon: TaskLine,
    bgColor: "#fef3c7",
    color: "#f59e0b",
    duration: 1500,
    name: "待办任务",
    value: 5,
    unit: "项",
    percent: "+25%",
    data: [8, 6, 7, 5, 4, 5, 6]
  },
  {
    icon: HeartPulseLine,
    bgColor: "#fef2f2",
    color: "#ef4444",
    duration: 100,
    name: "健康指数",
    value: 85,
    unit: "分",
    percent: "+5%",
    data: [82, 80, 83, 85, 84, 86, 85]
  }
];

/** 分析概览 */
const barChartData = [
  {
    requireData: [2101, 5288, 4239, 4962, 6752, 5208, 7450],
    questionData: [2216, 1148, 1255, 1788, 4821, 1973, 4379]
  },
  {
    requireData: [2101, 3280, 4400, 4962, 5752, 6889, 7600],
    questionData: [2116, 3148, 3255, 3788, 4821, 4970, 5390]
  }
];

/** 解决概率 */
const progressData = [
  {
    week: "周一",
    percentage: 85,
    duration: 110,
    color: "#41b6ff"
  },
  {
    week: "周二",
    percentage: 86,
    duration: 105,
    color: "#41b6ff"
  },
  {
    week: "周三",
    percentage: 88,
    duration: 100,
    color: "#41b6ff"
  },
  {
    week: "周四",
    percentage: 89,
    duration: 95,
    color: "#41b6ff"
  },
  {
    week: "周五",
    percentage: 94,
    duration: 90,
    color: "#26ce83"
  },
  {
    week: "周六",
    percentage: 96,
    duration: 85,
    color: "#26ce83"
  },
  {
    week: "周日",
    percentage: 100,
    duration: 80,
    color: "#26ce83"
  }
].reverse();

/** 数据统计 */
const tableData = Array.from({ length: 30 }).map((_, index) => {
  return {
    id: index + 1,
    requiredNumber: getRandomIntBetween(13500, 19999),
    questionNumber: getRandomIntBetween(12600, 16999),
    resolveNumber: getRandomIntBetween(13500, 17999),
    satisfaction: getRandomIntBetween(95, 100),
    date: dayjs().subtract(index, "day").format("YYYY-MM-DD")
  };
});

/** 最新动态 */
const latestNewsData = cloneDeep(tableData)
  .slice(0, 14)
  .map((item, index) => {
    return Object.assign(item, {
      date: `${dayjs().subtract(index, "day").format("YYYY-MM-DD")} ${
        days[dayjs().subtract(index, "day").day()]
      }`
    });
  });

export { chartData, barChartData, progressData, tableData, latestNewsData };

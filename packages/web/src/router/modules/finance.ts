import { $t } from "@/plugins/i18n";
import { finance } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/finance",
  name: "Finance",
  component: Layout,
  redirect: "/finance/records",
  meta: {
    icon: "ri/money-cny-circle-line",
    title: $t("menus.finance"),
    rank: finance
  },
  children: [
    {
      path: "/finance/records",
      name: "FinanceRecords",
      component: () => import("@/views/finance/records/index.vue"),
      meta: {
        title: $t("menus.financeRecords")
      }
    },
    {
      path: "/finance/budget",
      name: "FinanceBudget",
      component: () => import("@/views/finance/budget/index.vue"),
      meta: {
        title: $t("menus.financeBudget")
      }
    },
    {
      path: "/finance/investments",
      name: "FinanceInvestments",
      component: () => import("@/views/finance/investments/index.vue"),
      meta: {
        title: $t("menus.financeInvestments")
      }
    }
  ]
} satisfies RouteConfigsTable;

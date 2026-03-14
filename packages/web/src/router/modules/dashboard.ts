import { $t } from "@/plugins/i18n";
import { dashboard } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/dashboard",
  name: "Dashboard",
  component: Layout,
  redirect: "/dashboard/overview",
  meta: {
    icon: "ri/dashboard-line",
    title: $t("menus.dashboard"),
    rank: dashboard
  },
  children: [
    {
      path: "/dashboard/overview",
      name: "DashboardOverview",
      component: () => import("@/views/dashboard/overview/index.vue"),
      meta: {
        title: $t("menus.dashboardOverview")
      }
    },
    {
      path: "/dashboard/shortcuts",
      name: "DashboardShortcuts",
      component: () => import("@/views/dashboard/shortcuts/index.vue"),
      meta: {
        title: $t("menus.dashboardShortcuts")
      }
    }
  ]
} satisfies RouteConfigsTable;

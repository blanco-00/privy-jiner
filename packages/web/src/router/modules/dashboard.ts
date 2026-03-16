import { $t } from "@/plugins/i18n";
import { dashboard } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/dashboard",
  name: "Dashboard",
  component: Layout,
  redirect: "/welcome",
  meta: {
    icon: "ri/dashboard-line",
    title: $t("menus.dashboard"),
    rank: dashboard
  }
} satisfies RouteConfigsTable;

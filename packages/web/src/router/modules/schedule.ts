import { $t } from "@/plugins/i18n";
import { schedule } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/schedule",
  name: "Schedule",
  component: Layout,
  redirect: "/schedule/management",
  meta: {
    icon: "ri/calendar-line",
    title: $t("menus.schedule"),
    rank: schedule
  },
  children: [
    {
      path: "/schedule/management",
      name: "ScheduleManagement",
      component: () => import("@/views/schedule/management/index.vue"),
      meta: {
        title: $t("menus.scheduleManagement")
      }
    }
  ]
} satisfies RouteConfigsTable;

import { $t } from "@/plugins/i18n";
import { health } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/health",
  name: "Health",
  component: Layout,
  redirect: "/health/water",
  meta: {
    icon: "ri/heart-pulse-line",
    title: $t("menus.health"),
    rank: health
  },
  children: [
    {
      path: "/health/water",
      name: "HealthWater",
      component: () => import("@/views/health/water/index.vue"),
      meta: {
        title: $t("menus.healthWater")
      }
    },
    {
      path: "/health/exercise",
      name: "HealthExercise",
      component: () => import("@/views/health/exercise/index.vue"),
      meta: {
        title: $t("menus.healthExercise")
      }
    },
    {
      path: "/health/goals",
      name: "HealthGoals",
      component: () => import("@/views/health/goals/index.vue"),
      meta: {
        title: $t("menus.healthGoals")
      }
    }
  ]
} satisfies RouteConfigsTable;

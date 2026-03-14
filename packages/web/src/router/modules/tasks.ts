import { $t } from "@/plugins/i18n";
import { tasks } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/tasks",
  name: "Tasks",
  component: Layout,
  redirect: "/tasks/management",
  meta: {
    icon: "ri/task-line",
    title: $t("menus.tasks"),
    rank: tasks
  },
  children: [
    {
      path: "/tasks/management",
      name: "TasksManagement",
      component: () => import("@/views/tasks/management/index.vue"),
      meta: {
        title: $t("menus.tasksManagement")
      }
    }
  ]
} satisfies RouteConfigsTable;

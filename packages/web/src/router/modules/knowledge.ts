import { $t } from "@/plugins/i18n";
import { knowledge } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/knowledge",
  name: "Knowledge",
  component: Layout,
  redirect: "/knowledge/daily",
  meta: {
    icon: "ri/lightbulb-line",
    title: $t("menus.knowledge"),
    rank: knowledge
  },
  children: [
    {
      path: "/knowledge/daily",
      name: "KnowledgeDaily",
      component: () => import("@/views/knowledge/daily/index.vue"),
      meta: {
        title: $t("menus.knowledgeDaily")
      }
    }
  ]
} satisfies RouteConfigsTable;

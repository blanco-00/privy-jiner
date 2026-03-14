import { $t } from "@/plugins/i18n";
import { news } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/news",
  name: "News",
  component: Layout,
  redirect: "/news/aggregate",
  meta: {
    icon: "ri/newspaper-line",
    title: $t("menus.news"),
    rank: news
  },
  children: [
    {
      path: "/news/aggregate",
      name: "NewsAggregate",
      component: () => import("@/views/news/aggregate/index.vue"),
      meta: {
        title: $t("menus.newsAggregate")
      }
    },
    {
      path: "/news/recommendations",
      name: "NewsRecommendations",
      component: () => import("@/views/news/recommendations/index.vue"),
      meta: {
        title: $t("menus.newsRecommendations")
      }
    }
  ]
} satisfies RouteConfigsTable;

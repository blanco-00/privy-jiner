import { $t } from "@/plugins/i18n";
import { aiChat } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/ai-chat",
  name: "AiChat",
  component: Layout,
  redirect: "/ai-chat/chat",
  meta: {
    icon: "ri/robot-line",
    title: $t("menus.aiChat"),
    rank: aiChat
  },
  children: [
    {
      path: "/ai-chat/chat",
      name: "AiChatChat",
      component: () => import("@/views/ai-chat/chat/index.vue"),
      meta: {
        title: $t("menus.aiChatChat")
      }
    }
  ]
} satisfies RouteConfigsTable;

import { $t } from "@/plugins/i18n";
import { settings } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/settings",
  name: "Settings",
  component: Layout,
  redirect: "/settings/profile",
  meta: {
    icon: "ri/settings-line",
    title: $t("menus.settings"),
    rank: settings
  },
  children: [
    {
      path: "/settings/profile",
      name: "SettingsProfile",
      component: () => import("@/views/settings/profile/index.vue"),
      meta: {
        title: $t("menus.settingsProfile")
      }
    },
    {
      path: "/settings/security",
      name: "SettingsSecurity",
      component: () => import("@/views/settings/security/index.vue"),
      meta: {
        title: $t("menus.settingsSecurity")
      }
    },
    {
      path: "/settings/notifications",
      name: "SettingsNotifications",
      component: () => import("@/views/settings/notifications/index.vue"),
      meta: {
        title: $t("menus.settingsNotifications")
      }
    }
  ]
} satisfies RouteConfigsTable;

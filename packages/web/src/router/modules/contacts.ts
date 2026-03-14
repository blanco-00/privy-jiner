import { $t } from "@/plugins/i18n";
import { contacts } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/contacts",
  name: "Contacts",
  component: Layout,
  redirect: "/contacts/management",
  meta: {
    icon: "ri/contacts-line",
    title: $t("menus.contacts"),
    rank: contacts
  },
  children: [
    {
      path: "/contacts/management",
      name: "ContactsManagement",
      component: () => import("@/views/contacts/management/index.vue"),
      meta: {
        title: $t("menus.contactsManagement")
      }
    }
  ]
} satisfies RouteConfigsTable;

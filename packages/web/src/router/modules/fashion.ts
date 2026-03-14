import { $t } from "@/plugins/i18n";
import { fashion } from "@/router/enums";

const Layout = () => import("@/layout/index.vue");

export default {
  path: "/fashion",
  name: "Fashion",
  component: Layout,
  redirect: "/fashion/wardrobe",
  meta: {
    icon: "ri/t-shirt-line",
    title: $t("menus.fashion"),
    rank: fashion
  },
  children: [
    {
      path: "/fashion/wardrobe",
      name: "FashionWardrobe",
      component: () => import("@/views/fashion/wardrobe/index.vue"),
      meta: {
        title: $t("menus.fashionWardrobe")
      }
    },
    {
      path: "/fashion/outfits",
      name: "FashionOutfits",
      component: () => import("@/views/fashion/outfits/index.vue"),
      meta: {
        title: $t("menus.fashionOutfits")
      }
    }
  ]
} satisfies RouteConfigsTable;

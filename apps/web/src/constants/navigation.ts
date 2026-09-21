import { APPS, appPath } from "@/constants/apps";

export interface MenuItem {
  label: string;
  href: string;
}

export interface MenuGroup {
  /** Rendered as an inert directory label; index pages stay unlinked on purpose. */
  label: string;
  items: MenuItem[];
  requiresAuth?: boolean;
  drawerOnly?: boolean;
}

const MENU_GROUPS: MenuGroup[] = [
  {
    label: "/about",
    items: [
      { label: "me", href: "/about/me" },
      { label: "experience", href: "/about/experience" },
    ],
  },
  {
    label: "/apps",
    items: APPS.map((app) => ({ label: app.slug, href: appPath(app.slug) })),
  },
  {
    label: "/tools",
    items: [{ label: "resources", href: "/tools/resources" }],
    requiresAuth: true,
    drawerOnly: true,
  },
];

export function getMenuGroups(options: {
  surface: "landing" | "drawer";
  signedIn: boolean;
}): MenuGroup[] {
  return MENU_GROUPS.filter(
    (group) =>
      (!group.drawerOnly || options.surface === "drawer") &&
      (!group.requiresAuth || options.signedIn)
  );
}

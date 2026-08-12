export interface SiteNavItem {
  href: string;
  label: string;
  code: string;
}

export interface SiteNavGroup {
  label: string;
  code: string;
  items: readonly SiteNavItem[];
}

/**
 * One information architecture for every navigation surface.
 * Header, mobile menu and footer must render this structure directly.
 */
export const SITE_NAV_GROUPS = [
  {
    label: "INVESTIGATION",
    code: "I",
    items: [
      { href: "/part-i", label: "OVERVIEW", code: "I" },
      { href: "/analysis", label: "ANALYSIS", code: "·" },
      { href: "/forensics", label: "DOSSIER", code: "⊛" },
      { href: "/control", label: "CONTROL", code: "⊞" },
    ],
  },
  {
    label: "BATTLEFIELD",
    code: "II",
    items: [
      { href: "/battlefield", label: "SCORECARD", code: "II" },
      { href: "/map", label: "MAP", code: "·" },
      { href: "/vision-model", label: "VISION MODEL", code: "CV" },
    ],
  },
  {
    label: "MEDIA",
    code: "III",
    items: [
      { href: "/media-war", label: "MEDIA WAR", code: "⊗" },
      { href: "/synthesis", label: "SYNTHESIS", code: "∴" },
      { href: "/evidence", label: "VIDEO", code: "▶" },
      { href: "/sources", label: "SOURCES", code: "※" },
      { href: "/counter-arguments", label: "COUNTERPOINTS", code: "⇋" },
    ],
  },
  {
    label: "INFO",
    code: "—",
    items: [
      { href: "/about", label: "ABOUT", code: "—" },
      { href: "#contact", label: "CONTACT", code: "@" },
    ],
  },
] as const satisfies readonly SiteNavGroup[];

export const SITE_SUPPORT_LINK = {
  href: "/support",
  label: "SUPPORT",
  code: "+",
} as const;

export const CONTACT_EVENT = "ziopsyop:open-contact";

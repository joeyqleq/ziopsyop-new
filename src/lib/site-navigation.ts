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
      { href: "/part-i", label: "THE OPERATION", code: "I" },
      { href: "/analysis", label: "PSYOP ANALYSIS", code: "·" },
      { href: "/forensics", label: "THE DOSSIER", code: "⊛" },
      { href: "/control", label: "CONTROL GROUP", code: "⊞" },
    ],
  },
  {
    label: "BATTLEFIELD",
    code: "II",
    items: [
      { href: "/battlefield", label: "THE SCORECARD", code: "II" },
      { href: "/map", label: "ATTACK MAP", code: "·" },
      { href: "/vision-model", label: "VISION MODEL", code: "CV" },
    ],
  },
  {
    label: "MEDIA",
    code: "III",
    items: [
      { href: "/media-war", label: "MEDIA WAR", code: "⊗" },
      { href: "/synthesis", label: "THE VERDICT", code: "∴" },
      { href: "/evidence", label: "COMBAT ARCHIVE", code: "▶" },
      { href: "/sources", label: "SOURCE LEDGER", code: "※" },
      { href: "/counter-arguments", label: "OBJECTIONS", code: "⇋" },
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

import type { MetadataRoute } from "next";
import { SITE_NAV_GROUPS, SITE_SUPPORT_LINK } from "@/lib/site-navigation";

const SITE_URL = "https://ziopsyop.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const navigationRoutes = SITE_NAV_GROUPS.reduce<string[]>((routes, group) => {
    for (const item of group.items) {
      if (item.href.startsWith("/")) routes.push(item.href);
    }
    return routes;
  }, []);

  const routes = Array.from(new Set(["/", ...navigationRoutes, SITE_SUPPORT_LINK.href]));

  return routes.map((route) => {
    const investigative = ["/part-i", "/analysis", "/forensics", "/control", "/battlefield", "/map", "/vision-model", "/media-war", "/synthesis", "/evidence"].includes(route);
    return {
      url: route === "/" ? SITE_URL : `${SITE_URL}${route}`,
      lastModified,
      changeFrequency: investigative ? "daily" : "weekly",
      priority: route === "/" ? 1 : investigative ? 0.9 : 0.7,
    } as const;
  });
}

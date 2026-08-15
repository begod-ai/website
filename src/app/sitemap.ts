import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const routes = [
  "",
  "/manifesto",
  "/architecture",
  "/research",
  "/join",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/lab/agent-offers",
  "/lab/agent-offers/a",
  "/lab/agent-offers/b",
  "/lab/agent-offers/c",
  "/lab/agent-offers/d",
  "/lab/agent-offers/e",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${site.url}${route}`,
    changeFrequency: route === "/research" ? "weekly" : "monthly",
    priority:
      route === ""
        ? 1
        : route === "/manifesto"
          ? 0.9
          : route.startsWith("/lab/agent-offers")
            ? 0.4
            : 0.7,
  }));
}

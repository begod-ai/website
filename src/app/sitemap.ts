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
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${site.url}${route}`,
    changeFrequency: route === "/research" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/manifesto" ? 0.9 : 0.7,
  }));
}

import type { MetadataRoute } from "next";
import { activities } from "@/data/activities";
import { news } from "@/data/news";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/le-club",
    "/activites",
    "/planning-tarifs",
    "/inscriptions",
    "/competition",
    "/piscine",
    "/actualites",
    "/boutique",
    "/contact",
    "/mentions-legales",
    "/confidentialite",
    "/cgu-cgv",
    ...activities.map((a) => `/activites/${a.slug}`),
    ...news.map((n) => `/actualites/${n.slug}`),
  ];
  return routes.map((r) => ({ url: `${site.url}${r}`, changeFrequency: "monthly", priority: r === "" ? 1 : 0.7 }));
}

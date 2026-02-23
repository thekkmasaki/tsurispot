import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/shops/*/dashboard",
        "/spots/submit",
        "/favorites",
      ],
    },
    sitemap: "https://tsurispot.com/sitemap.xml",
  };
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/shops/*/dashboard", "/spots/submit", "/favorites"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      {
        userAgent: "Yandex",
        allow: "/",
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
      },
    ],
    sitemap: [
      "https://tsurispot.com/sitemap/0.xml",
      "https://tsurispot.com/sitemap/1.xml",
      "https://tsurispot.com/sitemap/2.xml",
      "https://tsurispot.com/sitemap/3.xml",
      "https://tsurispot.com/sitemap/4.xml",
    ],
    host: "https://tsurispot.com",
  };
}

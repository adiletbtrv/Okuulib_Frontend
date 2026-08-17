import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile/", "/bookmarks/", "/reader/"],
    },
    sitemap: "https://okuulib.kg/sitemap.xml",
  };
}

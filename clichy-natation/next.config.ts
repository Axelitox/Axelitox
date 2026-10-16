import type { NextConfig } from "next";

/**
 * Anciennes routes du site Wix clichy-natation.com → nouvelles routes.
 * Redirections permanentes (308) pour conserver le référencement.
 */
const legacyRedirects: Array<[string, string]> = [
  ["/inscriptions-21", "/inscriptions"],
  ["/tarifs", "/planning-tarifs"],
  ["/activites-grand-public", "/activites"],
  ["/initiation-a-la-natation", "/activites/ecole-de-natation"],
  ["/bebe-nageur", "/activites/jardin-aquatique"],
  ["/cours-de-natation-adultes", "/activites/natation-adultes"],
  ["/aquabike-nouveau", "/activites/aquabike-aquaforme"],
  ["/aqua-yoga", "/activites/aquabike-aquaforme"],
  ["/handisport", "/activites/handisport"],
  ["/equipe-competition", "/competition"],
  ["/interclubs-18", "/competition#archives"],
  ["/service-page/:slug*", "/inscriptions"],
  ["/home", "/"],
  ["/accueil", "/"],
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

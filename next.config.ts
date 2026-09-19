import type { NextConfig } from "next";

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/settings", destination: "/profile", permanent: true },
      {
        source: "/resources",
        destination: "/tools/resources",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            // geolocation=(self): Fahrplan's "locate nearest station" needs it.
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

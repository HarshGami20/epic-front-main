import type { NextConfig } from "next";

function buildImageRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    { protocol: "http", hostname: "localhost" },
    { protocol: "http", hostname: "127.0.0.1" },
  ];

  const origins = [
    process.env.NEXT_PUBLIC_ASSET_ORIGIN,
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, ""),
  ].filter(Boolean) as string[];

  for (const origin of origins) {
    try {
      const url = new URL(origin);
      const protocol = url.protocol.replace(":", "") as "http" | "https";
      if (protocol !== "http" && protocol !== "https") continue;
      patterns.push({ protocol, hostname: url.hostname });
    } catch {
      // ignore invalid env URLs
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: buildImageRemotePatterns(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sweph-wasm"],
  outputFileTracingIncludes: {
    "/api/calculate-chart": ["./node_modules/sweph-wasm/**/*"],
  },
};

export default nextConfig;

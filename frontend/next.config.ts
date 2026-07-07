import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    // Rewrites deep imports for these packages so only the modules a page
    // actually uses are bundled, instead of the whole package barrel file.
    optimizePackageImports: ["lucide-react", "@tanstack/react-virtual", "react-hook-form"],
  },
};

export default nextConfig;

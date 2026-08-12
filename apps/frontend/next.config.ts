import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Tracing defaults to the project directory, which in a pnpm workspace misses
  // the real dependency files under the root .pnpm store. Root the trace at the
  // monorepo so the standalone bundle is self-contained.
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;

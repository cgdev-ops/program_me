// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactCompiler: true,
// };

// export default nextConfig;
// //

import withPWAInit from "next-pwa";

// Configure PWA to output service workers to the public folder
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Keeps dev server fast, only caches in production
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This explicitly silences the Turbopack warning in Next 16+
  turbopack: {},
};

// next.config.js
module.exports = {
  allowedDevOrigins: ["192.168.1.10"],
};

export default withPWA(nextConfig);

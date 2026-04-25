import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Add the empty turbopack object at the top level
  turbopack: {}, 
  
  
};

export default withPWA(nextConfig);
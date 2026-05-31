/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // Walrus SDK needs WASM — handle it properly
    if (isServer) {
      // Treat walrus-wasm as external so webpack doesn't rewrite its path
      config.externals = [...(config.externals || []), '@mysten/walrus-wasm'];
    }
    return config;
  },
};

export default nextConfig;

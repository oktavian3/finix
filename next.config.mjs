/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle walrus-wasm — it needs native WASM loading
      config.externals = [...(config.externals || []), '@mysten/walrus-wasm'];
    }
    return config;
  },
};

export default nextConfig;

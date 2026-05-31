/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // Walrus SDK needs WASM — handle it properly
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        '@mysten/walrus-wasm',
        '@mysten/walrus',
      ];
    }
    return config;
  },
  serverExternalPackages: [
    '@mysten/walrus',
    '@mysten/walrus-wasm',
    '@mysten/sui',
  ],
};

export default nextConfig;

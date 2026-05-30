/** @type {import('next').NextConfig} */
const nextConfig = {
  // @mysten/dapp-kit and its deps are ESM-only, need transpilation
  transpilePackages: [
    '@mysten/dapp-kit',
    '@mysten/sui',
    '@mysten/wallet-standard',
    '@mysten/walrus',
    '@tanstack/react-query',
  ],
};

export default nextConfig;

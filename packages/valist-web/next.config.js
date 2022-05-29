/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa');

module.exports = withPWA({
  reactStrictMode: true,
  assetPrefix: process.env.IPFS_BUILD ? './' : undefined,
  images: {
    domains: ['gateway.valist.io', 'https://gateway.valist.io', 'localhost'],
  },
  publicRuntimeConfig: {
    CHAIN_ID: process.env.CHAIN_ID || 1337,
    WEB3_PROVIDER: process.env.WEB3_PROVIDER || 'http://localhost:8545',
    IPFS_HOST: process.env.IPFS_HOST || 'http://localhost:5001',
    IPFS_GATEWAY: process.env.IPFS_GATEWAY || 'http://localhost:8080',
    PINATA_JWT: process.env.PINATA_JWT,
    GRAPH_PROVIDER: process.env.GRAPH_PROVIDER || 'http://localhost:8000/subgraphs/name/valist-io/valist',
    MAGIC_PUBKEY: 'pk_live_631BA2340BB9ACD8',
    METATX_ENABLED: process.env.METATX_ENABLED || false,
  },
  webpack: function (config, options) {
    if (!options.isServer) {
      // polyfill events on browser. since webpack5, polyfills are not automatically included
      config.resolve.fallback.events = require.resolve('events/');
      config.resolve.fallback.fs = false;
    }
    config.plugins.push(new options.webpack.IgnorePlugin({ resourceRegExp: /^electron$/ }));
    return config;
  },
  // trailingSlash: true,
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
  }
});

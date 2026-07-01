/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  env: {
    NEXT_PUBLIC_APP_VERSION: require('./package.json').version,
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */

const nextConfig = {
  eslint: {
    dirs: ['src'],
  },
  // output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    //domains: [`${process.env.AWS_DOMAIN}`, 'scontent.fvvi1-2.fna.fbcdn.net'],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            typescript: true,
            icon: true,
          },
        },
      ],
    });

    return config;
  },
};

module.exports = nextConfig;

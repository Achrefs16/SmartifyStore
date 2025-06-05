/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'smartifystore.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/products/**',
      },
    ],
    domains: ['lh3.googleusercontent.com', 'images.unsplash.com'],
  },
};

module.exports = nextConfig; 
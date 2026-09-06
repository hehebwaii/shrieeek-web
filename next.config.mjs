/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    domains: ["images.unsplash.com", "lh3.googleusercontent.com", "contribution.usercontent.google.com"],
  },
};

export default nextConfig;

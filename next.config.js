/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["genkit", "@genkit-ai/google-genai"],
};

module.exports = nextConfig;

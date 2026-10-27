/** @type {import('next').NextConfig} */
// Configure Next.js build and server-side dependency behavior.
const nextConfig = {
  // Configure builds to continue when lint checks report issues.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Exclude Genkit packages from server bundling so they load as external modules.
  serverExternalPackages: ["genkit", "@genkit-ai/google-genai"],
};

// Export the configuration for Next.js to load.
module.exports = nextConfig;

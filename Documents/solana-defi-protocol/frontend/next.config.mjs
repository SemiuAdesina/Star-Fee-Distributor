/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

const config = {
  experimental: {
    instrumentationHook: true
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },
  async rewrites() {
    return [
      {
        source: "/ci/:path*",
        destination: `${backendUrl}/ci/:path*`
      },
      {
        source: "/metadata/:path*",
        destination: `${backendUrl}/metadata/:path*`
      },
      {
        source: "/registry/:path*",
        destination: `${backendUrl}/registry/:path*`
      },
      {
        source: "/graphql",
        destination: `${backendUrl}/graphql`
      }
    ];
  }
};

export default config;


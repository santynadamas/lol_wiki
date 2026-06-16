import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ddragon.leagueoflegends.com' },
      { protocol: 'https', hostname: 'cmsassets.rgpub.io' },
      { protocol: 'https', hostname: 'yourcdn.com' },
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
  },
}

export default nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@node-rs/argon2'],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // XSS
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Politique de référent
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Content Security Policy avec Supabase
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: *.supabase.co",
              "font-src 'self'",
              "connect-src 'self' *.supabase.co",
              "frame-ancestors 'none'",
            ].join('; ')
          }
        ]
      }
    ]
  },
}

export default nextConfig
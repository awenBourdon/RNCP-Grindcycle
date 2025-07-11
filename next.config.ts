import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@node-rs/argon2'],
  
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
          // Content Security Policy basique
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join('; ')
          }
        ]
      }
    ]
  },
}

export default nextConfig
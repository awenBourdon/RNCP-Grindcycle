interface RateLimitData {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitData>()

export const RATE_LIMITS = {
  social: { max: 5, windowMs: 5 * 60 * 1000 },
  magicLink: { max: 5, windowMs: 5 * 60 * 1000 },
  signIn: { max: 5, windowMs: 5 * 60 * 1000 },
  signUp: { max: 5, windowMs: 60 * 60 * 1000 },
  resetPassword: { max: 5, windowMs: 60 * 60 * 1000 },
  verifyEmail: { max: 5, windowMs: 60 * 60 * 1000 },
} as const

export type RateLimitAction = keyof typeof RATE_LIMITS

export function getClientIP(request: Request): string {
  if (!request || !request.headers || typeof request.headers.get !== 'function') {
    return 'localhost'
  }
  
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  return cfConnectingIP || 
         (forwarded ? forwarded.split(',')[0].trim() : null) || 
         real || 
         'localhost'
}

export function checkRateLimit(ip: string, action: RateLimitAction): boolean {
  const config = RATE_LIMITS[action]
  const key = `${action}:${ip}`
  const now = Date.now()
  
  const data = rateLimitStore.get(key)
  
  if (!data || now > data.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return true
  }
  
  data.count += 1
  
  return data.count <= config.max
}

export function getRateLimitInfo(ip: string, action: RateLimitAction) {
  const config = RATE_LIMITS[action]
  const key = `${action}:${ip}`
  const now = Date.now()
  
  const data = rateLimitStore.get(key)
  
  if (!data || now > data.resetTime) {
    return {
      count: 0,
      max: config.max,
      remaining: config.max,
      resetTime: now + config.windowMs,
      secondsUntilReset: Math.ceil(config.windowMs / 1000)
    }
  }
  
  return {
    count: data.count,
    max: config.max,
    remaining: Math.max(0, config.max - data.count),
    resetTime: data.resetTime,
    secondsUntilReset: Math.ceil((data.resetTime - now) / 1000)
  }
}

export const RATE_LIMIT_MESSAGES = {
  social: "Trop de demandes de connexion avec Google. Veuillez patienter 5 minutes.",
  magicLink: 'Trop de demandes de magic link. Veuillez patienter 5 minutes.',
  signIn: 'Trop de tentatives de connexion. Veuillez patienter 5 minutes.',
  signUp: 'Trop d\'inscriptions. Veuillez patienter 1 heure.',
  resetPassword: 'Trop de demandes de réinitialisation. Veuillez patienter 1 heure.',
  verifyEmail: 'Trop de tentatives de vérification. Veuillez patienter 1 heure.',
} as const


function cleanupExpiredEntries() {
  const now = Date.now()
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 10 * 60 * 1000)
}
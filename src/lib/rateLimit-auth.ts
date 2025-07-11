interface RateLimitData {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitData>()

// Configuration des limites par action
export const RATE_LIMITS = {
  social: { max: 3, windowMs: 5 * 60 * 1000 },
  magicLink: { max: 2, windowMs: 5 * 60 * 1000 },     // 2 par 5 minutes
  signIn: { max: 5, windowMs: 5 * 60 * 1000 },        // 5 par 5 minutes
  signUp: { max: 3, windowMs: 60 * 60 * 1000 },       // 3 par heure
  resetPassword: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 par heure
  verifyEmail: { max: 5, windowMs: 60 * 60 * 1000 },   // 5 par heure
} as const

export type RateLimitAction = keyof typeof RATE_LIMITS

/**
 * Obtient l'IP du client depuis une requête
 */
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

/**
 * Vérifie si une action est autorisée selon le rate limiting
 */
export function checkRateLimit(ip: string, action: RateLimitAction): boolean {
  const config = RATE_LIMITS[action]
  const key = `${action}:${ip}`
  const now = Date.now()
  
  const data = rateLimitStore.get(key)
  
  // Première requête ou fenêtre expirée
  if (!data || now > data.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return true
  }
  
  // Incrémenter le compteur
  data.count += 1
  
  // Vérifier si la limite est dépassée
  return data.count <= config.max
}

/**
 * Obtient les informations de rate limiting pour une action
 */
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

/**
 * Messages d'erreur personnalisés par action
 */
export const RATE_LIMIT_MESSAGES = {
  social: "Trop de demandes de connexion avec Google. Veuillez patienter 5 minutes.",
  magicLink: 'Trop de demandes de magic link. Veuillez patienter 5 minutes.',
  signIn: 'Trop de tentatives de connexion. Veuillez patienter 5 minutes.',
  signUp: 'Trop d\'inscriptions. Veuillez patienter 1 heure.',
  resetPassword: 'Trop de demandes de réinitialisation. Veuillez patienter 1 heure.',
  verifyEmail: 'Trop de tentatives de vérification. Veuillez patienter 1 heure.',
} as const

/**
 * Nettoyage périodique des entrées expirées
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Nettoyage automatique toutes les 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 10 * 60 * 1000)
}
interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

export const RATE_LIMITS = {
  social: { max: 5, windowMs: 5 * 60 * 1000 },
  magicLink: { max: 5, windowMs: 5 * 60 * 1000 },
  signIn: { max: 5, windowMs: 5 * 60 * 1000 },
  signUp: { max: 5, windowMs: 60 * 60 * 1000 },
  resetPassword: { max: 5, windowMs: 60 * 60 * 1000 },
  verifyEmail: { max: 5, windowMs: 60 * 60 * 1000 },
  changePassword: { max: 2, windowMs: 15 * 60 * 1000 },

  createUsedBoard: { max: 10, windowMs: 10 * 60 * 1000 },


  getProducts: { max: 100, windowMs: 1 * 60 * 1000 },
  getProductById: { max: 50, windowMs: 1 * 60 * 1000 },
  getUsedBoards: { max: 50, windowMs: 1 * 60 * 1000 },
  getFavorites: { max: 30, windowMs: 1 * 60 * 1000 },
  getNotifications: { max: 60, windowMs: 1 * 60 * 1000 },
  

  generalGet: { max: 200, windowMs: 1 * 60 * 1000 },
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

export function getClientIP(request: Request): string {
  if (
    !request ||
    !request.headers ||
    typeof request.headers.get !== 'function'
  ) {
    return 'localhost';
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  return (
    cfConnectingIP ||
    (forwarded ? forwarded.split(',')[0].trim() : null) ||
    real ||
    'localhost'
  );
}

export function checkRateLimit(ip: string, action: RateLimitAction): boolean {
  const config = RATE_LIMITS[action];
  const key = `${action}:${ip}`;
  const now = Date.now();

  const data = rateLimitStore.get(key);

  if (!data || now > data.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return true;
  }

  data.count += 1;

  return data.count <= config.max;
}

export function getRateLimitInfo(ip: string, action: RateLimitAction) {
  const config = RATE_LIMITS[action];
  const key = `${action}:${ip}`;
  const now = Date.now();

  const data = rateLimitStore.get(key);

  if (!data || now > data.resetTime) {
    return {
      count: 0,
      max: config.max,
      remaining: config.max,
      resetTime: now + config.windowMs,
      secondsUntilReset: Math.ceil(config.windowMs / 1000),
    };
  }

  return {
    count: data.count,
    max: config.max,
    remaining: Math.max(0, config.max - data.count),
    resetTime: data.resetTime,
    secondsUntilReset: Math.ceil((data.resetTime - now) / 1000),
  };
}

export const RATE_LIMIT_MESSAGES = {
  social: 'Trop de demandes de connexion avec Google. Patiente 5 minutes.',
  magicLink: 'Trop de demandes de magic link. Patiente 5 minutes.',
  signIn: 'Trop de tentatives de connexion. Patiente 5 minutes.',
  signUp: "Trop d'inscriptions. Patiente 1 heure.",
  resetPassword: 'Trop de demandes de réinitialisation. Patiente 1 heure.',
  verifyEmail: 'Trop de tentatives de vérification. Patiente 1 heure.',
  changePassword:
    'Trop de tentatives de changement de mot de passe. Patiente 15 minutes.',

  createUsedBoard:
    "Trop d'envoi de planche. Attends 10 minutes avant de pouvoir en renvoyer.",


  getProducts: 'Trop de requêtes pour les produits. Patiente 1 minute.',
  getProductById: 'Trop de requêtes pour ce produit. Patiente 1 minute.',
  getUsedBoards: 'Trop de requêtes pour les planches. Patiente 1 minute.',
  getFavorites: 'Trop de requêtes pour les favoris. Patiente 1 minute.',
  getNotifications: 'Trop de requêtes pour les notifications. Patiente 1 minute.',
  generalGet: 'Trop de requêtes. Patiente 1 minute.',
} as const;

export function createRateLimitResponse(action: RateLimitAction, ip: string) {
  const info = getRateLimitInfo(ip, action);
  const message = RATE_LIMIT_MESSAGES[action];
  
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      rateLimitInfo: {
        limit: info.max,
        remaining: info.remaining,
        resetTime: new Date(info.resetTime).toISOString(),
        retryAfter: info.secondsUntilReset,
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': info.max.toString(),
        'X-RateLimit-Remaining': info.remaining.toString(),
        'X-RateLimit-Reset': info.resetTime.toString(),
        'Retry-After': info.secondsUntilReset.toString(),
      },
    }
  );
}


export function applyGetRateLimit(
  request: Request, 
  action: RateLimitAction = 'generalGet'
): Response | null {
  const ip = getClientIP(request);
  
  if (!checkRateLimit(ip, action)) {
    return createRateLimitResponse(action, ip);
  }
  
  return null;
}

function cleanupExpiredEntries() {
  const now = Date.now();

  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 10 * 60 * 1000);
}
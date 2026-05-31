import helmet from 'helmet';

/**
 * Middleware to set security-related HTTP headers using Helmet.
 * 
 * Configures:
 * - Content Security Policy (CSP)
 * - Referrer Policy
 * - Frameguard (X-Frame-Options)
 * - noSniff (X-Content-Type-Options)
 * - crossOriginResourcePolicy disabled for backend API
 */
export const securityHeaders = helmet({
  crossOriginResourcePolicy: false,

  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: ["'self'"],

      styleSrc: ["'self'", "'unsafe-inline'"],

      imgSrc: ["'self'", 'data:', 'https:'],

      objectSrc: ["'none'"],

      baseUri: ["'self'"],

      frameAncestors: ["'none'"],

      upgradeInsecureRequests: [],
    },
  },

  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  frameguard: {
    action: 'deny',
  },

  noSniff: true,
});

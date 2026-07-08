import helmet from 'helmet';
import { Express } from 'express';

export const setupSecurity = (app: Express) => {
  // Content Security Policy
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.firebaseio.com", "https://*.googleapis.com"],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    })
  );

  // Hide Express header
  app.use(helmet.hidePoweredBy());

  // HSTS (HTTP Strict Transport Security)
  app.use(
    helmet.hsts({
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    })
  );

  // X-Content-Type-Options
  app.use(helmet.noSniff());

  // X-Frame-Options
  app.use(helmet.frameguard({ action: 'deny' }));

  // X-XSS-Protection
  app.use(helmet.xssFilter());

  // Referrer Policy
  app.use(
    helmet.referrerPolicy({
      policy: 'strict-origin-when-cross-origin',
    })
  );

  // DNS Prefetch Control
  app.use(helmet.dnsPrefetchControl({ allow: false }));

  // IE No Open
  app.use(helmet.ieNoOpen());

  // Origin Agent Cluster
  app.use(helmet.originAgentCluster());
};

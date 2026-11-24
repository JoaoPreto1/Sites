import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import pageRoutes, { notFoundPage } from './routes/pages.routes.js';
import styleRoutes from './routes/styles.routes.js';
import { errorHandler } from './middleware/errors.js';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));

export const app = express();

app.disable('x-powered-by');
// Atrás de um proxy (nginx, Render, Fly…) para o rate limit ver o IP real e o HTTPS ser detetado
if (env.isProduction) app.set('trust proxy', 1);

if (env.forceHttps) {
  app.use((req, res, next) => (req.secure ? next() : res.redirect(301, `https://${req.get('host')}${req.originalUrl}`)));
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        styleSrc: ["'self'"],
        styleSrcAttr: ["'unsafe-inline'"],
        fontSrc: ["'self'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: env.isProduction ? [] : null,
      },
    },
    strictTransportSecurity: env.isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);
app.use((req, res, next) => {
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});
app.use(compression());
app.use(express.json({ limit: '30kb' }));
app.use(cookieParser());

app.use('/api', apiRoutes);
app.use(styleRoutes);
app.use(pageRoutes);

app.use(
  express.static(publicDir, {
    index: false,
    setHeaders(res, path) {
      if (/[\\/](fonts|img)[\\/]/.test(path)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
      else if (path.endsWith('.js')) res.set('Cache-Control', 'no-cache');
      else res.set('Cache-Control', 'public, max-age=86400');
    },
  }),
);
app.use(notFoundPage);
app.use(errorHandler);

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
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
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
        styleSrc: ["'self'"],
        // Só atributos style (cor de cada sala e posição dos cartões no quadro); as folhas de estilo são locais
        styleSrcAttr: ["'unsafe-inline'"],
        fontSrc: ["'self'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: env.isProduction ? [] : null,
      },
    },
  }),
);
app.use(compression());

if (env.corsOrigins.length) {
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
}

app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

app.use('/api', apiRoutes);
app.use(styleRoutes);
app.use(pageRoutes);

app.use(
  express.static(publicDir, {
    index: false,
    setHeaders(res, path) {
      if (/[\/]fonts[\/]/.test(path)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
      else if (path.endsWith('.js')) res.set('Cache-Control', 'no-cache');
      else res.set('Cache-Control', 'public, max-age=86400');
    },
  }),
);
app.use(notFoundPage);

app.use(errorHandler);

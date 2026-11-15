import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import pageRoutes, { notFoundPage } from './routes/pages.routes.js';
import { errorHandler } from './middleware/errors.js';
import styleRoutes from './routes/styles.routes.js';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));

export const app = express();

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://*.mzstatic.com', 'https://images.unsplash.com'],
        mediaSrc: ["'self'", 'blob:', 'https://*.itunes.apple.com', 'https://*.mzstatic.com'],
        styleSrc: ["'self'"],
        // Só atributos style (cores dos rótulos, atrasos das animações); folhas de estilo continuam só locais
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

app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());

app.use('/api', apiRoutes);
app.use(styleRoutes);
app.use(pageRoutes);

app.use(
  express.static(publicDir, {
    index: false,
    setHeaders(res, path) {
      // Os módulos JS (e o three.js) importam-se sem versão no URL: revalidam sempre (304 se não mudaram)
      if (/[\\/]fonts[\\/]/.test(path)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
      else if (path.endsWith('.js')) res.set('Cache-Control', 'no-cache');
      else res.set('Cache-Control', 'public, max-age=86400');
    },
  }),
);
app.use(notFoundPage);

app.use(errorHandler);

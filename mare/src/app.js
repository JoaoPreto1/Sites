import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errors.js';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));
const page = (name) => (req, res) => res.sendFile(`${name}.html`, { root: publicDir });

export const app = express();

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: env.isProduction ? [] : null,
      },
    },
  }),
);

if (env.corsOrigins.length) {
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
}

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api', apiRoutes);

app.get('/alojamentos/:slug', page('alojamento'));
app.use(express.static(publicDir, { extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile('404.html', { root: publicDir }));

app.use(errorHandler);

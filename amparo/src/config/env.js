import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const isProduction = process.env.NODE_ENV === 'production';

function secret(name, devFallback) {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) throw new Error(`Falta definir ${name} no .env`);
  return devFallback;
}

const port = Number(process.env.PORT) || 3009;
const siteUrl = (process.env.SITE_URL || `http://localhost:${port}`).replace(/\/$/, '');
if (isProduction && !siteUrl.startsWith('https://')) throw new Error('Em produção o SITE_URL tem de usar https://');

export const env = {
  isProduction,
  port,
  siteUrl,
  jwt: {
    accessSecret: secret('JWT_ACCESS_SECRET', 'dev-access-secret'),
    refreshSecret: secret('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
    staffSecret: secret('STAFF_JWT_SECRET', 'dev-staff-secret'),
    accessExpires: '15m',
    staffExpires: '30m',
    refreshDays: 7,
  },
  owner: {
    name: process.env.OWNER_NAME || 'Dono da plataforma',
    email: (process.env.OWNER_EMAIL || (isProduction ? '' : 'dono@exemplo.pt')).toLowerCase(),
    password: secret('OWNER_PASSWORD', 'amparo-dono-2026'),
  },
  paymentProvider: process.env.PAYMENT_PROVIDER || 'demo',
  storageDir: process.env.STORAGE_DIR ? resolve(process.env.STORAGE_DIR) : fileURLToPath(new URL('../../storage', import.meta.url)),
};

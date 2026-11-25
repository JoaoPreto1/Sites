const isProduction = process.env.NODE_ENV === 'production';

function secret(name, devFallback) {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) throw new Error(`Falta definir ${name} no .env`);
  return devFallback;
}

const port = Number(process.env.PORT) || 3012;
const siteUrl = (process.env.SITE_URL || `http://localhost:${port}`).replace(/\/$/, '');
if (isProduction && !siteUrl.startsWith('https://')) throw new Error('Em produção o SITE_URL tem de usar https://');

export const env = {
  isProduction,
  port,
  siteUrl,
  jwt: {
    accessSecret: secret('JWT_ACCESS_SECRET', 'dev-access-secret-arriba'),
    refreshSecret: secret('JWT_REFRESH_SECRET', 'dev-refresh-secret-arriba'),
    accessExpires: '15m',
    refreshDays: 7,
  },
  // Só para testar a versão de produção localmente sem proxy HTTPS
  forceHttps: isProduction && process.env.FORCE_HTTPS !== 'false',
};

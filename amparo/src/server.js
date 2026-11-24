import { app } from './app.js';
import { env } from './config/env.js';
import { ensureStorage } from './services/documents.service.js';
import { purgeExpired } from './services/privacy.service.js';
import { ensureOwner } from './services/staff.service.js';
import { isDemo } from './services/payments/index.js';
import { launchStatus } from './services/settings.service.js';

// Dinheiro real só depois de tudo o que está na lista do lançamento estar decidido
if (!isDemo && !(await launchStatus()).ready) {
  throw new Error('A lista "antes do lançamento" ainda tem pontos por definir: só o prestador demo pode ser usado.');
}

await ensureOwner();
await ensureStorage();
await purgeExpired();
setInterval(() => purgeExpired().catch(console.error), 24 * 60 * 60 * 1000).unref();

app.listen(env.port, () => {
  console.log(`Amparo a correr em ${env.siteUrl}`);
});

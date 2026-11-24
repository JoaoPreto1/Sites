import { app } from './app.js';
import { env } from './config/env.js';
import { ensureStorage } from './services/documents.service.js';
import { purgeExpired } from './services/privacy.service.js';
import { ensureOwner } from './services/staff.service.js';

await ensureOwner();
await ensureStorage();
await purgeExpired();
setInterval(() => purgeExpired().catch(console.error), 24 * 60 * 60 * 1000).unref();

app.listen(env.port, () => {
  console.log(`Amparo a correr em ${env.siteUrl}`);
});

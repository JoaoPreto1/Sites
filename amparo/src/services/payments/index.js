import { env } from '../../config/env.js';
import { demoProvider } from './demo.js';

// Cada prestador implementa createCheckout({ kind, id, chargedCents, description }) → { redirectUrl, reference }
// e confirma o pagamento por webhook. A plataforma nunca recebe nem guarda dados de cartões.
const PROVIDERS = { demo: demoProvider };

export const provider = PROVIDERS[env.paymentProvider];

if (!provider) {
  throw new Error(
    `O prestador de pagamentos "${env.paymentProvider}" ainda não está implementado. ` +
      'Ligar um prestador real exige contrato, chaves e a lista "antes do lançamento" completa.',
  );
}

export const isDemo = provider.id === 'demo';

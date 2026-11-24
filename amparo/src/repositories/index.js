import { createRepository } from './createRepository.js';
import * as seed from '../data/seed.js';

// Contas normais e equipa ficam em repositórios separados: um registo nunca cria acesso à gestão
export const users = createRepository(seed.users);
export const staff = createRepository(seed.staff);
export const refreshTokens = createRepository();

export const ads = createRepository(seed.ads);
export const documents = createRepository(seed.documents);
export const conversations = createRepository(seed.conversations);
export const messages = createRepository(seed.messages);
export const reports = createRepository(seed.reports);

// Dinheiro dos anúncios e dinheiro da plataforma nunca se misturam
export const donations = createRepository(seed.donations);
export const payouts = createRepository(seed.payouts);
export const contributions = createRepository(seed.contributions);
export const expenses = createRepository(seed.expenses);

export const settings = createRepository(seed.settings);
export const auditLog = createRepository(seed.auditLog);
export const dataRequests = createRepository();

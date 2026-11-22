import { createRepository } from './createRepository.js';
import * as seed from '../data/seed.js';

export const users = createRepository(seed.users);
export const services = createRepository(seed.services);
export const news = createRepository(seed.news);
export const events = createRepository(seed.events);
export const notices = createRepository(seed.notices);
export const editais = createRepository(seed.editais);
export const requests = createRepository(seed.requests);
export const issues = createRepository(seed.issues);
export const invoices = createRepository(seed.invoices);
export const readings = createRepository(seed.readings);
export const messages = createRepository(seed.messages);
export const subscribers = createRepository();
export const refreshTokens = createRepository();

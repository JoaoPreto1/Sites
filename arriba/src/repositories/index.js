import { createRepository } from './createRepository.js';
import * as seed from '../data/seed.js';

export const users = createRepository(seed.users);
export const refreshTokens = createRepository();

export const reservations = createRepository(seed.reservations);
export const requests = createRepository(seed.requests);
export const menus = createRepository(seed.menus);
// Preço por noite de cada tipo de quarto (a receção pode mudar)
export const prices = createRepository(seed.prices);

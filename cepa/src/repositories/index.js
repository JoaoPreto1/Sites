import { createRepository } from './createRepository.js';
import * as seed from '../data/seed.js';

export const users = createRepository(seed.users);
export const wines = createRepository(seed.wines);
export const producers = createRepository(seed.producers);
export const tastings = createRepository(seed.tastings);
export const reservations = createRepository(seed.reservations);
export const orders = createRepository(seed.orders);
export const subscriptions = createRepository(seed.subscriptions);
export const clubBoxes = createRepository(seed.clubBoxes);
export const subscribers = createRepository();
export const refreshTokens = createRepository();

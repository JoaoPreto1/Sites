import { createRepository } from './createRepository.js';
import * as seed from '../data/seed.js';

export const users = createRepository(seed.users);
export const records = createRepository(seed.records);
export const orders = createRepository(seed.orders);
export const rooms = createRepository(seed.rooms);
export const bookings = createRepository(seed.bookings);
export const wants = createRepository(seed.wants);
export const offers = createRepository(seed.offers);
export const subscribers = createRepository();
export const refreshTokens = createRepository();

import { createRepository } from './createRepository.js';
import * as seed from '../data/seed.js';

export const users = createRepository(seed.users);
export const rooms = createRepository(seed.rooms);
export const bookings = createRepository(seed.bookings);
export const blocks = createRepository(seed.blocks);
export const vouchers = createRepository(seed.vouchers);
export const refreshTokens = createRepository();

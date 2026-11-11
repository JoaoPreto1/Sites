import { createRepository } from './createRepository.js';
import * as seed from '../data/seed.js';

export const users = createRepository(seed.users);
export const properties = createRepository(seed.properties);
export const experiences = createRepository(seed.experiences);
export const bookings = createRepository(seed.bookings);
export const blocks = createRepository(seed.blocks);
export const messages = createRepository(seed.messages);
export const refreshTokens = createRepository();

import { createRepository } from './createRepository.js';
import * as seed from '../data/seed.js';

export const users = createRepository(seed.users);
export const projects = createRepository(seed.projects);
export const services = createRepository(seed.services);
export const galleries = createRepository(seed.galleries);
export const quotes = createRepository(seed.quotes);
export const subscribers = createRepository();
export const refreshTokens = createRepository();

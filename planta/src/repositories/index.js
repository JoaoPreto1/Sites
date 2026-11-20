import { createRepository } from './createRepository.js';
import * as seed from '../data/seed.js';

export const users = createRepository(seed.users);
export const projects = createRepository(seed.projects);
export const works = createRepository(seed.works);
export const requests = createRepository(seed.requests);
export const refreshTokens = createRepository();

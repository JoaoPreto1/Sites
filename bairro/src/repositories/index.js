import { createRepository } from './createRepository.js';
import * as seed from '../data/seed.js';

export const users = createRepository(seed.users);
export const projects = createRepository(seed.projects);
export const team = createRepository(seed.team);
export const availability = createRepository(seed.availability);
export const requests = createRepository(seed.requests);
export const jobs = createRepository(seed.jobs);
export const refreshTokens = createRepository();

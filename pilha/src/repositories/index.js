import { createRepository } from './createRepository.js';
import * as seed from '../data/seed.js';

export const users = createRepository(seed.users);
export const refreshTokens = createRepository();

export const briefs = createRepository(seed.briefs);
export const projects = createRepository(seed.projects);
export const proofs = createRepository(seed.proofs);
export const messages = createRepository(seed.messages);

export const works = createRepository(seed.works);
export const journal = createRepository(seed.journal);

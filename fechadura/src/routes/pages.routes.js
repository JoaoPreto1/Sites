import { Router } from 'express';

export function notFoundPage(req, res) {
  res.status(404).type('text').send('Página não encontrada');
}

const router = Router();

export default router;

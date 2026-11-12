import { Router } from 'express';
export const notFoundPage = (req, res) => res.status(404).send('404');
export default Router();

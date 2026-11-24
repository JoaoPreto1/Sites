import { Router } from 'express';
import { CATEGORY_IDS, DISTRICTS, LIMITS, REPORT_REASONS } from '../config/platform.js';
import { optionalUser, requireUser } from '../middleware/auth.js';
import { reportLimiter, writeLimiter } from '../middleware/limits.js';
import { validate } from '../middleware/validate.js';
import * as adsService from '../services/ads.service.js';
import * as conversations from '../services/conversations.service.js';
import * as docs from '../services/documents.service.js';
import * as donationsService from '../services/donations.service.js';
import * as fund from '../services/fund.service.js';
import * as reports from '../services/reports.service.js';
import { notFound } from '../utils/httpError.js';
import { amount, body, flag, id, optionalText, param, query, text } from '../validation/common.js';

const listRules = [
  query('categoria').optional().isIn(CATEGORY_IDS),
  query('distrito').optional().isIn(DISTRICTS),
  query('q').optional().isString().isLength({ max: 80 }),
  query('ordem').optional().isIn(['recentes', 'falta', 'prazo']),
];

const reportRules = [
  body('reason', 'Escolha um motivo').isIn(REPORT_REASONS.map(([v]) => v)),
  optionalText('details', 1000),
];

const askRules = [text('question', { min: 10, max: 1000, message: 'Escreva a pergunta (10 a 1000 caracteres)' })];

const quoteRules = [
  body('adId', 'Anúncio em falta').isString().isLength({ max: 80 }),
  amount('amount', LIMITS.donationMinCents, LIMITS.donationMaxCents, 'Escolha um valor entre 1 € e 1000 €'),
  flag('coverFee'),
];

const donateRules = [...quoteRules, flag('showName'), optionalText('publicName', 40), body('accept', 'Precisa de confirmar que leu as condições').equals('true')];

const contributionRules = [
  amount('amount', LIMITS.contributionMinCents, LIMITS.contributionMaxCents, 'Escolha um valor entre 1 € e 500 €'),
  flag('showName'),
  optionalText('publicName', 40),
  body('accept', 'Precisa de confirmar que leu como é usado este dinheiro').equals('true'),
];

const scanRules = [optionalText('title', 200), optionalText('story', 4000), optionalText('alias', 60)];

const router = Router();

router.get('/anuncios', validate(listRules, 'query'), async (req, res) => {
  res.json(await adsService.listPublic(req.valid.query));
});

router.get('/anuncios/:slug', async (req, res) => {
  const ad = await adsService.findPublicBySlug(req.params.slug);
  if (!ad) throw notFound('Anúncio');
  res.json({ ad });
});

// Só imagens que a pessoa autorizou partilhar e que a moderação aprovou
router.get('/anuncios/:slug/provas/:docId', async (req, res) => {
  await docs.send(res, await adsService.findPublicProof(req.params.slug, req.params.docId));
});

router.post('/anuncios/verificar-texto', writeLimiter, validate(scanRules), (req, res) => {
  res.json({ flags: adsService.scan(req.valid.body) });
});

router.post('/anuncios/:id/denuncias', reportLimiter, optionalUser, validate([id(), ...reportRules]), async (req, res) => {
  await reports.create({ adId: req.params.id, ...req.valid.body }, req.user?.id);
  res.status(201).json({ message: 'Denúncia recebida. A equipa de moderação vai analisá-la.' });
});

router.post('/anuncios/:id/pedidos-info', writeLimiter, requireUser, validate([id(), ...askRules]), async (req, res) => {
  res.status(201).json(await conversations.ask(req.user.id, req.params.id, req.valid.body.question));
});

router.post('/doacoes/orcamento', validate(quoteRules), async (req, res) => {
  const { adId, amount: cents, coverFee } = req.valid.body;
  res.json(await donationsService.quote({ adId, amountCents: cents, coverFee }));
});

router.post('/doacoes', writeLimiter, requireUser, validate(donateRules), async (req, res) => {
  const { amount: cents, ...rest } = req.valid.body;
  res.status(201).json(await donationsService.start(req.user.id, { ...rest, amountCents: cents }));
});

router.get('/pagamentos/:kind/:id', requireUser, validate([param('kind').isIn(['doacao', 'plataforma']), id()]), async (req, res) => {
  res.json(await donationsService.receipt(req.params.kind, req.params.id, req.user.id));
});

router.post(
  '/pagamentos/:kind/:id/simular',
  requireUser,
  validate([param('kind').isIn(['doacao', 'plataforma']), body('outcome').isIn(['concluir', 'falhar'])]),
  async (req, res) => {
    await donationsService.simulate(req.params.kind, req.params.id, req.user.id, req.valid.body.outcome);
    res.json(await donationsService.receipt(req.params.kind, req.params.id, req.user.id));
  },
);

router.get('/plataforma', async (req, res) => {
  res.json(await fund.platformFund());
});

router.post('/plataforma/contribuicoes', writeLimiter, requireUser, validate(contributionRules), async (req, res) => {
  const { amount: cents, ...rest } = req.valid.body;
  res.status(201).json(await donationsService.startContribution(req.user.id, { ...rest, amountCents: cents }));
});

router.get('/transparencia', async (req, res) => {
  res.json(await fund.transparency());
});

export default router;

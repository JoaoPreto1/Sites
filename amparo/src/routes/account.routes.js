import { Router } from 'express';
import multer from 'multer';
import { CATEGORY_IDS, DISTRICTS, LIMITS } from '../config/platform.js';
import { requireUser } from '../middleware/auth.js';
import { uploadLimiter, writeLimiter } from '../middleware/limits.js';
import { validate } from '../middleware/validate.js';
import { documents } from '../repositories/index.js';
import * as adsService from '../services/ads.service.js';
import * as conversations from '../services/conversations.service.js';
import * as docs from '../services/documents.service.js';
import * as donationsService from '../services/donations.service.js';
import * as privacy from '../services/privacy.service.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { amount, body, id, optionalText, text } from '../validation/common.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: LIMITS.uploadBytes, files: 1, fields: 4 } });

const inOneYear = () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

const adRules = [
  text('title', { min: 8, max: 90, message: 'O título precisa de 8 a 90 caracteres' }),
  text('story', { min: 80, max: 3000, message: 'Explique o motivo em 80 a 3000 caracteres' }),
  body('category', 'Escolha o tipo de despesa').isIn(CATEGORY_IDS),
  amount('amount', LIMITS.adMinCents, LIMITS.adMaxCents, 'O montante tem de estar entre 5 € e 3000 €'),
  body('deadline', 'Escolha uma data entre hoje e daqui a um ano')
    .optional({ values: 'falsy' })
    .isDate({ format: 'YYYY-MM-DD', strictMode: true })
    .custom((v) => v >= today() && v <= inOneYear()),
  optionalText('alias', 30),
  body('district', 'Escolha o distrito').isIn(DISTRICTS),
  body('visibility').optional().isObject(),
  body('visibility.*').optional().isBoolean().toBoolean(),
  optionalText('privateNote', 1000),
  body('confirm', 'Confirme que a informação é verdadeira e que o texto não tem dados pessoais').equals('true'),
];

const router = Router();
router.use(requireUser);

router.get('/resumo', async (req, res) => {
  const [ads, convs, given, deletion] = await Promise.all([
    adsService.listOwned(req.user.id),
    conversations.listFor(req.user.id),
    donationsService.listByDonor(req.user.id),
    privacy.pendingRequestFor(req.user.id),
  ]);
  res.json({ ads, conversations: convs, donations: given, deletionPending: Boolean(deletion) });
});

// Anúncios próprios
router.post('/anuncios', writeLimiter, validate(adRules), async (req, res) => {
  const { amount: cents, confirm, ...data } = req.valid.body;
  const ad = await adsService.create(req.user.id, { ...data, amountCents: cents });
  res.status(201).json({ ad, flags: ad.flags });
});

router.put('/anuncios/:id', writeLimiter, validate([id(), ...adRules]), async (req, res) => {
  const { amount: cents, confirm, ...data } = req.valid.body;
  const ad = await adsService.update(req.user.id, req.params.id, { ...data, amountCents: cents });
  res.json({ ad, flags: ad.flags });
});

router.post('/anuncios/:id/fechar', validate([id()]), async (req, res) => {
  res.json({ ad: await adsService.close(req.user.id, req.params.id) });
});

router.post('/anuncios/:id/atualizacoes', writeLimiter, validate([id(), text('text', { min: 10, max: 600, message: 'Escreva entre 10 e 600 caracteres' })]), async (req, res) => {
  res.status(201).json(await adsService.addUpdate(req.user.id, req.params.id, req.valid.body.text));
});

// Provas: guardadas fora da pasta pública, sem metadados, visíveis só para a pessoa e para quem ela autorizar
router.post('/anuncios/:id/provas', uploadLimiter, upload.single('file'), validate([
  id(),
  text('description', { min: 3, max: 80, message: 'Descreva a prova em 3 a 80 caracteres (ex.: fatura da luz de novembro)' }),
  body('shareRequested').optional().isIn(['true', 'false']),
]), async (req, res) => {
  const ad = await adsService.ownedBy(req.user.id, req.params.id);
  if (!req.file) throw new HttpError(400, 'Escolha um ficheiro');
  if (['concluido', 'recusado'].includes(ad.status)) throw new HttpError(400, 'Este anúncio já está fechado');
  const doc = await docs.store({
    ownerId: req.user.id,
    adId: ad.id,
    description: req.valid.body.description,
    shareRequested: req.valid.body.shareRequested === 'true',
    file: req.file,
  });
  res.status(201).json({ document: docs.summary(doc) });
});

async function ownDocument(userId, docId) {
  const doc = await documents.findById(docId);
  if (!doc || doc.ownerId !== userId) throw notFound('Prova');
  return doc;
}

router.get('/provas/:id', validate([id()]), async (req, res) => {
  await docs.send(res, await ownDocument(req.user.id, req.params.id));
});

// Retirar a autorização de partilha pública tem efeito imediato
router.patch('/provas/:id', validate([id(), body('shareRequested').isBoolean().toBoolean()]), async (req, res) => {
  const doc = await ownDocument(req.user.id, req.params.id);
  const shareRequested = req.valid.body.shareRequested;
  const publicStatus = shareRequested ? (doc.publicStatus === 'aprovado' ? 'aprovado' : 'pedido') : 'privado';
  res.json({ document: docs.summary(await documents.update(doc.id, { shareRequested, publicStatus })) });
});

router.delete('/provas/:id', validate([id()]), async (req, res) => {
  await docs.removeFile(await ownDocument(req.user.id, req.params.id));
  res.status(204).end();
});

// Conversas (pedidos de informação)
router.get('/conversas/:id', validate([id()]), async (req, res) => {
  res.json({ conversation: await conversations.get(req.user.id, req.params.id) });
});

router.post('/conversas/:id/mensagens', writeLimiter, validate([id(), text('text', { min: 1, max: 1000, message: 'Escreva a mensagem' })]), async (req, res) => {
  const result = await conversations.reply(req.user.id, req.params.id, req.valid.body.text);
  res.status(201).json({ ...result, conversation: await conversations.get(req.user.id, req.params.id) });
});

router.post('/conversas/:id/recusar', validate([id(), optionalText('text', 600)]), async (req, res) => {
  await conversations.decline(req.user.id, req.params.id, req.valid.body.text);
  res.json({ conversation: await conversations.get(req.user.id, req.params.id) });
});

router.post('/conversas/:id/fechar', validate([id()]), async (req, res) => {
  await conversations.close(req.user.id, req.params.id);
  res.json({ conversation: await conversations.get(req.user.id, req.params.id) });
});

router.post('/conversas/:id/partilhar', validate([id(), body('documentId').isString().isLength({ max: 80 })]), async (req, res) => {
  await conversations.shareDocument(req.user.id, req.params.id, req.valid.body.documentId);
  res.json({ conversation: await conversations.get(req.user.id, req.params.id) });
});

router.get('/conversas/:id/provas/:docId', validate([id(), id('docId')]), async (req, res) => {
  await docs.send(res, await conversations.sharedDocument(req.user.id, req.params.id, req.params.docId));
});

// Dados pessoais
router.get('/dados', async (req, res) => {
  res.set('Content-Disposition', 'attachment; filename="os-meus-dados-amparo.json"').json(await privacy.exportFor(req.user.id));
});

router.post('/dados/eliminacao', validate([optionalText('reason', 500), body('confirm').equals('true')]), async (req, res) => {
  await privacy.requestDeletion(req.user.id, req.valid.body.reason);
  res.status(201).json({ message: 'Pedido registado. A equipa trata-o em até 30 dias e avisa por email.' });
});

export default router;

import { Router } from 'express';
import { LAUNCH_ITEMS, STAFF_PERMISSIONS } from '../config/platform.js';
import { can, requireOwner, requirePermission, requireStaff } from '../middleware/auth.js';
import { staffLimiter } from '../middleware/limits.js';
import { validate } from '../middleware/validate.js';
import { ads, dataRequests, documents, donations, expenses, payouts, reports as reportsRepo } from '../repositories/index.js';
import * as adsService from '../services/ads.service.js';
import * as audit from '../services/audit.service.js';
import * as docs from '../services/documents.service.js';
import * as fund from '../services/fund.service.js';
import { isDemo, provider } from '../services/payments/index.js';
import * as privacy from '../services/privacy.service.js';
import * as reports from '../services/reports.service.js';
import * as settings from '../services/settings.service.js';
import * as staffService from '../services/staff.service.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { euros } from '../utils/money.js';
import { amount, body, email, id, optionalText, password, query, text } from '../validation/common.js';

const router = Router();

router.post('/entrar', staffLimiter, validate([email(), body('password').isString().notEmpty().isLength({ max: 128 })]), async (req, res) => {
  const { member, token } = await staffService.login(req.valid.body);
  await audit.record({ staff: member, ip: req.ip }, 'sessao.entrar', member.id);
  res.json({ member, token });
});

router.use(requireStaff);

router.get('/eu', async (req, res) => {
  const all = await staffService.list();
  res.json({ member: all.find((m) => m.id === req.staff.id), demo: isDemo, provider: provider.label });
});

router.patch('/eu/password', validate([body('currentPassword').isString().notEmpty(), password('newPassword')]), async (req, res) => {
  await staffService.changeOwnPassword(req.staff.id, req.valid.body);
  await audit.record(req, 'sessao.password', req.staff.id);
  res.json({ message: 'Palavra-passe alterada' });
});

// Contadores para a primeira página, só do que cada pessoa pode ver
router.get('/resumo', async (req, res) => {
  const s = req.staff;
  const out = {};
  if (can(s, 'moderar')) out.pendingAds = (await ads.findAll((a) => a.status === 'em_analise')).length;
  if (can(s, 'denuncias')) out.pendingReports = (await reportsRepo.findAll((r) => r.status === 'pendente')).length;
  if (can(s, 'utilizadores')) out.pendingDataRequests = (await dataRequests.findAll((r) => r.status === 'pendente')).length;
  if (can(s, 'fundos')) out.awaitingDeliveryCents = (await fund.transparency()).awaitingCents;
  if (can(s, 'plataforma')) out.fund = await fund.platformFund();
  if (s.role === 'dono') out.launch = await settings.launchStatus();
  res.json(out);
});

// Moderação
router.get('/anuncios', requirePermission('moderar'), validate([query('estado').optional().isIn(['em_analise', 'alteracoes', 'ativo', 'suspenso', 'recusado', 'concluido', 'todos'])], 'query'), async (req, res) => {
  res.json({ ads: await adsService.listForModeration(req.valid.query.estado ?? 'em_analise') });
});

router.post(
  '/anuncios/:id/decisao',
  requirePermission('moderar'),
  validate([
    id(),
    body('decision').isIn(['aprovar', 'alteracoes', 'recusar', 'suspender', 'reativar']),
    optionalText('note', 1000),
    body('checks').optional().isArray(),
  ]),
  async (req, res) => {
    const { decision, note, checks = [] } = req.valid.body;
    if (decision === 'aprovar' && !['sem_dados', 'coerente', 'categoria'].every((c) => checks.includes(c))) {
      throw new HttpError(400, 'Confirme os três pontos da verificação antes de aprovar');
    }
    if (decision !== 'aprovar' && decision !== 'reativar' && !note) throw new HttpError(400, 'Explique o motivo à pessoa');
    const ad = await adsService.review(req.params.id, req.staff, { decision, note });
    await audit.record(req, `anuncio.${decision}`, ad.id, note || ad.title);
    res.json({ ad });
  },
);

// Ver uma prova privada é sempre registado
router.get('/documentos/:id', requirePermission('documentos'), validate([id()]), async (req, res) => {
  const doc = await documents.findById(req.params.id);
  if (!doc) throw notFound('Prova');
  await audit.record(req, 'documento.ver', doc.id, doc.description);
  await docs.send(res, doc);
});

router.patch(
  '/documentos/:id',
  requirePermission('moderar'),
  validate([id(), body('verified').optional().isBoolean().toBoolean(), body('publicStatus').optional().isIn(['aprovado', 'recusado'])]),
  async (req, res) => {
    const doc = await documents.findById(req.params.id);
    if (!doc) throw notFound('Prova');
    const { verified, publicStatus } = req.valid.body;
    // Só se publica o que a pessoa autorizou explicitamente
    if (publicStatus === 'aprovado' && !doc.shareRequested) throw new HttpError(400, 'A pessoa não autorizou a partilha pública desta prova');
    const updated = await documents.update(doc.id, { ...(verified !== undefined && { verified }), ...(publicStatus && { publicStatus }) });
    await audit.record(req, 'documento.rever', doc.id, `${verified !== undefined ? `verificada: ${verified}` : ''} ${publicStatus ?? ''}`.trim());
    res.json({ document: docs.summary(updated) });
  },
);

// Denúncias
router.get('/denuncias', requirePermission('denuncias'), validate([query('estado').optional().isIn(['pendente', 'resolvida', 'todas'])], 'query'), async (req, res) => {
  res.json({ reports: await reports.list(req.valid.query.estado ?? 'pendente') });
});

router.post(
  '/denuncias/:id/resolver',
  requirePermission('denuncias'),
  validate([id(), body('resolution').isIn(['sem_fundamento', 'suspender', 'pedir_alteracoes']), optionalText('note', 600)]),
  async (req, res) => {
    const { resolution, note } = req.valid.body;
    const report = await reportsRepo.findById(req.params.id);
    if (!report) throw notFound('Denúncia');
    if (resolution !== 'sem_fundamento') {
      const ad = await ads.findById(report.adId);
      if (ad.status === 'ativo') await adsService.review(ad.id, req.staff, { decision: 'suspender', note: note || 'Suspenso depois de uma denúncia' });
      if (resolution === 'pedir_alteracoes') await adsService.review(ad.id, req.staff, { decision: 'alteracoes', note: note || 'Retire do texto a informação assinalada' });
    }
    const updated = await reports.resolve(req.params.id, req.staff, { resolution, note });
    await audit.record(req, `denuncia.${resolution}`, report.id, report.adId);
    res.json({ report: updated });
  },
);

// Doações e entregas
router.get('/doacoes', requirePermission('fundos'), async (req, res) => {
  const list = await donations.findAll((d) => d.status !== 'pendente');
  const adsById = new Map((await ads.findAll()).map((a) => [a.id, a]));
  res.json({
    donations: list
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 200)
      .map(({ donorId, publicName, ...d }) => ({ ...d, ad: adsById.get(d.adId)?.title })),
    summary: await fund.transparency(),
  });
});

router.get('/entregas', requirePermission('fundos'), async (req, res) => {
  const all = await adsService.listForModeration('todos');
  const delivered = await payouts.findAll();
  const rows = all
    .filter((a) => a.raisedCents > 0)
    .map((a) => {
      const deliveredCents = delivered.filter((p) => p.adId === a.id).reduce((s, p) => s + p.cents, 0);
      return { id: a.id, title: a.title, status: a.status, statusLabel: a.statusLabel, raisedCents: a.raisedCents, deliveredCents, pendingCents: a.raisedCents - deliveredCents };
    })
    .sort((a, b) => b.pendingCents - a.pendingCents);
  res.json({ ads: rows, payouts: delivered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

router.post(
  '/entregas',
  requirePermission('fundos'),
  validate([body('adId').isString().isLength({ max: 80 }), amount('amount', 1, 1000000, 'Montante inválido'), text('method', { min: 3, max: 120, message: 'Indique como foi entregue' }), optionalText('note', 300)]),
  async (req, res) => {
    const { adId, amount: cents, method, note } = req.valid.body;
    const [ad] = await adsService.listForModeration('todos').then((l) => l.filter((a) => a.id === adId));
    if (!ad) throw notFound('Pedido');
    const already = (await payouts.findAll((p) => p.adId === adId)).reduce((s, p) => s + p.cents, 0);
    if (already + cents > ad.raisedCents) throw new HttpError(400, `Só há ${euros(ad.raisedCents - already)} por entregar neste pedido`);
    const payout = await payouts.create({ adId, cents, method: isDemo ? `${method} (simulado)` : method, note: note ?? '', staffId: req.staff.id });
    await audit.record(req, 'entrega.registar', adId, `${euros(cents)} · ${method}`);
    res.status(201).json({ payout });
  },
);

// Custos da plataforma
router.get('/plataforma', requirePermission('plataforma'), async (req, res) => {
  res.json(await fund.platformFund());
});

router.post(
  '/despesas',
  requirePermission('plataforma'),
  validate([
    body('month', 'Mês inválido').matches(/^\d{4}-(0[1-9]|1[0-2])$/),
    text('label', { min: 3, max: 120, message: 'Descreva a despesa' }),
    amount('amount', 1, 500000, 'Montante inválido'),
    optionalText('note', 300),
  ]),
  async (req, res) => {
    const { month, label, amount: cents, note } = req.valid.body;
    const expense = await expenses.create({ month, label, cents, note: note ?? '', staffId: req.staff.id });
    await audit.record(req, 'despesa.registar', expense.id, `${label} · ${euros(cents)}`);
    res.status(201).json({ expense });
  },
);

// Contas e dados
router.get('/pedidos-dados', requirePermission('utilizadores'), async (req, res) => {
  res.json({ requests: await privacy.listRequests() });
});

router.post('/pedidos-dados/:id/concluir', requirePermission('utilizadores'), validate([id()]), async (req, res) => {
  const request = await privacy.processDeletion(req.params.id, req.staff);
  await audit.record(req, 'dados.eliminar', request.userId, 'Conta eliminada e doações anonimizadas');
  res.json({ request });
});

// Registo de ações
router.get('/registos', requirePermission('registos'), validate([query('staffId').optional().isString().isLength({ max: 80 }), query('action').optional().isString().isLength({ max: 40 })], 'query'), async (req, res) => {
  res.json({ entries: await audit.list(req.valid.query), staff: (await staffService.list()).map(({ id: sid, name }) => ({ id: sid, name })) });
});

// Equipa: só o dono cria credenciais e define permissões
router.get('/equipa', requireOwner, async (req, res) => {
  res.json({ staff: await staffService.list() });
});

const permissionRules = [body('permissions').optional().isArray(), body('permissions.*').isIn(STAFF_PERMISSIONS)];

router.post('/equipa', requireOwner, validate([text('name', { min: 2, max: 60, message: 'Escreva o nome' }), email(), password('password'), ...permissionRules]), async (req, res) => {
  const member = await staffService.create(req.valid.body);
  await audit.record(req, 'equipa.criar', member.id, `${member.name}: ${member.permissions.join(', ') || 'sem permissões'}`);
  res.status(201).json({ member });
});

router.patch('/equipa/:id', requireOwner, validate([id(), ...permissionRules, body('active').optional().isBoolean().toBoolean(), password('password').optional()]), async (req, res) => {
  const member = await staffService.update(req.params.id, req.valid.body);
  const what = [req.valid.body.permissions && `permissões: ${member.permissions.join(', ') || 'nenhuma'}`, typeof req.valid.body.active === 'boolean' && (member.active ? 'reativado' : 'desativado'), req.valid.body.password && 'nova palavra-passe'].filter(Boolean).join(' · ');
  await audit.record(req, 'equipa.alterar', member.id, `${member.name} · ${what}`);
  res.json({ member });
});

// Lançamento: comissões, custos mensais e o que falta decidir antes de aceitar dinheiro real
router.get('/lancamento', requireOwner, async (req, res) => {
  const s = await settings.get();
  res.json({ fees: s.fees, costs: s.costs, launch: await settings.launchStatus(), demo: isDemo });
});

router.patch(
  '/lancamento',
  requireOwner,
  validate([
    body('fees').optional().isObject(),
    body('fees.platformPercent').optional().isFloat({ min: 0, max: 15 }).toFloat(),
    body('fees.providerPercent').optional().isFloat({ min: 0, max: 10 }).toFloat(),
    body('fees.providerFixedCents').optional().isInt({ min: 0, max: 200 }).toInt(),
    body('fees.confirmed').optional().isBoolean().toBoolean(),
    body('costs').optional().isArray({ min: 1, max: 12 }),
    body('costs.*.id').isString().isLength({ min: 1, max: 40 }),
    body('costs.*.label').isString().trim().isLength({ min: 2, max: 80 }),
    body('costs.*.cents').isInt({ min: 0, max: 1000000 }).toInt(),
    body('launch').optional().isObject(),
  ]),
  async (req, res) => {
    const current = await settings.get();
    const { fees, costs, launch } = req.valid.body;
    const changes = {};
    if (fees) changes.fees = { ...current.fees, ...fees };
    if (costs) changes.costs = costs.map(({ id: cid, label, cents }) => ({ id: cid, label, cents }));
    if (launch) {
      const ids = new Set(LAUNCH_ITEMS.map(([lid]) => lid));
      changes.launch = { ...current.launch };
      for (const [key, value] of Object.entries(launch)) {
        if (!ids.has(key)) continue;
        changes.launch[key] = { done: Boolean(value?.done), note: String(value?.note ?? '').slice(0, 400) };
      }
    }
    await settings.update(changes);
    await audit.record(req, 'lancamento.alterar', 'plataforma', Object.keys(changes).join(', '));
    const s = await settings.get();
    res.json({ fees: s.fees, costs: s.costs, launch: await settings.launchStatus(), demo: isDemo });
  },
);

export default router;

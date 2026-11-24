import { RETENTION } from '../config/platform.js';
import { ads, contributions, conversations, dataRequests, documents, donations, messages, users } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { publicUser, revokeAllFor } from './auth.service.js';
import * as docs from './documents.service.js';

const DAY = 24 * 60 * 60 * 1000;

// Cópia de tudo o que a plataforma guarda sobre a pessoa (direito de acesso e portabilidade)
export async function exportFor(userId) {
  const [user, ownAds, ownDocs, given, support, convs] = await Promise.all([
    users.findById(userId),
    ads.findAll((a) => a.ownerId === userId),
    documents.findAll((d) => d.ownerId === userId),
    donations.findAll((d) => d.donorId === userId),
    contributions.findAll((c) => c.donorId === userId),
    conversations.findAll((c) => c.askerId === userId || c.ownerId === userId),
  ]);
  const convIds = new Set(convs.map((c) => c.id));
  const ownMessages = await messages.findAll((m) => convIds.has(m.conversationId) && m.authorId === userId);

  return {
    exportadoEm: new Date().toISOString(),
    conta: publicUser(user),
    anuncios: ownAds.map(({ reviews, ...a }) => ({ ...a, reviews: reviews.map(({ by, ...r }) => r) })),
    provas: ownDocs.map(({ storageName, ...d }) => d),
    doacoes: given,
    contribuicoesPlataforma: support,
    mensagensEnviadas: ownMessages,
  };
}

export async function requestDeletion(userId, reason) {
  const pending = await dataRequests.findOne((r) => r.userId === userId && r.status === 'pendente');
  if (pending) throw new HttpError(409, 'Já tem um pedido de eliminação em curso');
  return dataRequests.create({ userId, type: 'eliminacao', reason: reason ?? '', status: 'pendente' });
}

export async function pendingRequestFor(userId) {
  return dataRequests.findOne((r) => r.userId === userId && r.status === 'pendente');
}

export async function listRequests() {
  const list = await dataRequests.findAll();
  return Promise.all(
    list
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(async (r) => {
        const user = await users.findById(r.userId);
        const activeAds = await ads.findAll((a) => a.ownerId === r.userId && a.status === 'ativo');
        return { ...r, user: user && { email: user.email, name: user.name }, activeAds: activeAds.length };
      }),
  );
}

// Elimina a conta: apaga provas e mensagens, fecha os anúncios e tira o nome das doações.
// Os registos de pagamento ficam sem dados pessoais, porque podem ter de ser guardados por obrigação legal.
export async function processDeletion(requestId, staffMember) {
  const request = await dataRequests.findById(requestId);
  if (!request || request.status !== 'pendente') throw notFound('Pedido');
  await anonymize(request.userId);
  return dataRequests.update(requestId, { status: 'concluido', handledBy: staffMember.name, handledAt: new Date().toISOString() });
}

async function anonymize(userId) {
  for (const doc of await documents.findAll((d) => d.ownerId === userId)) await docs.removeFile(doc);
  for (const ad of await ads.findAll((a) => a.ownerId === userId)) {
    await ads.update(ad.id, {
      status: ['ativo', 'em_analise', 'alteracoes'].includes(ad.status) ? 'concluido' : ad.status,
      closedAt: ad.closedAt ?? new Date().toISOString(),
      alias: '',
      privateNote: '',
      story: 'Este anúncio foi retirado a pedido de quem o criou.',
      visibility: { ...ad.visibility, alias: false, district: false },
    });
  }
  const convs = await conversations.findAll((c) => c.askerId === userId || c.ownerId === userId);
  for (const c of convs) {
    for (const m of await messages.findAll((x) => x.conversationId === c.id)) await messages.remove(m.id);
    await conversations.remove(c.id);
  }
  for (const d of await donations.findAll((x) => x.donorId === userId)) await donations.update(d.id, { donorId: null, showName: false, publicName: '' });
  for (const c of await contributions.findAll((x) => x.donorId === userId)) await contributions.update(c.id, { donorId: null, showName: false, publicName: '' });
  await revokeAllFor(userId);
  await users.update(userId, { name: 'Conta eliminada', email: `eliminada-${userId}@invalid`, passwordHash: '', deletedAt: new Date().toISOString() });
}

// Corre uma vez por dia: apaga provas de anúncios fechados há mais tempo do que o prazo
export async function purgeExpired() {
  const limit = Date.now() - RETENTION.documentsAfterCloseDays * DAY;
  const closed = await ads.findAll((a) => ['concluido', 'recusado'].includes(a.status) && a.closedAt && new Date(a.closedAt).getTime() < limit);
  const ids = new Set(closed.map((a) => a.id));
  for (const doc of await documents.findAll((d) => ids.has(d.adId))) await docs.removeFile(doc);

  const msgLimit = Date.now() - RETENTION.messagesAfterCloseDays * DAY;
  for (const c of await conversations.findAll((x) => ['fechada', 'recusada'].includes(x.status) && new Date(x.updatedAt).getTime() < msgLimit)) {
    for (const m of await messages.findAll((x) => x.conversationId === c.id)) await messages.remove(m.id);
    await conversations.remove(c.id);
  }
}

import { AD_STATUS, CATEGORIES, categoryLabel } from '../config/platform.js';
import { ads, documents, donations } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { findSensitive, maskSensitive } from '../utils/sensitive.js';
import { slugify } from '../utils/slug.js';

export const CONFIRMED = new Set(['pago', 'simulado']);
const EDITABLE = new Set(['em_analise', 'alteracoes', 'ativo']);
const VISIBILITY_KEYS = ['alias', 'district', 'deadline', 'proofs', 'donors'];

async function totals(adId) {
  const list = await donations.findAll((d) => d.adId === adId && CONFIRMED.has(d.status));
  return { raised: list.reduce((s, d) => s + d.amountCents, 0), list };
}

const isImage = (mime) => mime?.startsWith('image/');

// A única forma de um pedido sair para o público: só passam os campos escolhidos por quem o criou.
// Nunca inclui o dono, a nota privada, as notas da moderação nem os ficheiros das provas privadas.
export async function publicView(ad) {
  const { raised, list } = await totals(ad.id);
  const v = ad.visibility;
  const proofs = v.proofs ? await documents.findAll((d) => d.adId === ad.id && d.verified) : [];
  const named = list.filter((d) => d.showName).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    id: ad.id,
    slug: ad.slug,
    title: ad.title,
    category: ad.category,
    categoryLabel: categoryLabel(ad.category),
    story: ad.story,
    status: ad.status,
    amountCents: ad.amountCents,
    raisedCents: raised,
    remainingCents: Math.max(0, ad.amountCents - raised),
    percent: Math.min(100, Math.round((raised / ad.amountCents) * 100)),
    donationsCount: list.length,
    alias: v.alias && ad.alias ? ad.alias : null,
    district: v.district ? ad.district : null,
    deadline: v.deadline ? ad.deadline : null,
    updates: ad.updates,
    proofs: proofs.map((d) => ({ id: d.id, description: d.description, image: d.publicStatus === 'aprovado' && isImage(d.mime) })),
    donors: v.donors ? { named: named.map((d) => ({ name: d.publicName, at: d.createdAt })), anonymous: list.length - named.length } : null,
    publishedAt: ad.publishedAt,
    closedAt: ad.closedAt,
    example: Boolean(ad.example),
  };
}

const VISIBLE = new Set(['ativo', 'concluido']);

export async function listPublic({ categoria, distrito, q, ordem } = {}) {
  const term = q?.trim().toLowerCase();
  const list = await ads.findAll(
    (a) =>
      VISIBLE.has(a.status) &&
      (!categoria || a.category === categoria) &&
      (!distrito || (a.visibility.district && a.district === distrito)) &&
      (!term || `${a.title} ${a.story}`.toLowerCase().includes(term)),
  );
  const views = await Promise.all(list.map(publicView));
  const active = views.filter((a) => a.status === 'ativo');
  const done = views.filter((a) => a.status === 'concluido');

  const sorters = {
    falta: (a, b) => a.remainingCents - b.remainingCents,
    prazo: (a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'),
    recentes: (a, b) => b.publishedAt.localeCompare(a.publishedAt),
  };
  active.sort(sorters[ordem] ?? sorters.recentes);
  done.sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''));
  return { active, done };
}

export async function findPublicBySlug(slug) {
  const ad = await ads.findOne((a) => a.slug === slug && VISIBLE.has(a.status));
  return ad ? publicView(ad) : null;
}

export async function findPublicProof(slug, docId) {
  const ad = await ads.findOne((a) => a.slug === slug && VISIBLE.has(a.status));
  const doc = ad && (await documents.findById(docId));
  if (!doc || doc.adId !== ad.id || !ad.visibility.proofs || !doc.verified || doc.publicStatus !== 'aprovado' || !isImage(doc.mime)) {
    throw notFound('Prova');
  }
  return doc;
}

const cleanVisibility = (v = {}) => Object.fromEntries(VISIBILITY_KEYS.map((k) => [k, v[k] !== false]));

async function uniqueSlug(title, id) {
  const base = slugify(title) || 'pedido';
  let slug = base;
  for (let n = 2; await ads.findOne((a) => a.slug === slug && a.id !== id); n++) slug = `${base}-${n}`;
  return slug;
}

// Contactos ou números de identificação no texto: avisa quem escreve e assinala à moderação
export const scan = ({ title = '', story = '', alias = '' }) => findSensitive(`${title}\n${story}\n${alias}`);

export async function create(ownerId, data) {
  const flags = scan(data);
  return ads.create({
    ownerId,
    slug: await uniqueSlug(data.title),
    status: 'em_analise',
    title: data.title,
    story: data.story,
    category: data.category,
    amountCents: data.amountCents,
    deadline: data.deadline || null,
    alias: data.alias ?? '',
    district: data.district,
    visibility: cleanVisibility(data.visibility),
    privateNote: data.privateNote ?? '',
    flags,
    updates: [],
    reviews: [],
    publishedAt: null,
    closedAt: null,
  });
}

export async function ownedBy(ownerId, id) {
  const ad = await ads.findById(id);
  if (!ad || ad.ownerId !== ownerId) throw notFound('Pedido');
  return ad;
}

export async function listOwned(ownerId) {
  const list = await ads.findAll((a) => a.ownerId === ownerId);
  const withTotals = await Promise.all(
    list.map(async (ad) => {
      const pub = await publicView(ad);
      const docs = await documents.findAll((d) => d.adId === ad.id);
      // Quem moderou fica no registo da equipa; a pessoa vê só a decisão e a nota
      const reviews = ad.reviews.map(({ by, ...r }) => r);
      return {
        ...ad,
        reviews,
        statusLabel: AD_STATUS[ad.status],
        raisedCents: pub.raisedCents,
        remainingCents: pub.remainingCents,
        percent: pub.percent,
        donationsCount: pub.donationsCount,
        lastReview: reviews.at(-1) ?? null,
        documents: docs.map(({ storageName, ownerId: o, ...d }) => d),
      };
    }),
  );
  return withTotals.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function update(ownerId, id, data) {
  const ad = await ownedBy(ownerId, id);
  if (!EDITABLE.has(ad.status)) throw new HttpError(400, 'Este pedido já não pode ser alterado');

  const next = {
    title: data.title,
    story: data.story,
    category: data.category,
    amountCents: data.amountCents,
    deadline: data.deadline || null,
    alias: data.alias ?? '',
    district: data.district,
    visibility: cleanVisibility(data.visibility),
    privateNote: data.privateNote ?? ad.privateNote,
  };
  // Mudar o que o público vê obriga a nova moderação; o pedido sai do ar até ser aprovado
  return ads.update(id, { ...next, slug: await uniqueSlug(next.title, id), flags: scan(next), status: 'em_analise' });
}

export async function close(ownerId, id) {
  const ad = await ownedBy(ownerId, id);
  if (ad.status === 'concluido' || ad.status === 'recusado') throw new HttpError(400, 'Este pedido já está fechado');
  return ads.update(id, { status: 'concluido', closedAt: new Date().toISOString() });
}

export async function addUpdate(ownerId, id, text) {
  const ad = await ownedBy(ownerId, id);
  if (ad.status !== 'ativo') throw new HttpError(400, 'Só pode publicar atualizações num pedido ativo');
  const masked = maskSensitive(text);
  await ads.update(id, { updates: [...ad.updates, { at: new Date().toISOString(), text: masked.text }] });
  return { masked: masked.changed };
}

// Chamado depois de cada doação confirmada
export async function closeIfFunded(adId) {
  const ad = await ads.findById(adId);
  const { raised } = await totals(adId);
  if (ad?.status === 'ativo' && raised >= ad.amountCents) {
    await ads.update(adId, {
      status: 'concluido',
      closedAt: new Date().toISOString(),
      updates: [...ad.updates, { at: new Date().toISOString(), text: 'O montante pedido foi atingido. Obrigado a todas as pessoas que ajudaram.', automatic: true }],
    });
  }
}

export async function remaining(adId) {
  const ad = await ads.findById(adId);
  const { raised } = await totals(adId);
  return Math.max(0, ad.amountCents - raised);
}

// Moderação
export async function listForModeration(status = 'em_analise') {
  const list = await ads.findAll((a) => (status === 'todos' ? true : a.status === status));
  return Promise.all(
    list
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(async (ad) => ({
        ...ad,
        statusLabel: AD_STATUS[ad.status],
        categoryLabel: categoryLabel(ad.category),
        documents: (await documents.findAll((d) => d.adId === ad.id)).map(({ storageName, ...d }) => d),
        raisedCents: (await totals(ad.id)).raised,
      })),
  );
}

export async function review(id, staffMember, { decision, note }) {
  const ad = await ads.findById(id);
  if (!ad) throw notFound('Pedido');

  const status = { aprovar: 'ativo', alteracoes: 'alteracoes', recusar: 'recusado', suspender: 'suspenso', reativar: 'ativo' }[decision];
  const allowed = {
    aprovar: ['em_analise'],
    alteracoes: ['em_analise', 'suspenso'],
    recusar: ['em_analise', 'alteracoes', 'suspenso'],
    suspender: ['ativo'],
    reativar: ['suspenso'],
  }[decision];
  if (!allowed.includes(ad.status)) throw new HttpError(400, `Não é possível ${decision} um pedido "${AD_STATUS[ad.status]}"`);

  return ads.update(id, {
    status,
    publishedAt: status === 'ativo' ? (ad.publishedAt ?? new Date().toISOString()) : ad.publishedAt,
    reviews: [...ad.reviews, { decision, note: note ?? '', by: staffMember.name, at: new Date().toISOString() }],
  });
}

export const categoryIds = CATEGORIES.map(([id]) => id);

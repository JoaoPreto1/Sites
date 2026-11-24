import { LIMITS } from '../config/platform.js';
import { ads, contributions, donations, users } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { feeFor, grossUp } from '../utils/money.js';
import { maskSensitive } from '../utils/sensitive.js';
import * as adsService from './ads.service.js';
import * as settings from './settings.service.js';
import { isDemo, provider } from './payments/index.js';

// Doar para um anúncio: o resumo é calculado aqui e é o mesmo que a pessoa vê antes de confirmar
export async function quote({ adId, amountCents, coverFee }) {
  const ad = await ads.findById(adId);
  if (!ad || ad.status !== 'ativo') throw new HttpError(400, 'Este pedido não está a receber doações');

  const fees = await settings.fees();
  const remaining = await adsService.remaining(adId);
  const charged = coverFee ? grossUp(amountCents, fees) : amountCents;
  const fee = feeFor(charged, fees);
  const toAd = charged - fee.total;

  return {
    adId,
    chargedCents: charged,
    feeCents: fee.total,
    providerFeeCents: fee.provider,
    platformFeeCents: fee.platform,
    toAdCents: toAd,
    remainingCents: remaining,
    exceeds: toAd > remaining,
    feesConfirmed: fees.confirmed,
    demo: isDemo,
  };
}

const displayName = (name) => maskSensitive(String(name ?? '').trim().slice(0, 40)).text;

export async function start(userId, { adId, amountCents, coverFee, showName, publicName }) {
  const ad = await ads.findById(adId);
  if (!ad) throw notFound('Pedido');
  if (ad.ownerId === userId) throw new HttpError(400, 'Não pode doar para o seu próprio pedido');

  const q = await quote({ adId, amountCents, coverFee });
  if (q.toAdCents <= 0) throw new HttpError(400, 'O montante não chega para cobrir a comissão');
  if (q.exceeds) throw new HttpError(400, `Este pedido só precisa de mais ${(q.remainingCents / 100).toFixed(2).replace('.', ',')} €`);

  const user = await users.findById(userId);
  const donation = await donations.create({
    adId,
    donorId: userId,
    amountCents: q.toAdCents,
    feeCents: q.feeCents,
    chargedCents: q.chargedCents,
    coverFee: Boolean(coverFee),
    showName: Boolean(showName),
    publicName: showName ? displayName(publicName || user.name.split(' ')[0]) : '',
    status: 'pendente',
    provider: provider.id,
  });

  const checkout = await provider.createCheckout({ kind: 'doacao', id: donation.id, chargedCents: q.chargedCents, description: ad.title });
  await donations.update(donation.id, { reference: checkout.reference });
  return { id: donation.id, redirectUrl: checkout.redirectUrl };
}

export async function startContribution(userId, { amountCents, showName, publicName }) {
  if (amountCents < LIMITS.contributionMinCents) throw new HttpError(400, 'O mínimo é 1 €');
  const user = await users.findById(userId);
  const contribution = await contributions.create({
    donorId: userId,
    amountCents,
    showName: Boolean(showName),
    publicName: showName ? displayName(publicName || user.name.split(' ')[0]) : '',
    status: 'pendente',
    provider: provider.id,
  });
  const checkout = await provider.createCheckout({ kind: 'plataforma', id: contribution.id, chargedCents: amountCents, description: 'Manter a plataforma' });
  await contributions.update(contribution.id, { reference: checkout.reference });
  return { id: contribution.id, redirectUrl: checkout.redirectUrl };
}

const repoFor = (kind) => (kind === 'doacao' ? donations : contributions);

export async function findOwnPayment(kind, id, userId) {
  const item = await repoFor(kind).findById(id);
  if (!item || item.donorId !== userId) throw notFound(kind === 'doacao' ? 'Doação' : 'Contribuição');
  return item;
}

// Só existe em modo de demonstração: marca como "simulado", nunca como "pago"
export async function simulate(kind, id, userId, outcome) {
  if (!isDemo) throw new HttpError(404, 'Endpoint não encontrado');
  const item = await findOwnPayment(kind, id, userId);
  if (item.status !== 'pendente') throw new HttpError(400, 'Esta simulação já foi concluída');

  if (kind === 'doacao' && outcome === 'concluir') {
    const remaining = await adsService.remaining(item.adId);
    if (item.amountCents > remaining) {
      await donations.update(id, { status: 'falhado', failure: 'O pedido entretanto atingiu o montante' });
      throw new HttpError(409, 'Entretanto o pedido recebeu o que faltava. Nada foi cobrado.');
    }
  }

  const status = outcome === 'concluir' ? 'simulado' : 'falhado';
  const updated = await repoFor(kind).update(id, { status, confirmedAt: status === 'simulado' ? new Date().toISOString() : null });
  if (kind === 'doacao' && status === 'simulado') await adsService.closeIfFunded(item.adId);
  return updated;
}

export async function receipt(kind, id, userId) {
  const item = await findOwnPayment(kind, id, userId);
  const ad = kind === 'doacao' ? await ads.findById(item.adId) : null;
  return { kind, ...item, ad: ad && { title: ad.title, slug: ad.slug, status: ad.status } };
}

export async function listByDonor(userId) {
  const [own, support] = await Promise.all([
    donations.findAll((d) => d.donorId === userId && d.status !== 'pendente'),
    contributions.findAll((c) => c.donorId === userId && c.status !== 'pendente'),
  ]);
  const withAd = await Promise.all(
    own.map(async (d) => {
      const ad = await ads.findById(d.adId);
      return { ...d, kind: 'doacao', ad: ad && { title: ad.title, slug: ad.slug, status: ad.status } };
    }),
  );
  return [...withAd, ...support.map((c) => ({ ...c, kind: 'plataforma' }))].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

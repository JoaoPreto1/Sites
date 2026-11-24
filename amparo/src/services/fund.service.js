import { CATEGORIES } from '../config/platform.js';
import { ads, contributions, donations, expenses, payouts } from '../repositories/index.js';
import { CONFIRMED } from './ads.service.js';
import * as settings from './settings.service.js';

const sum = (list, key = 'amountCents') => list.reduce((s, x) => s + x[key], 0);
const monthOf = (iso) => iso.slice(0, 7);
const thisMonth = () => new Date().toISOString().slice(0, 7);

// Fundo da plataforma: separado do dinheiro dos anúncios, só cobre custos de funcionamento
export async function platformFund() {
  const { costs } = await settings.get();
  const monthlyCents = costs.reduce((s, c) => s + c.cents, 0);
  const received = await contributions.findAll((c) => CONFIRMED.has(c.status));
  const spent = await expenses.findAll();

  const receivedCents = sum(received);
  const spentCents = sum(spent, 'cents');
  const balanceCents = receivedCents - spentCents;
  const monthCents = sum(received.filter((c) => monthOf(c.confirmedAt ?? c.createdAt) === thisMonth()));

  return {
    costs,
    monthlyCents,
    receivedCents,
    spentCents,
    balanceCents,
    monthsCovered: monthlyCents ? Math.max(0, Math.floor((balanceCents / monthlyCents) * 10) / 10) : 0,
    month: thisMonth(),
    monthCents,
    monthPercent: monthlyCents ? Math.min(100, Math.round((monthCents / monthlyCents) * 100)) : 0,
    contributionsCount: received.length,
    supporters: received
      .filter((c) => c.showName)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 12)
      .map((c) => ({ name: c.publicName, at: c.createdAt })),
    expenses: spent.sort((a, b) => b.month.localeCompare(a.month)).map(({ staffId, ...e }) => e),
  };
}

// Números agregados para a página de transparência: nenhum nome, nenhum pedido identificado
export async function transparency() {
  const [allAds, confirmed, delivered, fund] = await Promise.all([
    ads.findAll((a) => a.status !== 'em_analise'),
    donations.findAll((d) => CONFIRMED.has(d.status)),
    payouts.findAll(),
    platformFund(),
  ]);
  const adById = new Map(allAds.map((a) => [a.id, a]));

  const byCategory = CATEGORIES.map(([id, label]) => {
    const inCat = confirmed.filter((d) => adById.get(d.adId)?.category === id);
    return { id, label, raisedCents: sum(inCat), ads: allAds.filter((a) => a.category === id && ['ativo', 'concluido'].includes(a.status)).length };
  });

  const months = [...new Set(confirmed.map((d) => monthOf(d.confirmedAt ?? d.createdAt)))].sort().slice(-6);
  const byMonth = months.map((m) => ({
    month: m,
    raisedCents: sum(confirmed.filter((d) => monthOf(d.confirmedAt ?? d.createdAt) === m)),
    deliveredCents: sum(delivered.filter((p) => monthOf(p.createdAt) === m), 'cents'),
  }));

  const raisedCents = sum(confirmed);
  const deliveredCents = sum(delivered, 'cents');
  const count = (s) => allAds.filter((a) => a.status === s).length;

  return {
    raisedCents,
    deliveredCents,
    awaitingCents: raisedCents - deliveredCents,
    feesCents: sum(confirmed, 'feeCents'),
    donationsCount: confirmed.length,
    ads: { active: count('ativo'), done: count('concluido'), refused: count('recusado'), suspended: count('suspenso') },
    byCategory,
    byMonth,
    fund,
  };
}

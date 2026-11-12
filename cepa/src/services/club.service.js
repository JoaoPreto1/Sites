import { clubBoxes, subscriptions, users, wines } from '../repositories/index.js';
import { CLUB_PLANS } from '../data/seed.js';
import { today } from '../utils/dates.js';
import { HttpError, notFound } from '../utils/httpError.js';

export const PREFERENCES = ['misto', 'tintos', 'brancos'];
export const SUBSCRIPTION_STATUSES = ['ativa', 'em pausa'];

async function expandBox(box) {
  const picks = await Promise.all(
    box.picks.map(async ({ wineId, note }) => {
      const wine = await wines.findById(wineId);
      return wine && { note, wine: { id: wine.id, slug: wine.slug, name: wine.name, year: wine.year, type: wine.type, price: wine.price, shape: wine.shape, label: wine.label } };
    }),
  );
  return { ...box, picks: picks.filter(Boolean) };
}

export async function overview() {
  const boxes = (await clubBoxes.findAll()).sort((a, b) => b.month.localeCompare(a.month));
  const [current, ...past] = await Promise.all(boxes.map(expandBox));
  return { plans: CLUB_PLANS, current, past };
}

const firstOfNextMonth = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
};

const decorate = (s) => s && { ...s, planInfo: CLUB_PLANS.find((p) => p.slug === s.plan), nextBox: s.status === 'ativa' ? firstOfNextMonth() : null };

export async function mine(userId) {
  return decorate(await subscriptions.findOne((s) => s.userId === userId && s.status !== 'cancelada'));
}

export async function subscribe(userId, { plan, preference }) {
  const user = await users.findById(userId);
  if (!user.address) throw new HttpError(400, 'Preencha primeiro a morada de entrega na sua conta');
  if (await mine(userId)) throw new HttpError(409, 'Já é sócio do clube. Pode mudar o plano na sua conta.');
  return decorate(await subscriptions.create({ userId, plan, preference, status: 'ativa', since: today() }));
}

export async function update(userId, changes) {
  const current = await mine(userId);
  if (!current) throw notFound('Subscrição');
  return decorate(await subscriptions.update(current.id, changes));
}

export async function members() {
  const [list, people] = await Promise.all([subscriptions.findAll((s) => s.status !== 'cancelada'), users.findAll()]);
  const byId = Object.fromEntries(people.map((u) => [u.id, u]));
  return list.map((s) => ({ ...decorate(s), name: byId[s.userId]?.name, email: byId[s.userId]?.email, city: byId[s.userId]?.city }));
}

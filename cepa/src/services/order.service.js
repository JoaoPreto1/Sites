import { randomInt } from 'node:crypto';
import { orders, subscriptions, users, wines } from '../repositories/index.js';
import { CLUB_PLANS } from '../data/seed.js';
import { shop } from '../config/shop.js';
import { round } from '../utils/money.js';
import { HttpError, notFound } from '../utils/httpError.js';

export const ORDER_STATUSES = ['recebida', 'em preparação', 'enviada', 'pronta a levantar', 'entregue', 'cancelada'];

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => `CP-${Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')}`;

export async function memberDiscount(userId) {
  const subscription = await subscriptions.findOne((s) => s.userId === userId && s.status === 'ativa');
  return CLUB_PLANS.find((p) => p.slug === subscription?.plan)?.discount ?? 0;
}

const merge = (items) =>
  Object.values(
    items.reduce((acc, { wineId, quantity }) => {
      acc[wineId] = { wineId, quantity: (acc[wineId]?.quantity ?? 0) + quantity };
      return acc;
    }, {}),
  );

// Calcula o cesto com os preços atuais do servidor (nunca confia nos preços do browser)
export async function quote(items, { userId, method = 'envio' } = {}) {
  const lines = [];
  for (const { wineId, quantity } of merge(items)) {
    const wine = await wines.findById(wineId);
    if (!wine) throw new HttpError(400, 'Um dos vinhos do cesto já não existe');
    if (wine.stock < quantity) {
      throw new HttpError(409, wine.stock ? `Só temos ${wine.stock} garrafas de ${wine.name}` : `${wine.name} esgotou entretanto`);
    }
    lines.push({ wineId, name: wine.year ? `${wine.name} ${wine.year}` : wine.name, price: wine.price, quantity });
  }

  const subtotal = round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
  const percent = userId ? await memberDiscount(userId) : 0;
  const discount = round((subtotal * percent) / 100);
  const shipping = method === 'loja' || subtotal - discount >= shop.freeShippingFrom ? 0 : shop.shippingCost;

  return { items: lines, subtotal, discountPercent: percent, discount, shipping, total: round(subtotal - discount + shipping) };
}

export async function createOrder(userId, { items, delivery }) {
  const user = await users.findById(userId);
  if (!user) throw notFound('Conta');

  const { discountPercent, ...totals } = await quote(items, { userId, method: delivery.method });
  for (const line of totals.items) {
    const wine = await wines.findById(line.wineId);
    await wines.update(wine.id, { stock: wine.stock - line.quantity });
  }

  return orders.create({ code: newCode(), userId, status: 'recebida', ...totals, delivery });
}

export async function listFor(userId) {
  const list = await orders.findAll((o) => o.userId === userId);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function changeStatus(id, status) {
  const order = await orders.findById(id);
  if (!order) throw notFound('Encomenda');
  if (order.status === 'cancelada') throw new HttpError(409, 'Esta encomenda já foi cancelada');

  if (status === 'cancelada') {
    for (const line of order.items) {
      const wine = await wines.findById(line.wineId);
      if (wine) await wines.update(wine.id, { stock: wine.stock + line.quantity });
    }
  }
  return orders.update(id, { status });
}

export async function cancelOwn(userId, id) {
  const order = await orders.findById(id);
  if (!order || order.userId !== userId) throw notFound('Encomenda');
  if (order.status !== 'recebida') throw new HttpError(409, 'Já começámos a preparar esta encomenda. Ligue-nos para a cancelar.');
  return changeStatus(id, 'cancelada');
}

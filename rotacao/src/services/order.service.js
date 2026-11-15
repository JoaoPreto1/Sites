import { shop } from '../config/shop.js';
import { orders, records, users } from '../repositories/index.js';
import { round } from '../utils/dates.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { publicRecord } from './catalog.service.js';

export const STATUSES = ['paga', 'pronta', 'enviada', 'entregue', 'cancelada'];

// Os preços vêm sempre do servidor; o browser só diz que discos e quantos
export async function quote(items, method = 'envio') {
  const lines = [];
  const problems = [];

  for (const { recordId, quantity } of items) {
    const record = await records.findById(recordId);
    if (!record) {
      problems.push({ recordId, message: 'Este disco já não está na loja' });
      continue;
    }
    const available = Math.min(record.stock, shop.maxPerRecord);
    if (available === 0) problems.push({ recordId, message: `${record.title} esgotou entretanto` });
    else if (quantity > available) problems.push({ recordId, message: `Só temos ${available} de ${record.title}` });
    lines.push({ record: publicRecord(record), quantity: Math.min(quantity, available), available });
  }

  const subtotal = round(lines.reduce((s, l) => s + l.record.price * l.quantity, 0));
  const shipping = method === 'envio' && subtotal > 0 && subtotal < shop.freeShippingFrom ? shop.shippingCost : 0;
  return { lines, problems, subtotal, shipping, total: round(subtotal + shipping), freeShippingFrom: shop.freeShippingFrom };
}

export async function create(userId, { items, method, address, postalCode, city, notes }) {
  const result = await quote(items, method);
  if (result.problems.length) throw new HttpError(409, result.problems[0].message, result.problems);
  const lines = result.lines.filter((l) => l.quantity > 0);
  if (!lines.length) throw new HttpError(400, 'O saco está vazio');

  for (const { record, quantity } of lines) {
    const current = await records.findById(record.id);
    await records.update(record.id, { stock: current.stock - quantity });
  }

  const all = await orders.findAll();
  const number = Math.max(1000, ...all.map((o) => o.number)) + 1;
  if (method === 'envio') await users.update(userId, { address, postalCode, city });

  return orders.create({
    number,
    userId,
    items: lines.map(({ record, quantity }) => ({ recordId: record.id, title: record.title, artist: record.artist, price: record.price, quantity })),
    subtotal: result.subtotal,
    shipping: result.shipping,
    total: result.total,
    method,
    address: method === 'envio' ? `${address}, ${postalCode} ${city}` : '',
    notes: notes ?? '',
    status: 'paga',
  });
}

export const mine = async (userId) => (await orders.findAll((o) => o.userId === userId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export async function all() {
  const [list, people] = await Promise.all([orders.findAll(), users.findAll()]);
  const name = Object.fromEntries(people.map((u) => [u.id, u.name]));
  return list.map((o) => ({ ...o, customer: name[o.userId] ?? '—' })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setStatus(id, status) {
  const order = await orders.findById(id);
  if (!order) throw notFound('Encomenda');
  if (order.status === 'cancelada') throw new HttpError(409, 'Esta encomenda já foi cancelada');

  // Cancelar devolve os discos ao caixote
  if (status === 'cancelada') {
    for (const item of order.items) {
      const record = await records.findById(item.recordId);
      if (record) await records.update(record.id, { stock: record.stock + item.quantity });
    }
  }
  return orders.update(id, { status });
}

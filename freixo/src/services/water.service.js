import * as repo from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';

export async function forUser(userId) {
  const invoices = (await repo.invoices.findAll((f) => f.userId === userId)).sort((a, b) => b.period.localeCompare(a.period));
  const readings = (await repo.readings.findAll((l) => l.userId === userId)).sort((a, b) => b.at.localeCompare(a.at));
  return { invoices, readings, due: invoices.filter((f) => !f.paid).reduce((sum, f) => sum + f.amount, 0) };
}

// Pagamento de demonstração: num site real seria feito pelo prestador de pagamentos
export async function pay(userId, id) {
  const invoice = await repo.invoices.findById(id);
  if (!invoice || invoice.userId !== userId) throw notFound('Fatura');
  if (invoice.paid) throw new HttpError(409, 'Esta fatura já está paga');
  return repo.invoices.update(id, { paid: true, paidAt: new Date().toISOString() });
}

export async function addReading(userId, value) {
  const [last] = (await repo.readings.findAll((l) => l.userId === userId)).sort((a, b) => b.at.localeCompare(a.at));
  if (last && value < last.value) throw new HttpError(400, `A leitura não pode ser menor do que a anterior (${last.value} m³)`, [{ field: 'value', message: `Mínimo ${last.value}` }]);
  // Fora dos dias 20 a 25 também se aceita: conta para a fatura seguinte
  return repo.readings.create({ userId, value, at: new Date().toISOString() });
}

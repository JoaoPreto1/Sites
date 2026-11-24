import { LAUNCH_ITEMS } from '../config/platform.js';
import { settings } from '../repositories/index.js';

export const get = () => settings.findById('plataforma');

export async function fees() {
  return (await get()).fees;
}

export async function monthlyCostCents() {
  return (await get()).costs.reduce((sum, c) => sum + c.cents, 0);
}

export async function update(changes) {
  return settings.update('plataforma', changes);
}

export async function launchStatus() {
  const { launch } = await get();
  const items = LAUNCH_ITEMS.map(([id, title, text]) => ({ id, title, text, ...launch[id] }));
  return { items, ready: items.every((i) => i.done), pending: items.filter((i) => !i.done).length };
}

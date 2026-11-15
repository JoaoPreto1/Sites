// O saco vive no browser até à encomenda; os preços e o stock vêm sempre do servidor
const KEY = 'rotacao.bag';
const MAX = 3;

function read() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY)) ?? [];
    return Array.isArray(items) ? items.filter((i) => i?.recordId && i.quantity > 0) : [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  document.dispatchEvent(new CustomEvent('bag:change', { detail: items }));
}

export const bagItems = read;

export const bagCount = () => read().reduce((sum, i) => sum + i.quantity, 0);

export function addToBag(recordId, quantity = 1) {
  const items = read();
  const line = items.find((i) => i.recordId === recordId);
  if (line) line.quantity = Math.min(MAX, line.quantity + quantity);
  else items.push({ recordId, quantity: Math.min(MAX, quantity) });
  write(items);
}

export function setQuantity(recordId, quantity) {
  write(
    read()
      .map((i) => (i.recordId === recordId ? { ...i, quantity: Math.min(MAX, quantity) } : i))
      .filter((i) => i.quantity > 0),
  );
}

export const removeFromBag = (recordId) => write(read().filter((i) => i.recordId !== recordId));

export const clearBag = () => write([]);

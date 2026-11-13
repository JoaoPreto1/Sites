// O cesto vive no browser até à encomenda; os preços vêm sempre do servidor
const KEY = 'cepa.cart';
const MAX = 24;

function read() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY)) ?? [];
    return Array.isArray(items) ? items.filter((i) => i?.wineId && i.quantity > 0) : [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  document.dispatchEvent(new CustomEvent('cart:change', { detail: items }));
}

export const cartItems = read;

export const cartCount = () => read().reduce((sum, i) => sum + i.quantity, 0);

export function addToCart(wineId, quantity = 1) {
  const items = read();
  const line = items.find((i) => i.wineId === wineId);
  if (line) line.quantity = Math.min(MAX, line.quantity + quantity);
  else items.push({ wineId, quantity: Math.min(MAX, quantity) });
  write(items);
}

export function setQuantity(wineId, quantity) {
  const items = read()
    .map((i) => (i.wineId === wineId ? { ...i, quantity: Math.min(MAX, quantity) } : i))
    .filter((i) => i.quantity > 0);
  write(items);
}

export const removeFromCart = (wineId) => write(read().filter((i) => i.wineId !== wineId));

export const clearCart = () => write([]);

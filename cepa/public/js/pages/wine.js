import { addToCart } from '../cart.js';
import { toast } from '../utils.js';

const form = document.querySelector('[data-buy]');
const input = form?.quantity;

if (input) {
  const clamp = (value) => Math.max(1, Math.min(Number(input.max), Math.round(value) || 1));

  form.addEventListener('click', (event) => {
    const step = event.target.closest('[data-step]');
    if (step) input.value = clamp(Number(input.value) + Number(step.dataset.step));
  });

  input.addEventListener('change', () => {
    input.value = clamp(Number(input.value));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const quantity = clamp(Number(input.value));
    addToCart(form.dataset.wine, quantity);
    toast(`${quantity} × ${form.dataset.name} no cesto.`, { link: { href: '/cesto', label: 'Ver cesto' } });
  });
}

import { api } from '../api.js';
import { pairingResult } from '../shared/carta.js';
import { initialData } from '../utils.js';

const form = document.querySelector('[data-pairing]');
const result = document.querySelector('[data-pairing-result]');
let request = 0;

async function suggest() {
  const { prato, pessoas, orcamento } = Object.fromEntries(new FormData(form));
  const query = new URLSearchParams({ prato, pessoas });
  if (orcamento) query.set('orcamento', orcamento);

  const id = ++request;
  result.classList.add('is-loading');
  try {
    const data = await api(`/wines/pairing?${query}`);
    if (id === request) result.innerHTML = pairingResult(data);
  } catch {
    if (id === request) result.innerHTML = '<p class="pairing__empty">Não conseguimos sugerir agora. Tente outra vez daqui a nada.</p>';
  } finally {
    if (id === request) result.classList.remove('is-loading');
  }
}

form?.addEventListener('change', suggest);

// Ao voltar à página, o browser pode repor escolhas antigas nos menus: nesse caso a sugestão tem de acompanhar
const shown = initialData()?.pairing;
if (form && shown) {
  const { prato, pessoas, orcamento } = Object.fromEntries(new FormData(form));
  if (prato !== shown.dish.slug || Number(pessoas) !== shown.people || String(orcamento) !== String(shown.budget ?? '')) suggest();
}
window.addEventListener('pageshow', (event) => event.persisted && suggest());

// Lista de regiões: a fotografia ao lado acompanha a região em que se passa o rato
const photos = document.querySelectorAll('[data-region-photo]');
for (const link of document.querySelectorAll('[data-region]')) {
  const show = () => {
    photos.forEach((p) => p.classList.toggle('is-active', p.dataset.regionPhoto === link.dataset.region));
    document.querySelectorAll('[data-region]').forEach((l) => l.classList.toggle('is-active', l === link));
  };
  link.addEventListener('mouseenter', show);
  link.addEventListener('focus', show);
}

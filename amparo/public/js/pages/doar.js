import { api } from '../api.js';
import { euros, toCents } from '../format.js';
import { currentUser } from '../session.js';
import { submitting, toast } from '../utils.js';

const form = document.getElementById('donate');
const out = (key) => document.querySelector(`[data-q="${key}"]`);
const remaining = Number(form.dataset.remaining);
const user = currentUser();

form.publicName.value = user ? user.name.split(' ')[0] : '';
if (!user) form.querySelector('.login-needed').hidden = false;

document.querySelectorAll('[data-toggle]').forEach((box) => {
  const target = document.querySelector(box.dataset.toggle);
  const sync = () => (target.hidden = !box.checked);
  box.addEventListener('change', sync);
  sync();
});

let timer;
let lastQuote = null;

async function refresh() {
  const cents = toCents(form.amount.value);
  out('error').textContent = '';
  if (!Number.isFinite(cents) || cents < 100) {
    lastQuote = null;
    out('error').textContent = 'O valor mínimo é 1 €.';
    return;
  }
  try {
    const q = await api('/doacoes/orcamento', { method: 'POST', body: { adId: form.dataset.ad, amount: cents / 100, coverFee: form.coverFee.checked } });
    lastQuote = q;
    out('charged').textContent = euros(q.chargedCents);
    out('provider').textContent = euros(q.providerFeeCents);
    out('platform').textContent = euros(q.platformFeeCents);
    out('toAd').textContent = euros(q.toAdCents);
    out('after').textContent = euros(Math.max(0, remaining - q.toAdCents));
    if (q.exceeds) out('error').textContent = `Este pedido só precisa de mais ${euros(q.remainingCents)}. Baixe o valor.`;
  } catch (err) {
    lastQuote = null;
    out('error').textContent = err.message;
  }
}

const updateAnon = () => {
  out('anon').textContent = form.showName.checked && form.publicName.value.trim() ? `Aparece como “${form.publicName.value.trim()}”` : 'Doação anónima';
};

form.addEventListener('input', (e) => {
  updateAnon();
  if (e.target.name === 'amount' || e.target.name === 'coverFee') {
    clearTimeout(timer);
    timer = setTimeout(refresh, 250);
  }
});
form.addEventListener('change', updateAnon);
refresh();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser()) {
    form.querySelector('.login-needed').hidden = false;
    form.querySelector('.login-needed a').focus();
    return;
  }
  if (!form.accept.checked) return toast('Confirme que leu o resumo e as condições.', { type: 'error' });
  if (!lastQuote || lastQuote.exceeds) return toast('Corrija o valor antes de continuar.', { type: 'error' });

  await submitting(form.querySelector('[type=submit]'), async () => {
    try {
      const res = await api('/doacoes', {
        method: 'POST',
        auth: true,
        body: {
          adId: form.dataset.ad,
          amount: toCents(form.amount.value) / 100,
          coverFee: form.coverFee.checked,
          showName: form.showName.checked,
          publicName: form.publicName.value,
          accept: true,
        },
      });
      window.location.href = res.redirectUrl;
    } catch (err) {
      if (err.status === 401) return (window.location.href = `/entrar?next=${encodeURIComponent(location.pathname)}`);
      toast(err.details?.[0]?.message ?? err.message, { type: 'error' });
    }
  });
});

import { api } from '../api.js';
import { toCents } from '../format.js';
import { currentUser } from '../session.js';
import { submitting, toast } from '../utils.js';

const form = document.getElementById('contribute');
const calc = form.querySelector('[data-calc]');
const monthly = Number(calc.dataset.monthly);
const user = currentUser();

form.publicName.value = user ? user.name.split(' ')[0] : '';

const toggle = form.querySelector('[data-toggle]');
toggle.addEventListener('change', () => (document.querySelector(toggle.dataset.toggle).hidden = !toggle.checked));

// Mostra logo quantos meses de funcionamento o valor cobre, com o custo mensal definido pelo dono
function update() {
  const cents = toCents(form.amount.value);
  if (!Number.isFinite(cents) || cents < 100) return (calc.textContent = 'O valor mínimo é 1 €.');
  const months = Math.round((cents / monthly) * 10) / 10;
  const label = String(months).replace('.', ',');
  calc.textContent = `${form.amount.value.trim()} € ${months >= 1 && months < 2 ? 'cobre' : 'cobrem'} cerca de ${label} ${months === 1 ? 'mês' : 'meses'} de funcionamento.`;
}
form.amount.addEventListener('input', update);
form.querySelectorAll('.preset').forEach((b) =>
  b.addEventListener('click', () => {
    form.amount.value = String(Number(b.dataset.cents) / 100);
    update();
  }),
);
update();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser()) return (form.querySelector('.login-needed').hidden = false);
  if (!form.accept.checked) return toast('Confirme que percebeu para que serve este dinheiro.', { type: 'error' });
  await submitting(form.querySelector('[type=submit]'), async () => {
    try {
      const res = await api('/plataforma/contribuicoes', {
        method: 'POST',
        auth: true,
        body: { amount: toCents(form.amount.value) / 100, showName: form.showName.checked, publicName: form.publicName.value, accept: true },
      });
      window.location.href = res.redirectUrl;
    } catch (err) {
      if (err.status === 401) return (window.location.href = '/entrar?next=/manter');
      toast(err.details?.[0]?.message ?? err.message, { type: 'error' });
    }
  });
});

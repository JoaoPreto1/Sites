import { api, ApiError } from '../api.js';
import { currentUser } from '../session.js';
import { euros, groupPrice } from '../shared/pricing.js';
import { showFieldErrors, submitting, toast } from '../utils.js';

const root = document.querySelector('[data-gift]');
const form = root.querySelector('[data-form]');
const env = root.querySelector('[data-env]');
const out = form.querySelector('[data-players-out]');
const g = (name) => root.querySelector(`[data-g-${name}]`);
let players = 4;

function render() {
  const option = form.elements.room.selectedOptions[0];
  const max = Number(option.dataset.max);
  players = Math.min(max, Math.max(2, players));
  out.textContent = players;
  g('price').textContent = euros(groupPrice(players).total);
  g('msg').textContent = form.elements.message.value.trim() || 'A sua mensagem aparece aqui.';
  g('from').textContent = form.elements.from.value.trim() || 'quem oferece';
  g('to').textContent = form.elements.to.value.trim() || '…';
  g('room').textContent = option.value ? option.textContent : 'qualquer sala';
  g('players').textContent = `até ${players} pessoas`;
}

form.addEventListener('input', render);
form.addEventListener('change', render);
form.querySelectorAll('[data-players]').forEach((b) =>
  b.addEventListener('click', () => {
    players += Number(b.dataset.players);
    render();
  }),
);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = {
    to: form.elements.to.value.trim(),
    from: form.elements.from.value.trim(),
    message: form.elements.message.value.trim(),
    room: form.elements.room.value,
    players,
    buyerName: form.elements.buyerName.value.trim(),
    buyerEmail: form.elements.buyerEmail.value.trim(),
  };

  await submitting(form.querySelector('[type="submit"]'), async () => {
    try {
      const { voucher } = await api('/vouchers', { method: 'POST', body, auth: true });
      env.classList.add('is-sealed');
      g('code').textContent = voucher.code;
      form.innerHTML = `<div class="gift-done">
        <p class="kicker">Envelope lacrado</p>
        <b>${voucher.code}</b>
        <p>Falta só o pagamento de <strong>${euros(voucher.amount)}</strong>: ao balcão, por MB Way para o 222 019 640 ou por transferência, com o código no descritivo. Quando chegar, ativamos o voucher e mandamos o envelope em PDF para <strong></strong>.</p>
        <div class="chips"><a class="btn btn--brass" href="${currentUser() ? '/conta' : '/salas'}">${currentUser() ? 'Ver no meu dossier' : 'Ver as salas'}</a><a class="btn" href="/vouchers">Escrever outro</a></div>
      </div>`;
      form.querySelector('.gift-done strong:last-of-type').textContent = voucher.buyerEmail;
    } catch (err) {
      if (err instanceof ApiError) {
        showFieldErrors(form, err.details);
        toast(err.message, { type: 'error' });
      } else toast('Sem ligação. Tente outra vez.', { type: 'error' });
    }
  });
});

const user = currentUser();
if (user) {
  form.elements.buyerName.value = user.name ?? '';
  form.elements.buyerEmail.value = user.email ?? '';
}
render();

import { api } from '../api.js';
import { currentUser, loginUrl } from '../session.js';
import { submitting, toast } from '../utils.js';

const user = currentUser();

// Quem já tem lugar vê isso no bilhete em vez do formulário
async function markBooked() {
  if (!user) return;
  try {
    const { reservations } = await api('/tastings/mine', { auth: true });
    for (const r of reservations) booked(r.tastingId, r.people);
  } catch {}
}

function booked(tastingId, people) {
  const form = document.querySelector(`[data-reserve="${tastingId}"]`);
  if (!form) return;
  form.closest('.ticket').classList.add('ticket--booked');
  form.insertAdjacentHTML('afterend', `<p class="ticket__booked">Tem ${people === 1 ? 'um lugar reservado' : `${people} lugares reservados`}. <a href="/conta#provas">Ver na conta</a></p>`);
}

document.addEventListener('submit', async (event) => {
  const form = event.target.closest('[data-reserve]');
  if (!form) return;
  event.preventDefault();

  if (!user) {
    window.location.href = loginUrl(`/provas#${form.closest('.ticket').id}`);
    return;
  }

  const people = Number(form.people.value);
  await submitting(form.querySelector('button'), async () => {
    try {
      await api(`/tastings/${form.dataset.reserve}/reservations`, { method: 'POST', auth: true, body: { people } });
      booked(form.dataset.reserve, people);
      toast(`Lugar reservado para ${form.dataset.title}.`);
    } catch (error) {
      if (error.status === 401) window.location.href = loginUrl();
      else toast(error.message, { type: 'error' });
    }
  });
});

markBooked();

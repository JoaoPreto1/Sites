import { api } from '../api.js';
import { currentUser, loginUrl } from '../session.js';
import { submitting } from '../utils.js';

const form = document.querySelector('[data-join]');
const message = document.querySelector('[data-join-msg]');

// Quem já é sócio não precisa do formulário
async function checkMember() {
  if (!currentUser()) return;
  try {
    const { subscription } = await api('/club/me', { auth: true });
    if (subscription) {
      form.querySelector('[type="submit"]').hidden = true;
      message.innerHTML = `Já é sócio (${subscription.planInfo.name.toLowerCase()}, ${subscription.status}). <a href="/conta#clube">Gerir na conta</a>`;
    }
  } catch {}
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentUser()) {
    window.location.href = loginUrl('/clube#aderir');
    return;
  }

  const { plan, preference } = Object.fromEntries(new FormData(form));
  await submitting(form.querySelector('[type="submit"]'), async () => {
    try {
      const { subscription } = await api('/club', { method: 'POST', auth: true, body: { plan, preference } });
      form.querySelector('[type="submit"]').hidden = true;
      message.innerHTML = `Bem-vindo ao clube. A primeira caixa (${subscription.planInfo.name.toLowerCase()}) sai no início do mês. <a href="/conta#clube">Ver na conta</a>`;
    } catch (error) {
      if (error.status === 401) window.location.href = loginUrl('/clube#aderir');
      else if (error.message.includes('morada')) message.innerHTML = `${error.message}. <a href="/conta#dados">Preencher agora</a>`;
      else message.textContent = error.message;
    }
  });
});

checkMember();

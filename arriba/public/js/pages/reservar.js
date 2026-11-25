import { api } from '../api.js';
import { clearErrors, showErrors } from '../forms.js';
import { currentUser, loginUrl } from '../session.js';
import { esc, euros } from '../utils.js';

const form = document.querySelector('[data-reserva]');
const box = form?.querySelector('[data-erro]');
const sessao = form?.querySelector('[data-sessao]');
const confirmar = form?.querySelector('[data-confirmar]');

// O resumo ao lado acompanha a chave escolhida
form?.addEventListener('change', (e) => {
  if (e.target.name !== 'room') return;
  document.querySelector('[data-r-chave]').textContent = `${e.target.value} · ${e.target.dataset.tipo}`;
  document.querySelector('[data-r-total]').textContent = euros(e.target.dataset.total);
});

// Com sessão de hóspede, confirma-se aqui; sem sessão, entrar ou criar conta e voltar a esta página
function prepararSessao() {
  if (!sessao) return;
  const user = currentUser();
  const aqui = () => {
    const room = form.querySelector('[name=room]:checked')?.value;
    const url = new URL(window.location.href);
    if (room) url.searchParams.set('quarto', room);
    return url.pathname + url.search;
  };
  if (user?.role === 'hospede') {
    sessao.classList.add('sessao--ok');
    sessao.innerHTML = `<p>Vai reservar como <strong>${esc(user.name)}</strong>. A confirmação fica na sua área, onde pode mudar a hora de chegada ou cancelar.</p>`;
    confirmar.hidden = false;
  } else if (user?.role === 'rececao') {
    sessao.innerHTML = '<p>Está com a conta da receção. As reservas são feitas pelos hóspedes, com a conta deles.</p>';
  } else {
    sessao.querySelector('[data-entrar]').addEventListener('click', (e) => (e.currentTarget.href = loginUrl(aqui())));
    sessao.querySelector('[data-criar]').addEventListener('click', (e) => (e.currentTarget.href = `/criar-conta?next=${encodeURIComponent(aqui())}`));
  }
}
prepararSessao();

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (confirmar.hidden) return;
  clearErrors(form, box);
  const dados = new FormData(form);
  confirmar.disabled = true;
  try {
    const { reservation } = await api('/hospede/reservas', {
      method: 'POST',
      auth: true,
      body: {
        room: dados.get('room'),
        checkIn: dados.get('checkIn'),
        checkOut: dados.get('checkOut'),
        guests: Number(dados.get('guests')),
        arrivalTime: dados.get('arrivalTime'),
        notes: dados.get('notes'),
      },
    });
    window.location.href = `/hospede#${reservation.code}`;
  } catch (err) {
    if (err.status === 401) {
      window.location.href = loginUrl();
      return;
    }
    showErrors(form, box, err);
    confirmar.disabled = false;
  }
});

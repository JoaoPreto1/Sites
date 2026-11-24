import { api } from '../api.js';
import { euros } from '../format.js';
import { requireUser } from '../session.js';
import { toast } from '../utils.js';

const box = document.querySelector('.sim');
const { kind, id } = box.dataset;
const path = `/pagamentos/${kind}/${id}`;

if (await requireUser()) {
  try {
    const p = await api(path, { auth: true });
    if (p.status !== 'pendente') window.location.replace(`/recibo/${kind}/${id}`);
    const rows = kind === 'doacao'
      ? [['Para', p.ad?.title ?? 'Pedido'], ['Valor simulado', euros(p.chargedCents)], ['O pedido receberia', euros(p.amountCents)]]
      : [['Para', 'Manter a plataforma'], ['Valor simulado', euros(p.amountCents)]];
    box.querySelector('[data-sum]').innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd></dd></div>`).join('');
    box.querySelectorAll('[data-sum] dd').forEach((dd, i) => (dd.textContent = rows[i][1]));
  } catch (err) {
    toast(err.message, { type: 'error' });
  }

  box.querySelectorAll('[data-outcome]').forEach((b) =>
    b.addEventListener('click', async () => {
      box.querySelectorAll('[data-outcome]').forEach((x) => (x.disabled = true));
      try {
        await api(`${path}/simular`, { method: 'POST', auth: true, body: { outcome: b.dataset.outcome } });
      } catch (err) {
        toast(err.message, { type: 'error' });
      }
      window.location.href = `/recibo/${kind}/${id}`;
    }),
  );
}

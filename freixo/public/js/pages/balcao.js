import { api, updateStoredUser } from '../api.js';
import { logout, requireUser } from '../session.js';
import { esc, euro, shortDate, longDate, monthYear } from '../format.js';
import { formValues, initialData, params, showFieldErrors, submitting, toast } from '../utils.js';

const user = await requireUser({ roles: ['municipe'] });
if (user) start(user);

async function start(me) {
  const services = initialData() ?? [];
  const $ = (sel) => document.querySelector(sel);

  $('[data-user-name]').textContent = me.name;
  $('[data-logout]').addEventListener('click', logout);

  // Serviços que se pedem online, com o escolhido no endereço já selecionado
  const select = $('[data-services]');
  const hint = $('[data-service-hint]');
  select.innerHTML = services.map((s) => `<option value="${s.slug}">${esc(s.title)}</option>`).join('');
  const wanted = params().servico;
  if (services.some((s) => s.slug === wanted)) select.value = wanted;
  const showHint = () => {
    const s = services.find((x) => x.slug === select.value);
    hint.textContent = s ? `${s.list.title}: ${s.list.items.join(' ')}` : '';
  };
  select.addEventListener('change', showHint);
  showHint();

  let state = null;

  async function load() {
    state = await api('/balcao/resumo', { auth: true });
    render();
  }

  function render() {
    const open = state.requests.filter((r) => r.status !== 'concluido');
    const unpaid = state.invoices.filter((f) => !f.paid);
    const openIssues = state.issues.filter((o) => o.status !== 'concluido');

    $('[data-stats]').innerHTML = [
      ['Pedidos em curso', open.length, '#pedidos'],
      ['Por pagar', euro(state.due), '#agua'],
      ['Ocorrências abertas', openIssues.length, '#ocorrencias'],
      ['Última leitura', state.readings[0] ? `${state.readings[0].value} m³` : '—', '#agua'],
    ]
      .map(([label, value, href]) => `<a class="stat" href="${href}"><span>${label}</span><b>${value}</b></a>`)
      .join('');

    $('[data-requests]').innerHTML = state.requests.length
      ? state.requests
          .map(
            (r) => `<details class="req"${r.status !== 'concluido' ? ' open' : ''}>
  <summary><span><b>${esc(r.serviceTitle)}</b><small>${esc(r.number)} · pedido a ${shortDate(r.createdAt)}</small></span><span class="st st--${r.status}">${esc(r.statusLabel)}</span></summary>
  <div class="req__in"><p>${esc(r.text)}</p><ol class="steps-line">${r.history.map((h) => `<li><time>${shortDate(h.at)}</time><span>${esc(h.note)}</span></li>`).join('')}</ol></div>
</details>`,
          )
          .join('')
      : '<p class="empty-note">Ainda não fez nenhum pedido.</p>';

    $('[data-invoices] tbody').innerHTML = state.invoices
      .map(
        (f) => `<tr><td><b>${esc(f.number)}</b></td><td>${monthYear(f.period)}</td><td>${f.m3} m³</td><td>${euro(f.amount)}</td><td>${
          f.paid ? '<span class="st st--concluido">Paga</span>' : `<button class="btn gold sm" type="button" data-pay="${f.id}">Pagar até ${shortDate(f.due)}</button>`
        }</td></tr>`,
      )
      .join('');

    const last = state.readings[0];
    $('[data-last-reading]').textContent = last ? `Última leitura: ${last.value} m³, a ${longDate(last.at)}.` : '';

    $('[data-issues]').innerHTML = state.issues.length
      ? state.issues.map((o) => `<article class="info"><span class="st st--${o.status}" style="align-self:flex-start">${esc(o.statusLabel)}</span><h3>${esc(o.place)}</h3><p>${esc(o.text)}</p><p class="muted">${esc(o.number)} · ${shortDate(o.createdAt)}</p></article>`).join('')
      : '<p class="empty-note">Não reportou nenhuma ocorrência.</p>';
  }

  // Pagamento de demonstração (num site real abria o prestador de pagamentos)
  $('[data-invoices]').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-pay]');
    if (!button) return;
    await submitting(button, async () => {
      try {
        await api(`/balcao/faturas/${button.dataset.pay}/pagar`, { method: 'POST', auth: true });
        toast('Pagamento registado. Obrigado!');
        await load();
      } catch (err) {
        toast(err.message, { type: 'error' });
      }
    });
  });

  const onSubmit = (form, task) =>
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await submitting(form.querySelector('[type="submit"]'), async () => {
        try {
          await task(formValues(form));
          showFieldErrors(form, []);
        } catch (err) {
          showFieldErrors(form, err.details);
          toast(err.message, { type: 'error' });
        }
      });
    });

  onSubmit($('[data-new-request]'), async (data) => {
    const { request } = await api('/balcao/pedidos', { method: 'POST', body: data, auth: true });
    $('[data-new-request] textarea').value = '';
    toast(`Pedido ${request.number} enviado`, { link: { href: '#pedidos', label: 'Ver' } });
    await load();
  });

  onSubmit($('[data-reading]'), async ({ value }) => {
    await api('/balcao/leituras', { method: 'POST', body: { value: Number(value) }, auth: true });
    $('[data-reading] input').value = '';
    toast('Leitura registada');
    await load();
  });

  const profile = $('[data-profile]');
  profile.name.value = me.name;
  profile.phone.value = me.phone ?? '';
  profile.email.value = me.email;
  onSubmit(profile, async ({ name, phone }) => {
    const { user: updated } = await api('/auth/me', { method: 'PATCH', body: { name, phone }, auth: true });
    updateStoredUser(updated);
    $('[data-user-name]').textContent = updated.name;
    toast('Dados guardados');
  });

  onSubmit($('[data-password]'), async (data) => {
    await api('/auth/me/password', { method: 'PATCH', body: data, auth: true });
    $('[data-password]').reset();
    toast('Palavra-passe alterada');
  });

  await load();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

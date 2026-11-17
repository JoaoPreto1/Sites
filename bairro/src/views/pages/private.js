import { esc, icon, win } from '../components.js';

const loading = '<p class="empty" data-loading>A abrir…</p>';

export function loginWindows({ email = '', register = false }) {
  const body = `<div class="login">
    <span class="login__avatar">${icon('user')}</span>
    <h1 class="login__title">Área de cliente</h1>
    <p class="mute small">Acompanhe o seu projeto, aprove provas e fale connosco.</p>
    <div class="tabs login__tabs" role="tablist">
      <button type="button" role="tab" id="tab-entrar" aria-controls="painel-entrar" aria-selected="${!register}" data-tab="entrar">Entrar</button>
      <button type="button" role="tab" id="tab-registar" aria-controls="painel-registar" aria-selected="${register}" data-tab="registar">Criar conta</button>
    </div>
    <form class="panel login__form" id="painel-entrar" role="tabpanel" aria-labelledby="tab-entrar" data-panel="entrar" novalidate${register ? ' hidden' : ''}>
      <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required value="${esc(email)}"></label>
      <label class="field"><span>Palavra-passe</span><input name="password" type="password" autocomplete="current-password" required></label>
      <button class="btn btn--primary" type="submit">Entrar</button>
    </form>
    <form class="panel login__form" id="painel-registar" role="tabpanel" aria-labelledby="tab-registar" data-panel="registar" novalidate${register ? '' : ' hidden'}>
      <label class="field"><span>Nome</span><input name="name" autocomplete="name" required></label>
      <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required value="${esc(email)}"></label>
      <label class="field"><span>Negócio <span class="mute">(opcional)</span></span><input name="company" autocomplete="organization"></label>
      <label class="field"><span>Palavra-passe</span><input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
      <p class="small mute">Use o mesmo email do pedido de orçamento e ele aparece logo na conta.</p>
      <button class="btn btn--primary" type="submit">Criar conta</button>
    </form>
  </div>`;

  return [
    {
      id: 'entrar',
      label: 'Área de cliente',
      ico: 'user',
      html: win({ id: 'entrar', url: '/entrar', title: 'iniciar sessão', label: 'Área de cliente', ico: 'user', primary: true, x: 380, y: 50, w: 460, cls: 'dialog', script: 'login', body }),
    },
  ];
}

export function accountWindows() {
  const body = `<div class="account" data-account>
    <div class="account__head">
      <h1 class="account__title">O meu projeto</h1>
      <button class="btn btn--small" type="button" data-logout>Terminar sessão</button>
    </div>
    ${loading}
  </div>`;

  return [
    {
      id: 'conta',
      label: 'O meu projeto',
      ico: 'user',
      html: win({ id: 'conta', url: '/conta', title: 'o_meu_projeto.app', label: 'O meu projeto', ico: 'user', primary: true, x: 50, y: 30, w: 1100, cls: 'account-win', script: 'account', flush: true, body }),
    },
  ];
}

export function adminWindows() {
  const body = `<div class="admin" data-admin>
    <div class="account__head">
      <h1 class="account__title">Gestor de tarefas</h1>
      <button class="btn btn--small" type="button" data-logout>Terminar sessão</button>
    </div>
    ${loading}
  </div>`;

  return [
    {
      id: 'painel',
      label: 'Gestor de tarefas',
      ico: 'app',
      html: win({ id: 'painel', url: '/painel', title: 'gestor_de_tarefas.exe', label: 'Gestor de tarefas', primary: true, x: 40, y: 30, w: 1180, cls: 'account-win', script: 'admin', flush: true, body }),
    },
  ];
}

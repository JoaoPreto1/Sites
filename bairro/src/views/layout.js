import { STUDIO } from '../config/studio.js';
import { icon } from './components.js';

export const APPS = [
  { href: '/projetos', label: 'projetos', title: 'Projetos', ico: 'folder' },
  { href: '/equipa', label: 'equipa', title: 'Equipa', ico: 'folder' },
  { href: '/precos', label: 'preços.xls', title: 'Preços', ico: 'sheet' },
  { href: '/orcamento', label: 'orçamento.txt', title: 'Pedir orçamento', ico: 'doc' },
  { href: '/manifesto', label: 'manifesto.txt', title: 'Manifesto', ico: 'doc' },
  { href: '/lixo', label: 'ideias más', title: 'Ideias más', ico: 'trash' },
];

const current = (path, href) => (path === href || path.startsWith(`${href}/`) ? ' aria-current="page"' : '');

const lisbonTime = () =>
  new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon' }).format(new Date());

export function menubar(path, opening) {
  const status = opening
    ? `<span class="dot" aria-hidden="true"></span>${opening.free} ${opening.free === 1 ? 'vaga' : 'vagas'} em ${opening.name}`
    : '<span class="dot dot--off" aria-hidden="true"></span>Sem vagas por agora';

  return `<header class="menubar">
  <button class="start" type="button" aria-expanded="false" aria-controls="start-menu">✦ Bairro</button>
  <nav class="menubar__nav" aria-label="Principal">
    ${APPS.slice(0, 5)
      .map((app) => `<a href="${app.href}"${current(path, app.href)}>${app.title}</a>`)
      .join('')}
  </nav>
  <div class="menubar__right">
    <span class="menubar__status">${status}</span>
    <a href="/entrar" data-account>Entrar</a>
    <span class="clock" data-clock>${lisbonTime()}</span>
  </div>
</header>
<div class="start-menu" id="start-menu" hidden>
  <p class="start-menu__head">Bairro OS</p>
  <ul>
    <li><a href="/">${icon('app')}Bem-vindo</a></li>
    ${APPS.map((app) => `<li><a href="${app.href}">${icon(app.ico)}${app.title}</a></li>`).join('')}
    <li><hr></li>
    <li><a href="/definicoes">${icon('gear')}Definições</a></li>
    <li><a href="/entrar" data-account-menu>${icon('user')}Área de cliente</a></li>
  </ul>
</div>`;
}

export const desktopIcons = (path) => `<nav class="icons" aria-label="Atalhos">
  ${APPS.map((app) => `<a href="${app.href}"${current(path, app.href)}>${icon(app.ico)}<span>${app.label}</span></a>`).join('')}
</nav>`;

export function taskbar(windows) {
  return `<footer class="taskbar">
  <div class="tasks" aria-label="Janelas abertas">
    ${windows.map((w) => `<button class="task" type="button" data-task="w-${w.id}">${icon(w.ico ?? 'app')}${w.label ?? w.title}</button>`).join('')}
  </div>
  <div class="tray">
    <address>${STUDIO.street} · ${STUDIO.city}</address>
    <span class="clock" data-clock>${lisbonTime()}</span>
  </div>
</footer>`;
}

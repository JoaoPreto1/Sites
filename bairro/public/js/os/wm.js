// Gestor de janelas: cada página do site é uma janela. Abrir um link busca a página ao servidor
// e acrescenta a janela principal dela ao ambiente de trabalho, sem recarregar.
const V = document.documentElement.dataset.v;
const POS_KEY = 'bairro.pos';
const MAX_WINDOWS = 7;
const wide = matchMedia('(min-width: 1024px)');

const deskEl = () => document.querySelector('.windows');
const tasksEl = () => document.querySelector('.tasks');
export const allWindows = () => [...deskEl().querySelectorAll('.win')];

let z = 10;
const mounted = new WeakSet();

const session = {
  read() {
    try {
      return JSON.parse(sessionStorage.getItem(POS_KEY)) ?? {};
    } catch {
      return {};
    }
  },
  save(id, pos) {
    try {
      sessionStorage.setItem(POS_KEY, JSON.stringify({ ...session.read(), [id]: pos }));
    } catch {}
  },
};

const here = () => location.pathname + location.search;
const ownsUrl = (win) => win.hasAttribute('data-primary');
const topmost = () =>
  allWindows()
    .filter((w) => !w.hidden)
    .sort((a, b) => Number(b.style.getPropertyValue('--z') || 0) - Number(a.style.getPropertyValue('--z') || 0))[0];

function setHistory(win, mode) {
  if (!mode || !ownsUrl(win) || win.dataset.url === here()) return;
  history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', win.dataset.url);
}

function markCurrent() {
  const path = location.pathname;
  document.querySelectorAll('.menubar__nav a, .icons a').forEach((a) => {
    const href = a.getAttribute('href');
    const current = path === href || path.startsWith(`${href}/`);
    current ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
}

export function focusWindow(win, { history: mode = 'replace' } = {}) {
  win.hidden = false;
  win.style.setProperty('--z', ++z);
  allWindows().forEach((w) => w.classList.toggle('is-active', w === win));
  setHistory(win, mode);
  if (ownsUrl(win) && win.dataset.doctitle) document.title = win.dataset.doctitle;
  syncTasks();
  markCurrent();
}

export function closeWindow(win) {
  resizes.unobserve(win);
  win.remove();
  const next = topmost();
  if (next) focusWindow(next);
  else {
    history.replaceState({}, '', '/');
    syncTasks();
    markCurrent();
  }
  fitDesk();
}

function minimize(win) {
  win.hidden = true;
  win.classList.remove('is-active', 'win--max');
  const next = topmost();
  if (next) focusWindow(next);
  else syncTasks();
}

function toggleMax(win) {
  if (!wide.matches) return;
  win.classList.toggle('win--max');
  focusWindow(win);
}

export function syncTasks() {
  const tasks = tasksEl();
  if (!tasks) return;
  tasks.replaceChildren(
    ...allWindows().map((win) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `task${win.classList.contains('is-active') && !win.hidden ? ' is-active' : ''}${win.hidden ? ' is-min' : ''}`;
      button.dataset.task = win.id;
      button.innerHTML = `<span class="ico ico--${win.dataset.ico || 'app'}" aria-hidden="true"></span>`;
      button.append(win.dataset.title);
      button.setAttribute('aria-label', `${win.dataset.title}${win.hidden ? ' (minimizada)' : ''}`);
      return button;
    }),
  );
}

// O ambiente de trabalho cresce até à janela mais em baixo, para dar para fazer scroll até ela
export function fitDesk() {
  const desk = deskEl();
  if (!wide.matches) {
    desk.style.minHeight = '';
    return;
  }
  const bottom = Math.max(0, ...allWindows().filter((w) => !w.hidden).map((w) => w.offsetTop + w.offsetHeight + (parseFloat(w.style.getPropertyValue('--dy')) || 0)));
  desk.style.minHeight = `${bottom + 40}px`;
}

function makeDraggable(win) {
  const bar = win.querySelector('.win__bar');
  let start = null;

  bar.addEventListener('pointerdown', (event) => {
    if (!wide.matches || event.button !== 0 || event.target.closest('button') || win.classList.contains('win--max')) return;
    start = {
      x: event.clientX,
      y: event.clientY,
      dx: parseFloat(win.style.getPropertyValue('--dx')) || 0,
      dy: parseFloat(win.style.getPropertyValue('--dy')) || 0,
      top: win.offsetTop,
      left: win.offsetLeft,
      width: win.offsetWidth,
      room: deskEl().clientWidth,
    };
    bar.setPointerCapture(event.pointerId);
    win.classList.add('is-dragging');
  });

  bar.addEventListener('pointermove', (event) => {
    if (!start) return;
    // Fica sempre um bocado da janela à vista, para a poder voltar a agarrar
    const keep = 140;
    const dx = Math.min(start.room - start.left - keep, Math.max(keep - start.left - start.width, start.dx + event.clientX - start.x));
    // Não deixa a barra de título sair por cima do ambiente de trabalho
    const dy = Math.max(-start.top, start.dy + event.clientY - start.y);
    win.style.setProperty('--dx', `${dx}px`);
    win.style.setProperty('--dy', `${dy}px`);
  });

  const stop = () => {
    if (!start) return;
    start = null;
    win.classList.remove('is-dragging');
    session.save(win.id, { dx: win.style.getPropertyValue('--dx'), dy: win.style.getPropertyValue('--dy') });
    fitDesk();
  };
  bar.addEventListener('pointerup', stop);
  bar.addEventListener('pointercancel', stop);
  bar.addEventListener('dblclick', (event) => {
    if (!event.target.closest('button')) toggleMax(win);
  });
}

async function mountScript(win) {
  const name = win.dataset.script;
  if (!name || mounted.has(win)) return;
  mounted.add(win);
  let state = null;
  try {
    state = JSON.parse(win.querySelector('.win-data')?.textContent ?? 'null');
  } catch {}
  const module = await import(`/js/pages/${name}.js?v=${V}`);
  module.mount?.(win, state);
}

// Quando o conteúdo de uma janela cresce (fotografias, dados da conta), o ambiente de trabalho cresce com ela
let fitting = 0;
const resizes = new ResizeObserver(() => {
  cancelAnimationFrame(fitting);
  fitting = requestAnimationFrame(fitDesk);
});

// Arruma as janelas em cascata e esquece as posições arrastadas
export function tidyWindows() {
  try {
    sessionStorage.removeItem(POS_KEY);
  } catch {}
  let step = 0;
  allWindows().forEach((win) => {
    win.style.removeProperty('--dx');
    win.style.removeProperty('--dy');
    win.classList.remove('win--max');
    win.hidden = false;
    if (!win.classList.contains('win--primary') && !win.dataset.home) {
      win.style.setProperty('--x', `${40 + step * 36}px`);
      win.style.setProperty('--y', `${30 + step * 34}px`);
      step += 1;
    }
  });
  const top = topmost();
  if (top) focusWindow(top);
  fitDesk();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function showDesktop() {
  allWindows().forEach((win) => {
    win.hidden = true;
    win.classList.remove('is-active', 'win--max');
  });
  syncTasks();
  fitDesk();
}

export function initWindow(win) {
  resizes.observe(win);
  const saved = session.read()[win.id];
  if (saved && wide.matches) {
    win.style.setProperty('--dx', saved.dx);
    win.style.setProperty('--dy', saved.dy);
  }
  win.style.setProperty('--z', ++z);

  win.querySelector('.win__bar').addEventListener('click', (event) => {
    const act = event.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') closeWindow(win);
    if (act === 'min') minimize(win);
    if (act === 'max') toggleMax(win);
  });
  win.addEventListener('pointerdown', () => {
    if (!win.classList.contains('is-active')) focusWindow(win);
  });
  makeDraggable(win);
  mountScript(win);
}

// Janelas novas abrem em cascata, na parte do ambiente de trabalho que está à vista
function place(win) {
  win.classList.remove('win--primary');
  if (!wide.matches) return;
  const step = allWindows().length % 6;
  const visibleTop = Math.max(0, -deskEl().getBoundingClientRect().top);
  win.style.setProperty('--x', `${70 + step * 34}px`);
  win.style.setProperty('--y', `${visibleTop + 24 + step * 26}px`);
}

export async function openUrl(href, { history: mode = 'push' } = {}) {
  const url = new URL(href, location.href);
  const key = url.pathname + url.search;
  const existing = allWindows().find((w) => ownsUrl(w) && new URL(w.dataset.url, location.href).pathname === url.pathname);

  if (existing && existing.dataset.url === key) {
    focusWindow(existing, { history: mode });
    if (!wide.matches) existing.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return existing;
  }

  let doc;
  try {
    const res = await fetch(key, { headers: { Accept: 'text/html' } });
    doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  } catch {
    location.href = key;
    return null;
  }

  const fresh = doc.querySelector('.win[data-primary]');
  if (!fresh) {
    location.href = key;
    return null;
  }
  fresh.dataset.doctitle = doc.title;
  fresh.dataset.url = key;

  if (existing) {
    // Mesma janela com outros filtros: troca o conteúdo e fica no mesmo sítio
    ['--x', '--y', '--dx', '--dy'].forEach((prop) => fresh.style.setProperty(prop, existing.style.getPropertyValue(prop)));
    fresh.classList.toggle('win--primary', existing.classList.contains('win--primary'));
    existing.replaceWith(fresh);
  } else {
    place(fresh);
    if (wide.matches) deskEl().append(fresh);
    else deskEl().prepend(fresh);
    fresh.classList.add('is-opening');
  }

  const extra = allWindows().filter((w) => w !== fresh);
  if (extra.length >= MAX_WINDOWS) {
    extra.sort((a, b) => Number(a.style.getPropertyValue('--z')) - Number(b.style.getPropertyValue('--z')))[0].remove();
  }

  initWindow(fresh);
  focusWindow(fresh, { history: mode });
  fitDesk();
  if (wide.matches) fresh.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  else fresh.scrollIntoView({ behavior: 'smooth', block: 'start' });
  fresh.querySelector('h1, h2')?.setAttribute('tabindex', '-1');
  fresh.querySelector('h1, h2')?.focus({ preventScroll: true });
  return fresh;
}

const SKIP = /^\/(api|css|js|fonts)\//;

export function interceptLinks() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target || link.hasAttribute('download') || link.hasAttribute('data-reload')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || SKIP.test(url.pathname) || /\.(xml|txt|svg)$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    event.preventDefault();
    document.querySelector('.start-menu')?.setAttribute('hidden', '');
    document.querySelector('.start')?.setAttribute('aria-expanded', 'false');
    openUrl(url.href);
  });

  window.addEventListener('popstate', () => openUrl(here(), { history: false }));

  tasksEl()?.addEventListener('click', (event) => {
    const win = document.getElementById(event.target.closest('[data-task]')?.dataset.task ?? '');
    if (!win) return;
    if (win.classList.contains('is-active') && !win.hidden) minimize(win);
    else {
      focusWindow(win);
      if (!wide.matches) win.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

export function startDesktop() {
  const windows = allWindows();
  const primary = windows.find(ownsUrl);
  if (primary) primary.dataset.doctitle = document.title;
  windows.forEach((win) => {
    win.dataset.home = '1';
    initWindow(win);
  });
  document.querySelector('[data-tidy]')?.addEventListener('click', tidyWindows);
  document.querySelector('[data-show-desk]')?.addEventListener('click', showDesktop);
  if (primary) focusWindow(primary, { history: false });
  syncTasks();
  fitDesk();
  wide.addEventListener('change', fitDesk);
  interceptLinks();
}

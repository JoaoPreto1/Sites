import { api } from '../api.js';
import { requireUser } from '../session.js';
import { daysUntil, escapeHtml, formatDate, img } from '../utils.js';

const root = document.querySelector('[data-galleries]');

function expiryLabel(gallery) {
  if (gallery.expired) return 'Expirada';
  const days = daysUntil(gallery.expiresAt);
  return days <= 7 ? `Expira em ${days} dias` : `Disponível até ${formatDate(gallery.expiresAt)}`;
}

function card(gallery) {
  return `
    <a class="gcard${gallery.expired ? ' is-expired' : ''}" href="/galerias/${gallery.id}">
      <div class="gcard__media">
        <img src="${img(gallery.cover, 1000, 625)}" alt="" loading="lazy">
        <span class="tag">${gallery.allowDownload ? 'Download ativo' : 'Só visualização'}</span>
      </div>
      <div class="gcard__body">
        <span class="mono muted">${escapeHtml(gallery.project)} · sessão de ${formatDate(gallery.shotOn)}</span>
        <h3>${escapeHtml(gallery.title)}</h3>
        <span class="mono ${gallery.expired ? 'red' : ''}">${expiryLabel(gallery)}</span>
        <div class="gcard__stats">
          <div><strong>${gallery.photoCount}</strong><span class="mono">Fotografias</span></div>
          <div><strong>${gallery.favorites.length}</strong><span class="mono">Favoritas</span></div>
          <div><strong>${gallery.downloads}</strong><span class="mono">Downloads</span></div>
        </div>
      </div>
    </a>`;
}

const user = await requireUser();
if (user) {
  document.querySelector('[data-who]').textContent = `Área de cliente · ${user.company || user.name}`;
  document.querySelector('[data-greeting]').innerHTML = `Olá, <span class="red">${escapeHtml(user.name.split(' ')[0])}.</span>`;

  try {
    const { galleries } = await api('/galleries', { auth: true });
    root.innerHTML = galleries.length
      ? galleries.map(card).join('')
      : '<div class="empty"><h3>Ainda não tem galerias</h3><p>Avisamos por email assim que as fotografias estiverem prontas.</p></div>';
  } catch (error) {
    root.innerHTML = `<p class="notice notice--error">${escapeHtml(error.message)}</p>`;
  }
}

import { api } from '../api.js';
import { icon } from '../icons.js';
import { createLightbox } from '../lightbox.js';
import { requireUser } from '../session.js';
import { daysUntil, escapeHtml, formatDate, img, plural, toast } from '../utils.js';

const root = document.querySelector('[data-gallery]');
const dialog = document.querySelector('[data-lightbox]');
const id = decodeURIComponent(window.location.pathname.split('/')[2] ?? '');

let gallery;
let favorites = new Set();
let onlyFavorites = false;

function photoMarkup(photo, index) {
  const fav = favorites.has(photo.id);
  return `
    <figure class="photo${fav ? ' is-favorite' : ''}" data-id="${photo.id}">
      <button type="button" data-open="${index}"><img src="${img(photo.url, 700)}" alt="${escapeHtml(photo.name)}" loading="lazy"></button>
      <figcaption class="photo__bar">
        <span class="mono">${escapeHtml(photo.name)}</span>
        <button class="photo__fav" type="button" data-fav="${photo.id}" aria-label="${fav ? 'Tirar das favoritas' : 'Marcar como favorita'}">${icon(fav ? 'heartFill' : 'heart', 18)}</button>
      </figcaption>
    </figure>`;
}

function visiblePhotos() {
  return onlyFavorites ? gallery.photos.filter((p) => favorites.has(p.id)) : gallery.photos;
}

function renderGrid() {
  const photos = visiblePhotos();
  root.querySelector('[data-grid]').innerHTML = photos.length
    ? photos.map((p) => photoMarkup(p, gallery.photos.indexOf(p))).join('')
    : '<div class="empty"><h3>Ainda não escolheu favoritas</h3><p>Toque no ♥ de cada fotografia para a marcar.</p></div>';
  root.querySelector('[data-fav-count]').textContent = favorites.size;
  root.querySelector('[data-filter-all]').classList.toggle('is-active', !onlyFavorites);
  root.querySelector('[data-filter-fav]').classList.toggle('is-active', onlyFavorites);
}

function render() {
  document.title = `${gallery.title} · Lente Studio`;
  const days = daysUntil(gallery.expiresAt);

  root.innerHTML = `
    <section class="gallery-head">
      <div>
        <nav class="crumbs mono"><a href="/galerias">As minhas galerias</a> / ${escapeHtml(gallery.project)}</nav>
        <h1>${escapeHtml(gallery.title)}</h1>
        <div class="gallery-head__meta mono">
          <span>${plural(gallery.photos.length, 'fotografia', 'fotografias')}</span>
          <span>Sessão de ${formatDate(gallery.shotOn)}</span>
          <span class="${days <= 7 ? 'red' : ''}">${days >= 0 ? `Disponível mais ${plural(days, 'dia', 'dias')}` : 'Expirada'}</span>
        </div>
      </div>
      <div class="gallery-head__actions">
        <button class="btn btn--line" type="button" data-download-favs ${gallery.allowDownload ? '' : 'disabled'}>${icon('heart', 16)} Descarregar favoritas</button>
        <button class="btn" type="button" data-download-all ${gallery.allowDownload ? '' : 'disabled'}>${icon('download', 16)} Descarregar tudo</button>
      </div>
    </section>
    ${gallery.allowDownload ? '' : `<p class="notice-bar">${icon('lock', 16)} O download fica disponível quando o retoque estiver aprovado. Para já pode ver e escolher as favoritas.</p>`}
    <div class="gallery-bar">
      <div class="filters">
        <button class="filter is-active" type="button" data-filter-all>Todas<sup>${gallery.photos.length}</sup></button>
        <button class="filter" type="button" data-filter-fav>Favoritas<sup data-fav-count>0</sup></button>
      </div>
      <span class="mono muted">As favoritas são enviadas ao estúdio automaticamente</span>
    </div>
    <div class="photo-grid" data-grid></div>`;

  renderGrid();
}

async function toggleFavorite(photoId) {
  try {
    const { favorites: list } = await api(`/galleries/${gallery.id}/photos/${photoId}/favorite`, { method: 'POST', auth: true });
    favorites = new Set(list);
    renderGrid();
    updateLightboxFav();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function download(photoIds) {
  if (photoIds && !photoIds.length) return toast('Ainda não tem favoritas para descarregar', 'error');
  try {
    const { files } = await api(`/galleries/${gallery.id}/download`, { method: 'POST', auth: true, body: { photoIds } });
    // Uma fotografia abre logo em alta resolução; para várias, aqui entraria um ZIP gerado no servidor
    if (files.length === 1) window.open(files[0].url, '_blank', 'noopener');
    toast(files.length === 1 ? `${files[0].name} pronto a guardar` : `${files.length} fotografias preparadas para download`);
  } catch (error) {
    toast(error.message, 'error');
  }
}

let lightbox;
function updateLightboxFav() {
  const photo = lightbox?.current();
  if (!photo) return;
  dialog.querySelector('[data-lightbox-fav]').textContent = favorites.has(photo.id) ? '♥ Favorita' : '♡ Favorita';
}

root.addEventListener('click', (event) => {
  const fav = event.target.closest('[data-fav]');
  if (fav) return toggleFavorite(fav.dataset.fav);

  const open = event.target.closest('[data-open]');
  if (open) return lightbox.open(Number(open.dataset.open));

  if (event.target.closest('[data-filter-all]')) {
    onlyFavorites = false;
    return renderGrid();
  }
  if (event.target.closest('[data-filter-fav]')) {
    onlyFavorites = true;
    return renderGrid();
  }
  if (event.target.closest('[data-download-all]')) return download();
  if (event.target.closest('[data-download-favs]')) download([...favorites]);
});

dialog.querySelector('[data-lightbox-fav]').addEventListener('click', () => toggleFavorite(lightbox.current().id));
dialog.querySelector('[data-lightbox-download]').addEventListener('click', () => download([lightbox.current().id]));

const user = await requireUser();
if (user) {
  try {
    ({ gallery } = await api(`/galleries/${encodeURIComponent(id)}`, { auth: true }));
    favorites = new Set(gallery.favorites);
    render();
    lightbox = createLightbox(dialog, gallery.photos, { onChange: updateLightboxFav });
    dialog.querySelector('[data-lightbox-download]').hidden = !gallery.allowDownload;
  } catch (error) {
    root.innerHTML = `
      <section class="page-head">
        <span class="mono red">${error.status === 410 ? 'Galeria expirada' : 'Galeria indisponível'}</span>
        <h1>${escapeHtml(error.message)}</h1>
        <p><a class="link" href="/galerias">Voltar às minhas galerias</a></p>
      </section>`;
  }
}

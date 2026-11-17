import { renderHead } from '../seo/head.js';
import { desktopIcons, menubar, taskbar } from './layout.js';

// Muda a cada arranque do servidor, para o CSS e o JS em cache serem sempre os da versão atual
export const VERSION = Date.now().toString(36);

// windows: [{ id, label, ico, html }] — a primeira é a janela principal da página
export function documentHtml({ page, windows, extra = '', path, opening, deskHeight }) {
  return `<!doctype html>
<html lang="pt-PT" data-v="${VERSION}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${renderHead({ ...page, path: page.path ?? path })}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/pixelify.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/css/app.css?v=${VERSION}">
</head>
<body>
  <a class="skip" href="#${windows[0] ? `w-${windows[0].id}` : 'conteudo'}">Saltar para o conteúdo</a>
  ${menubar(path, opening)}
  <main id="conteudo" class="desk">
    ${desktopIcons(path)}
    <div class="windows"${deskHeight ? ` style="--desk-h:${deskHeight}px"` : ''}>
      ${windows.map((w) => w.html).join('\n')}
      ${extra}
    </div>
  </main>
  ${taskbar(windows)}
  <script type="module" src="/js/os/desktop.js?v=${VERSION}"></script>
</body>
</html>`;
}

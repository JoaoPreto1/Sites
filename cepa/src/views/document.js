import { renderHead } from '../seo/head.js';
import { footer, header } from './layout.js';

// Muda a cada arranque do servidor, para o CSS em cache ser sempre o da versão atual
const VERSION = Date.now().toString(36);

// Os dados vão numa tag JSON (não é executada) para a página não ter de os pedir outra vez à API
const initialData = (data) =>
  data ? `<script type="application/json" id="initial-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>` : '';

export function documentHtml({ page, main, css = [], script, data, path }) {
  return `<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${renderHead({ ...page, path: page.path ?? path })}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/newsreader.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/newsreader-italic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/css/app.css?p=${css.join(',')}&amp;v=${VERSION}">
</head>
<body>
  <a class="skip" href="#conteudo">Saltar para o conteúdo</a>
  ${header(path)}
  <main id="conteudo">${main}</main>
  ${footer()}
  ${initialData(data)}
  <script type="module" src="/js/layout.js"></script>
  ${script ? `<script type="module" src="/js/pages/${script}.js"></script>` : ''}
</body>
</html>`;
}

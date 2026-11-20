import { env } from '../config/env.js';
import { STUDIO } from '../config/studio.js';

const SITE_NAME = STUDIO.brand;
const DEFAULT_IMAGE = '/img/casa-em-silvalde/logradouro-1600.webp';

export const absolute = (path = '/') => (/^https?:/.test(path) ? path : `${env.siteUrl}${path}`);

const escape = (value = '') =>
  String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

// JSON-LD dentro de <script>: impede que um "</script>" nos dados feche a tag
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export function renderHead({ title, description, path = '/', image = DEFAULT_IMAGE, type = 'website', noindex = false, schema = [], preload = [] }) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · Arquitetura em Matosinhos e Viseu`;
  const url = absolute(path);
  const img = absolute(image);

  const tags = [
    `<title>${escape(fullTitle)}</title>`,
    `<meta name="description" content="${escape(description)}">`,
    `<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">`,
    `<link rel="canonical" href="${url}">`,
    '<meta name="theme-color" content="#f3f1ec">',
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    '<meta property="og:locale" content="pt_PT">',
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:title" content="${escape(fullTitle)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${escape(img)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escape(fullTitle)}">`,
    `<meta name="twitter:description" content="${escape(description)}">`,
    `<meta name="twitter:image" content="${escape(img)}">`,
    ...preload.map(({ srcset, sizes }) => `<link rel="preload" as="image" type="image/webp" imagesrcset="${escape(srcset)}" imagesizes="${escape(sizes)}" fetchpriority="high">`),
    ...schema.filter(Boolean).map(jsonLd),
  ];

  return tags.join('\n  ');
}

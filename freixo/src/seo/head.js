import { env } from '../config/env.js';
import { MUNICIPIO } from '../config/municipio.js';

const DEFAULT_IMAGE = '/img/penedo-1600.webp';

export const absolute = (path = '/') => (/^https?:/.test(path) ? path : `${env.siteUrl}${path}`);

const escape = (value = '') =>
  String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

// JSON-LD dentro de <script>: impede que um "</script>" nos dados feche a tag
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export function renderHead({ title, description, path = '/', image = DEFAULT_IMAGE, type = 'website', noindex = false, schema = [], preload = [] }) {
  const fullTitle = title ? `${title} · ${MUNICIPIO.short}` : `${MUNICIPIO.name} · Douro Internacional`;
  const url = absolute(path);
  const img = absolute(image);

  const tags = [
    `<title>${escape(fullTitle)}</title>`,
    `<meta name="description" content="${escape(description)}">`,
    `<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">`,
    `<link rel="canonical" href="${url}">`,
    '<meta name="theme-color" content="#2c1a3d">',
    `<meta property="og:site_name" content="${MUNICIPIO.name}">`,
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

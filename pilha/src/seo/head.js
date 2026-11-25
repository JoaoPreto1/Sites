import { env } from '../config/env.js';
import { SITE } from '../config/site.js';

export const absolute = (path = '/') => (/^https?:/.test(path) ? path : `${env.siteUrl}${path}`);

const escape = (value = '') => String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export function renderHead({ title, description, path = '/', type = 'website', image, noindex = false, schema = [] }) {
  const fullTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} · ${SITE.tagline} em ${SITE.city}`;
  const url = absolute(path);
  const img = absolute(image ? `${image}-1200.webp` : '/img/og.png');
  const [w, h] = image ? [1200, 900] : [1200, 630];

  return [
    `<title>${escape(fullTitle)}</title>`,
    `<meta name="description" content="${escape(description)}">`,
    `<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow'}">`,
    `<link rel="canonical" href="${url}">`,
    '<meta name="theme-color" content="#efe8da">',
    `<meta property="og:site_name" content="${SITE.name}">`,
    '<meta property="og:locale" content="pt_PT">',
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:title" content="${escape(fullTitle)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${img}">`,
    `<meta property="og:image:width" content="${w}">`,
    `<meta property="og:image:height" content="${h}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escape(fullTitle)}">`,
    `<meta name="twitter:description" content="${escape(description)}">`,
    `<meta name="twitter:image" content="${img}">`,
    ...schema.filter(Boolean).map(jsonLd),
  ].join('\n  ');
}

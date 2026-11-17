import { env } from '../config/env.js';

const SITE_NAME = 'Bairro';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1759975142115-23f8862b6748?w=1200&h=630&q=75&auto=format&fit=crop';

export const absolute = (path = '/') => `${env.siteUrl}${path}`;

const escape = (value = '') =>
  String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

// JSON-LD dentro de <script>: impede que um "</script>" nos dados feche a tag
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

export function renderHead({ title, description, path = '/', image = DEFAULT_IMAGE, type = 'website', noindex = false, schema = [], preload = [] }) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · Estúdio de design no Porto`;
  const url = absolute(path);

  const tags = [
    `<title>${escape(fullTitle)}</title>`,
    `<meta name="description" content="${escape(description)}">`,
    `<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">`,
    `<link rel="canonical" href="${url}">`,
    '<meta name="theme-color" content="#3b6e8f">',
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    '<meta property="og:locale" content="pt_PT">',
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:title" content="${escape(fullTitle)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${escape(image)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escape(fullTitle)}">`,
    `<meta name="twitter:description" content="${escape(description)}">`,
    `<meta name="twitter:image" content="${escape(image)}">`,
    ...preload.map(({ href, srcset, sizes }) =>
      srcset
        ? `<link rel="preload" as="image" imagesrcset="${escape(srcset)}" imagesizes="${escape(sizes)}" fetchpriority="high">`
        : `<link rel="preload" as="image" href="${escape(href)}" fetchpriority="high">`,
    ),
    ...schema.filter(Boolean).map(jsonLd),
  ];

  return tags.join('\n  ');
}

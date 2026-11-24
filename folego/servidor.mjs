// Servidor pequeno só para ver o site no computador: entrega os ficheiros de public/
// com endereços limpos (/aulas em vez de /aulas.html), cabeçalhos de segurança e gzip.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';

const PORT = Number(process.env.PORT) || 3010;
const ROOT = join(import.meta.dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
};
const HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
};

async function find(path) {
  const clean = normalize(decodeURIComponent(path)).replace(/^([/\\])+/, '');
  if (clean.startsWith('..')) return null;
  for (const candidate of [clean || 'index.html', `${clean}.html`, join(clean, 'index.html')]) {
    const file = join(ROOT, candidate);
    if (!file.startsWith(ROOT)) return null;
    try { if ((await stat(file)).isFile()) return file; } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.endsWith('.html')) { res.writeHead(301, { Location: url.pathname.replace(/(index)?\.html$/, '') || '/' }); return res.end(); }
    const file = await find(url.pathname);
    const status = file ? 200 : 404;
    const path = file || join(ROOT, '404.html');
    let body = await readFile(path);
    const type = TYPES[extname(path)] || 'application/octet-stream';
    const headers = { ...HEADERS, 'Content-Type': type, 'Cache-Control': /\.(woff2|png|webp|svg)$/.test(path) ? 'public, max-age=31536000, immutable' : 'no-cache' };
    if (/text|javascript|xml|svg|json/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) { body = gzipSync(body); headers['Content-Encoding'] = 'gzip'; headers.Vary = 'Accept-Encoding'; }
    res.writeHead(status, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Erro no servidor');
  }
}).listen(PORT, () => console.log(`Fôlego em http://localhost:${PORT}`));

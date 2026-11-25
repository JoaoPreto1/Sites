// Gera as imagens do quadro de chaves (as que se veem antes do 3D carregar) a partir do próprio 3D.
// Uso: npm run quadro   (precisa do Google Chrome instalado; CHROME=caminho para outro)
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const chromePath = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };
const server = createServer((req, res) => {
  const path = normalize(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  if (!path.startsWith(normalize(root))) return res.writeHead(403).end();
  let body;
  try {
    body = readFileSync(path);
  } catch {
    return res.writeHead(404).end();
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(body);
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}/scripts/quadro.html`;

const port = 9400 + Math.floor(Math.random() * 300);
const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${port}`, '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', `--user-data-dir=${process.env.TEMP ?? '/tmp'}/arriba-quadro`, 'about:blank']);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 40 && !targets; i++) {
  await wait(250);
  targets = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json()).catch(() => null);
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true }))?.result?.result?.value;
await send('Page.enable');

// [ficheiro, largura, altura, escala, parâmetros]
const jobs = [
  ['quadro.webp', 1200, 1000, 1, '?e=03'],
  ['quadro-telemovel.webp', 390, 460, 2, '?e=03'],
  ['chave.webp', 400, 600, 1.5, '?livres=02,03,04&e=03&perto'],
];
for (const [file, width, height, scale, query] of jobs) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
  await send('Page.navigate', { url: base + query });
  for (let i = 0; i < 150; i++) {
    await wait(200);
    if (await evaluate('document.body?.dataset.ready === "1"')) break;
  }
  const shot = await send('Page.captureScreenshot', { format: 'webp', quality: 80 });
  writeFileSync(join(root, 'public/img', file), Buffer.from(shot.result.data, 'base64'));
  console.log('ok', file);
}
ws.close();
chrome.kill();
server.close();

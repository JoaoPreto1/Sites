// Gera as imagens dos trabalhos, das provas, a imagem de partilha e os ícones a partir de arte.html.
// Uso: node scripts/imagens/gerar.mjs [cena ...]   (precisa do Google Chrome instalado; CHROME=caminho para outro)
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = (p) => join(root, 'public', p);
const chromePath = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };

// Servidor estático mínimo só para a pasta do projeto (o Chrome não carrega fontes de file://)
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
const base = `http://127.0.0.1:${server.address().port}/scripts/imagens/arte.html`;

const port = 9600 + Math.floor(Math.random() * 300);
const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${port}`, '--hide-scrollbars', '--force-device-scale-factor=1', `--user-data-dir=${process.env.TEMP ?? '/tmp'}/pilha-arte`, 'about:blank']);
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
    pending.get(m.id)(m.result);
    pending.delete(m.id);
  }
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }))?.result?.value;

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });

async function open(scene) {
  await send('Page.navigate', { url: `${base}?c=${scene}` });
  for (let i = 0; i < 40; i++) {
    await wait(100);
    if (await evaluate('document.body?.dataset.ready === "1"')) break;
  }
  await wait(150);
}

const capture = async (clip, format = 'webp', quality = 80) =>
  Buffer.from((await send('Page.captureScreenshot', { format, quality: format === 'png' ? undefined : quality, clip })).data, 'base64');

await open('og');
const all = await evaluate('window.SCENES');
const wanted = process.argv.slice(2);
const scenes = wanted.length ? all.filter((s) => wanted.includes(s)) : all;
const proofs = ['teatro-', 'lota-esbocos', 'lota-polvo', 'sotao-'];
mkdirSync(out('img/trabalhos'), { recursive: true });
mkdirSync(out('img/provas'), { recursive: true });

for (const scene of scenes) {
  await open(scene);
  if (scene === 'og') {
    writeFileSync(out('img/og.png'), await capture({ x: 0, y: 0, width: 1200, height: 630, scale: 1 }, 'png'));
  } else if (scene === 'icon') {
    const square = (size) => ({ x: 150, y: 0, width: 900, height: 900, scale: size / 900 });
    writeFileSync(out('apple-touch-icon.png'), await capture(square(180), 'png'));
    writeFileSync(out('icon-512.png'), await capture(square(512), 'png'));
  } else {
    const isProof = proofs.some((p) => scene.startsWith(p)) && !/^teatro-do-largo/.test(scene);
    const folder = isProof ? 'img/provas' : 'img/trabalhos';
    for (const w of [480, 800, 1200]) {
      writeFileSync(out(`${folder}/${scene}-${w}.webp`), await capture({ x: 0, y: 0, width: 1200, height: 900, scale: w / 1200 }, 'webp', w === 480 ? 74 : 80));
    }
  }
  console.log('ok', scene);
}

ws.close();
chrome.kill();
server.close();

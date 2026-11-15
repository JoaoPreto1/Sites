import { CanvasTexture, SRGBColorSpace } from '/vendor/three.min.js';
import { cover } from '../shared/format.js';

const images = new Map();

export function loadImage(url) {
  if (!images.has(url)) {
    images.set(
      url,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      }),
    );
  }
  return images.get(url);
}

function canvas(size) {
  const el = document.createElement('canvas');
  el.width = el.height = size;
  return [el, el.getContext('2d')];
}

function texture(el, maxAnisotropy) {
  const tex = new CanvasTexture(el);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

const FONT = "'Archivo', Arial, sans-serif";

// Capa: começa com a cor do disco e o nome, e troca pela imagem quando ela chega
export function coverTexture(record, anisotropy = 4) {
  const [el, ctx] = canvas(512);
  ctx.fillStyle = record.color;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.font = `800 44px ${FONT}`;
  ctx.fillText(record.artist.slice(0, 18), 30, 420);
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText(record.title.slice(0, 24), 30, 466);
  const tex = texture(el, anisotropy);

  loadImage(cover(record, 600))
    .then((img) => {
      ctx.drawImage(img, 0, 0, 512, 512);
      tex.needsUpdate = true;
    })
    .catch(() => {});
  return tex;
}

// Verso da capa: cartão com a lista de faixas, como nas contracapas
export function backTexture(record, anisotropy = 4) {
  const [el, ctx] = canvas(256);
  ctx.fillStyle = '#e4dccb';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = record.color;
  ctx.fillRect(0, 0, 256, 18);
  ctx.fillStyle = '#2a221c';
  ctx.font = `800 15px ${FONT}`;
  ctx.fillText(record.title.slice(0, 26).toUpperCase(), 14, 44);
  ctx.font = `400 10px ${FONT}`;
  record.tracks.slice(0, 14).forEach((t, i) => ctx.fillText(`${i + 1}. ${t.title.slice(0, 34)}`, 14, 66 + i * 13));
  return texture(el, anisotropy);
}

// Patilha do separador de cartão, com o nome do caixote escrito a marcador
export function tabTexture(name, anisotropy = 4) {
  const el = document.createElement('canvas');
  el.width = 512;
  el.height = 192;
  const ctx = el.getContext('2d');
  ctx.fillStyle = '#ddd1ba';
  ctx.fillRect(0, 0, 512, 192);
  ctx.fillStyle = '#1a1410';
  ctx.font = `86px 'Permanent Marker', ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name.toUpperCase(), 256, 104, 480);
  return texture(el, anisotropy);
}

// Vinil visto de cima: sulcos, separações entre faixas e o rótulo do centro
export function vinylTexture(record, anisotropy = 8) {
  const S = 1024;
  const c = S / 2;
  const [el, ctx] = canvas(S);
  const labelR = c * 0.34;
  const outer = c * 0.985;

  ctx.fillStyle = '#080808';
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.fill();

  for (let r = labelR * 1.08; r < outer; r += 1.15) {
    ctx.strokeStyle = `rgba(255,255,255,${0.018 + Math.random() * 0.05})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // As faixas do lado A: um anel mais liso entre cada uma, como num disco a sério
  const side = record.tracks.slice(0, Math.ceil(record.tracks.length / (record.tracks.length > 12 ? 4 : 2)));
  const total = side.reduce((s, t) => s + t.ms, 0) || 1;
  let acc = 0;
  for (const t of side.slice(0, -1)) {
    acc += t.ms;
    const r = outer - (outer - labelR * 1.12) * (acc / total);
    ctx.strokeStyle = 'rgba(0,0,0,.9)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(c, c, r + 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  const drawLabel = (img) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(c, c, labelR, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = record.color;
    ctx.fillRect(c - labelR, c - labelR, labelR * 2, labelR * 2);
    if (img) {
      ctx.globalAlpha = 0.92;
      ctx.drawImage(img, c - labelR * 0.62, c - labelR * 0.62, labelR * 1.24, labelR * 1.24);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(0,0,0,.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(c, c, labelR * 0.66, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f4ede0';
    ctx.textAlign = 'center';
    ctx.font = `800 26px ${FONT}`;
    ctx.fillText(record.artist.toUpperCase().slice(0, 26), c, c - labelR * 0.76);
    ctx.font = `500 20px ${FONT}`;
    ctx.fillText(`LADO A · 33⅓ RPM · ${record.year}`, c, c + labelR * 0.86);

    ctx.fillStyle = '#d8d8d8';
    ctx.beginPath();
    ctx.arc(c, c, 9, 0, Math.PI * 2);
    ctx.fill();
  };

  drawLabel(null);
  const tex = texture(el, anisotropy);
  loadImage(cover(record, 300))
    .then((img) => {
      drawLabel(img);
      tex.needsUpdate = true;
    })
    .catch(() => {});
  return tex;
}

// Veio de madeira para o caixote e para a base do gira-discos
export function woodTexture({ base = '#8a5a34', dark = '#6a4226', light = '#a3714a', size = 512, anisotropy = 4 } = {}) {
  const [el, ctx] = canvas(size);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle = Math.random() > 0.5 ? dark : light;
    ctx.globalAlpha = 0.15 + Math.random() * 0.35;
    ctx.lineWidth = 0.6 + Math.random() * 2.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 32) ctx.lineTo(x, y + Math.sin(x / 70 + i) * 3);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return texture(el, anisotropy);
}

// Estêncil pintado na frente do caixote
export function stencilTexture(text, anisotropy = 4) {
  const [el, ctx] = canvas(1024);
  ctx.clearRect(0, 0, 1024, 1024);
  ctx.fillStyle = 'rgba(25,15,8,.62)';
  ctx.font = `900 150px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), 40, 512, 940);
  return texture(el, anisotropy);
}

// Mancha de luz no chão, a desvanecer até à cor da página
export function floorTexture() {
  const [el, ctx] = canvas(512);
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, 'rgba(78,52,34,.95)');
  g.addColorStop(0.35, 'rgba(46,32,22,.6)');
  g.addColorStop(0.62, 'rgba(18,16,16,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return texture(el, 1);
}

import { escapeHtml } from './format.js';

// Cada vinho é desenhado como uma garrafa com um rótulo próprio, em vez de uma fotografia
const SHAPES = {
  bordalesa: { neck: 14, top: 8, shoulderStart: 88, shoulder: 122, body: 56, capsule: 46 },
  borgonha: { neck: 14, top: 8, shoulderStart: 66, shoulder: 150, body: 62, capsule: 44 },
  alsaciana: { neck: 12, top: 4, shoulderStart: 96, shoulder: 178, body: 46, capsule: 42 },
  espumante: { neck: 18, top: 10, shoulderStart: 70, shoulder: 142, body: 64, capsule: 72 },
  porto: { neck: 18, top: 44, shoulderStart: 100, shoulder: 132, body: 62, capsule: 34 },
};

const GLASS = {
  tinto: '#1f261d',
  generoso: '#3b2416',
  branco: '#a3ae80',
  rose: '#dcaea2',
  espumante: '#1d2a21',
};

const BOTTOM = 292;

function outline({ neck, top, shoulderStart, shoulder, body }) {
  const n = neck / 2;
  const b = body / 2;
  const span = shoulder - shoulderStart;
  const left = `C ${50 - n} ${shoulderStart + span * 0.55} ${50 - b} ${shoulder - span * 0.45} ${50 - b} ${shoulder}`;
  const right = `C ${50 + b} ${shoulder - span * 0.45} ${50 + n} ${shoulderStart + span * 0.55} ${50 + n} ${shoulderStart}`;
  return [
    `M ${50 - n} ${top}`,
    `L ${50 - n} ${shoulderStart}`,
    left,
    `L ${50 - b} ${BOTTOM - 8}`,
    `Q ${50 - b} ${BOTTOM} ${50 - b + 8} ${BOTTOM}`,
    `L ${50 + b - 8} ${BOTTOM}`,
    `Q ${50 + b} ${BOTTOM} ${50 + b} ${BOTTOM - 8}`,
    `L ${50 + b} ${shoulder}`,
    right,
    `L ${50 + n} ${top}`,
    'Z',
  ].join(' ');
}

// Parte o nome em 1 a 3 linhas e escolhe a divisão que deixa a letra maior
function fitName(name, width, height) {
  const words = name.split(' ');
  const options = [[name]];
  for (let i = 1; i < words.length; i++) {
    options.push([words.slice(0, i).join(' '), words.slice(i).join(' ')]);
    for (let j = i + 1; j < words.length; j++) {
      options.push([words.slice(0, i).join(' '), words.slice(i, j).join(' '), words.slice(j).join(' ')]);
    }
  }

  let best = { lines: [name], size: 0 };
  for (const lines of options) {
    const longest = Math.max(...lines.map((l) => l.length));
    const size = Math.min(9.5, (width - 6) / (longest * 0.5), height / (lines.length * 1.1));
    if (size > best.size + 0.3) best = { lines, size };
  }
  return best;
}

export function bottle(wine, { title = true, className = 'bottle' } = {}) {
  const shape = SHAPES[wine.shape] ?? SHAPES.bordalesa;
  const glass = GLASS[wine.type] ?? GLASS.tinto;
  const { paper, ink } = wine.label;
  const b = shape.body / 2;

  const labelX = 50 - b + 5;
  const labelW = shape.body - 10;
  const labelY = shape.shoulder + (wine.shape === 'porto' ? 22 : 30);
  const labelH = Math.min(116, BOTTOM - 26 - labelY);
  const cx = 50;

  const { lines, size } = fitName(wine.name, labelW, labelH * 0.5);
  const nameY = labelY + labelH * 0.46 - ((lines.length - 1) * size) / 2;
  const year = wine.year ? String(wine.year) : 'Sem ano';
  const name = escapeHtml(wine.name);

  return `<svg class="${className}" viewBox="0 0 100 300" role="img" aria-label="${title ? `Garrafa de ${name}` : ''}"${title ? '' : ' aria-hidden="true"'}>
  <path d="${outline(shape)}" fill="${glass}"/>
  <rect x="${50 - shape.neck / 2 - 0.6}" y="${shape.top}" width="${shape.neck + 1.2}" height="${shape.capsule}" rx="1.5" fill="${ink}"/>
  <rect x="${50 - b + 5}" y="${shape.shoulder + 6}" width="3.5" height="${BOTTOM - shape.shoulder - 18}" rx="1.75" fill="#fff" opacity=".14"/>
  <rect x="${labelX}" y="${labelY}" width="${labelW}" height="${labelH}" fill="${paper}"/>
  <rect x="${labelX + 2.5}" y="${labelY + 2.5}" width="${labelW - 5}" height="${labelH - 5}" fill="none" stroke="${ink}" stroke-width=".5" opacity=".7"/>
  <text x="${cx}" y="${labelY + 13}" text-anchor="middle" fill="${ink}" font-family="IBM Plex Mono, monospace" font-size="4" letter-spacing=".8">${escapeHtml(year.toUpperCase())}</text>
  ${lines
    .map((line, i) => `<text x="${cx}" y="${nameY + i * size * 1.05}" text-anchor="middle" fill="${ink}" font-family="Newsreader, Georgia, serif" font-style="italic" font-size="${size.toFixed(2)}">${escapeHtml(line)}</text>`)
    .join('')}
  <line x1="${cx - 8}" x2="${cx + 8}" y1="${labelY + labelH - 18}" y2="${labelY + labelH - 18}" stroke="${ink}" stroke-width=".5"/>
  <text x="${cx}" y="${labelY + labelH - 9}" text-anchor="middle" fill="${ink}" font-family="IBM Plex Mono, monospace" font-size="3.4" letter-spacing=".6">PORTUGAL</text>
</svg>`;
}

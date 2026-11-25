// Composições de cada trabalho fictício, desenhadas com HTML e SVG e fotografadas pelo gerar.mjs.
// Cada cena tem 1200 × 900. O nome vem do hash: #lota-velha-1, #teatro-inicio-1, #og…
const C = { bg: '#efe8da', paper: '#fbf7ef', ink: '#141210', red: '#d9361f', blue: '#2348d8', yellow: '#f6c21c', green: '#0b7a53', pink: '#f3a6c8', kraft: '#c9a57a', navy: '#1d2b5e', olive: '#6b7a2a', sky: '#9ec9e8', cream: '#f4ecd8' };

const st = (o) => Object.entries(o).map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${typeof v === 'number' && !/opacity|z-index|font-weight|line-height|flex/.test(k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())) ? v + 'px' : v}`).join(';');
const box = (style, inner = '', cls = '') => `<div class="abs ${cls}" style="${st(style)}">${inner}</div>`;
const bg = (color, extra = '') => box({ inset: 0, background: color }, '', extra);
const text = (s, style, cls = 't') => box(style, s, cls);
const rot = (deg) => `rotate(${deg}deg)`;

// ---------- Primitivas ----------
function can({ x, y, w = 420, h = 270, r = 0, color, num, fish, sub = 'em azeite', ink = C.ink, numSize = 190, ring = true, fishSize = 22 }) {
  return `<div class="can" style="${st({ left: x, top: y, width: w, height: h, transform: rot(r), background: color, color: ink })}">
    <div class="small">Lota Velha · Matosinhos</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end"><span class="num" style="font-size:${numSize}px">${num}</span><span style="text-align:right"><span class="fish" style="font-size:${fishSize}px">${fish}</span><br><span class="small">${sub}</span></span></div>
    ${ring ? `<span class="ring" style="right:24px;top:18px;background:${C.paper}"></span>` : ''}
  </div>`;
}

const bottleSvg = (glass, w = 160, h = 520) =>
  `<svg width="${w}" height="${h}" viewBox="0 0 160 520"><path d="M62 6h36v92c0 26 46 54 46 110v290c0 8-6 14-14 14H30c-8 0-14-6-14-14V208c0-56 46-84 46-110z" fill="${glass}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/><rect x="58" y="2" width="44" height="26" rx="4" fill="${C.ink}"/><path d="M40 230v240" stroke="#ffffff55" stroke-width="10" stroke-linecap="round"/></svg>`;

function bottle({ x, y, s = 1, glass = '#3c2a1a', label, r = 0 }) {
  return `<div class="bottle" style="${st({ left: x, top: y, transform: `${rot(r)} scale(${s})`, transformOrigin: 'bottom center' })}">${bottleSvg(glass)}${label}</div>`;
}

const crane = (pose = 0, color = C.ink, w = 220) => {
  const arm = [-18, -4, 8, 20][pose];
  return `<svg width="${w}" height="${w}" viewBox="0 0 200 200" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M60 190V60M90 190V60M60 60h30M60 100l30 30M90 100l-30 30M60 150l30 30M90 150l-30 30"/><g transform="rotate(${arm} 75 60)"><path d="M20 60h170M75 60L130 30l60 30"/><path d="M175 60v${50 + pose * 15}"/><rect x="164" y="${110 + pose * 15}" width="22" height="16" fill="${color}"/></g></svg>`;
};

function book({ x, y, w = 330, h = 470, r = 0, color, title, author, ink = C.ink, size = 120 }) {
  return `<div class="book" style="${st({ left: x, top: y, width: w, height: h, transform: rot(r), background: color, color: ink })}"><span class="au">${author}</span><span class="ti" style="font-size:${size}px">${title}</span><span class="au" style="font-size:14px">Mão Esquerda</span></div>`;
}

const browser = ({ x, y, w, h, r = 0, url, page }) =>
  `<div class="browser" style="${st({ left: x, top: y, width: w, height: h, transform: rot(r) })}"><div class="bar"><i></i><i></i><i></i><b>${url}</b></div><div class="page">${page}</div></div>`;

const phone = ({ x, y, w = 300, h = 600, r = 0, scr }) => `<div class="phone" style="${st({ left: x, top: y, width: w, height: h, transform: rot(r) })}"><div class="scr">${scr}</div></div>`;

const wave = (color, y = 0, amp = 60) =>
  `<svg class="abs" style="left:0;top:${y}px" width="1200" height="${amp * 4 + 600}" viewBox="0 0 1200 ${amp * 4 + 600}"><path d="M0 ${amp * 2} C 200 ${amp * 4}, 400 0, 600 ${amp * 2} S 1000 ${amp * 4}, 1200 ${amp * 2} V ${amp * 4 + 600} H 0 Z" fill="${color}" stroke="${C.ink}" stroke-width="6"/></svg>`;

const hills = (color, points, y, stroke = C.ink) =>
  `<svg class="abs" style="left:0;top:${y}px" width="1200" height="400" viewBox="0 0 1200 400"><path d="M0 ${points[0]} ${points.map((p, i) => `L ${(i * 1200) / (points.length - 1)} ${p}`).join(' ')} V 400 H 0 Z" fill="${color}" stroke="${stroke}" stroke-width="6" stroke-linejoin="round"/></svg>`;

const largoMark = (size = 300, fill = C.red, door = C.ink) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${fill}" stroke="${C.ink}" stroke-width="4"/><path d="M38 96V58a12 12 0 0 1 24 0v38" fill="${door}"/></svg>`;

const ear = (size = 140, color = C.ink) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"><path d="M50 92V30"/><path d="M50 40c-14-4-20-14-20-24 12 2 20 10 20 24zM50 40c14-4 20-14 20-24-12 2-20 10-20 24zM50 58c-14-4-20-14-20-24 12 2 20 10 20 24zM50 58c14-4 20-14 20-24-12 2-20 10-20 24zM50 76c-14-4-20-14-20-24 12 2 20 10 20 24zM50 76c14-4 20-14 20-24-12 2-20 10-20 24z" fill="${color}"/></svg>`;

const antenna = (sway = 0, color = C.ink, size = 300) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 200 200" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M100 190V90"/><g transform="rotate(${sway} 100 90)"><path d="M30 60h140M100 90L30 60M100 90l70-30"/><path d="M50 60v22M80 60v30M120 60v26M150 60v18" stroke-width="5"/><rect x="42" y="80" width="16" height="22" fill="${C.yellow}" stroke-width="4"/><rect x="112" y="84" width="16" height="22" fill="${C.pink}" stroke-width="4"/><circle cx="100" cy="40" r="10" fill="${C.red}"/><path d="M100 50v10"/></g><path d="M70 190h60"/></svg>`;

const whiskers = (size = 120, color = C.ink) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"><path d="M50 36c-8 0-12 6-12 12 0 8 6 12 12 12s12-4 12-12c0-6-4-12-12-12z" fill="${color}"/><path d="M38 52L8 44M38 58L6 60M38 64L10 76M62 52l30-8M62 58l32 2M62 64l28 12"/></svg>`;

const wheel = (size, color = C.ink) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" stroke="${color}" stroke-width="4"><circle cx="50" cy="50" r="44" stroke-width="8"/><circle cx="50" cy="50" r="6" fill="${color}"/>${Array.from({ length: 12 }, (_, i) => `<path d="M50 50L${50 + 44 * Math.cos((i * Math.PI) / 6)} ${50 + 44 * Math.sin((i * Math.PI) / 6)}" stroke-width="2"/>`).join('')}</svg>`;

// ---------- Páginas de sites (para os ecrãs) ----------
const theatrePage = (v = 1) => `
  ${box({ left: 0, top: 0, right: 0, height: 70, background: C.paper, borderBottom: `4px solid ${C.ink}` }, `${box({ left: 28, top: 13 }, largoMark(40))}${text('Teatro do Largo', { left: 82, top: 24, fontSize: 22 }, 't c80')}${['Programação', 'Escolas', 'Sobre'].map((l, i) => text(l, { left: 430 + i * 130, top: 26, fontSize: 16, fontWeight: 700 }, 'c100')).join('')}${v === 2 ? box({ right: 26, top: 12, height: 44, padding: '0 18px', background: C.red, color: '#fff', border: `4px solid ${C.ink}`, display: 'flex', alignItems: 'center', fontWeight: 900, fontSize: 16, letterSpacing: '0.06em' }, 'BILHETES') : ''}`)}
  ${box({ left: 0, top: 74, right: 0, bottom: 0, background: C.yellow })}
  ${text('Temporada<br>de inverno', { left: 40, top: 120, fontSize: 118, color: C.ink }, 't c62')}
  ${box({ right: 50, top: 110 }, largoMark(300))}
  ${text('12 peças · 3 estreias · sessões para escolas às quartas', { left: 44, top: 352, fontSize: 20, fontWeight: 700 }, 'c100')}
  ${v === 1 ? box({ left: 44, top: 520, height: 56, padding: '0 26px', background: C.red, color: '#fff', border: `4px solid ${C.ink}`, display: 'flex', alignItems: 'center', fontWeight: 900, fontSize: 18 }, 'COMPRAR BILHETE') : ''}
  ${[0, 1, 2].map((i) => box({ left: 44 + i * 300, top: v === 1 ? 410 : 410, width: 270, height: 90, background: C.paper, border: `4px solid ${C.ink}`, padding: 14 }, `<b style="font:900 22px Archivo;font-stretch:70%;text-transform:uppercase">${['A Casa ao Lado', 'Sopa de Pedra', 'Nove Janelas'][i]}</b><div style="font:600 14px Archivo;margin-top:6px">${['Sex 20h', 'Sáb 16h', 'Dom 18h'][i]} · Sala 1</div>`)).join('')}`;

const shopPage = () => `
  ${box({ left: 0, top: 0, right: 0, height: 66, background: C.ink, color: C.bg }, `${text('Oficina Bicla', { left: 28, top: 20, fontSize: 26, color: C.yellow }, 't c80')}${box({ left: 330, top: 14, width: 420, height: 38, border: `3px solid ${C.bg}`, borderRadius: 20, color: C.bg, font: '600 15px Archivo', display: 'flex', alignItems: 'center', paddingLeft: 16 }, 'Procurar pela medida da roda: 28", 700c…')}${text('Cesto (2)', { right: 30, top: 24, fontSize: 16, fontWeight: 700, color: C.bg }, 'c100')}`)}
  ${box({ left: 0, top: 66, right: 0, bottom: 0, background: '#e7eefc' })}
  ${text('Peças<br>sem<br>compli-<br>car', { left: 34, top: 100, fontSize: 70 }, 't c62')}
  ${box({ left: 34, top: 400 }, '<span class="ui-btn" style="background:#f6c21c">Marcar reparação</span>')}
  ${['Pneu 700×28', 'Corrente 11v', 'Travões V', 'Selim cidade', 'Luzes USB', 'Câmara de ar'].map((n, i) => box({ left: 380 + (i % 3) * 205, top: 100 + Math.floor(i / 3) * 210, width: 185, height: 190, background: '#fff', border: `4px solid ${C.ink}`, padding: 12 }, `<div style="height:110px;display:grid;place-items:center;background:${[C.yellow, C.pink, C.sky, C.bg, C.yellow, C.pink][i]};border:3px solid ${C.ink}">${wheel(80)}</div><div style="font:800 15px Archivo;margin-top:8px">${n}</div><div style="font:600 14px Archivo">${[24, 32, 18, 29, 21, 6][i]},90 €</div>`)).join('')}`;

const vetPage = () => `
  ${box({ left: 0, top: 0, right: 0, height: 66, background: '#fff', borderBottom: `4px solid ${C.ink}` }, `${box({ left: 20, top: 6 }, whiskers(54))}${text('Bigode', { left: 80, top: 18, fontSize: 30 }, 't c80')}${text('Clínica veterinária · Aveiro', { left: 200, top: 26, fontSize: 15, fontWeight: 600 }, 'c100')}`)}
  ${box({ left: 0, top: 66, right: 0, bottom: 0, background: C.pink })}
  ${text('Marcar<br>consulta', { left: 40, top: 110, fontSize: 84 }, 't c62')}
  ${box({ left: 40, top: 330, width: 330, padding: 18, background: '#fff', border: `4px solid ${C.ink}`, font: '700 18px Archivo' }, '1 · Quem é o paciente?<div style="margin-top:12px;display:flex;gap:10px"><span class="ui-btn" style="background:#f6c21c">Gato</span><span class="ui-btn">Cão</span><span class="ui-btn">Outro</span></div>')}
  ${box({ left: 440, top: 110, width: 600, height: 420, background: '#fff', border: `4px solid ${C.ink}`, padding: 22 }, `<b style="font:900 30px Archivo;font-stretch:70%;text-transform:uppercase">Dezembro</b><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:16px">${Array.from({ length: 28 }, (_, i) => `<span style="height:62px;border:3px solid ${C.ink};display:grid;place-items:center;font:800 18px Archivo;background:${i === 9 ? C.blue : [2, 3, 11, 16, 17, 23].includes(i) ? C.bg : '#fff'};color:${i === 9 ? '#fff' : C.ink}">${i + 1}</span>`).join('')}</div>`)}`;

// ---------- Cenas ----------
const S = {};

// Lota Velha
S['lota-velha-1'] = () => `${bg(C.navy)}<div class="dots" style="opacity:.5"></div>
  ${can({ x: 90, y: 120, r: -8, color: C.yellow, num: '07', fish: 'Sardinha' })}
  ${can({ x: 620, y: 80, r: 6, color: C.red, num: '03', fish: 'Cavala', ink: '#fff' })}
  ${can({ x: 340, y: 470, r: -2, color: C.green, num: '11', fish: 'Polvo', ink: '#fff' })}
  ${text('Lota<br>Velha', { right: 60, bottom: 50, fontSize: 120, color: C.bg }, 't c62')}`;
S['lota-velha-2'] = () => `${bg(C.bg)}<div class="dots"></div>
  ${can({ x: 140, y: 150, w: 920, h: 580, r: -3, color: C.yellow, num: '07', fish: 'Sardinha', sub: 'em azeite virgem · pescada em outubro', numSize: 440 })}`;
S['lota-velha-3'] = () => {
  const colors = [C.yellow, C.red, C.green, C.blue, C.pink, C.yellow, C.red, C.green, C.pink, C.blue, C.yellow, C.red];
  const fish = ['Sardinha', 'Cavala', 'Polvo', 'Atum', 'Lula', 'Sardinha', 'Cavala', 'Polvo', 'Lula', 'Atum', 'Sardinha', 'Cavala'];
  return `${bg('#d8cfbf')}${[0, 1, 2].map((row) => box({ left: 0, right: 0, top: 260 + row * 260, height: 24, background: '#8a6a45', borderTop: `5px solid ${C.ink}`, borderBottom: `5px solid ${C.ink}` })).join('')}
  ${colors.map((c, i) => can({ x: 50 + (i % 4) * 280, y: 60 + Math.floor(i / 4) * 260, w: 250, h: 190, r: (i % 3) - 1, color: c, num: String((i * 7) % 12 + 1).padStart(2, '0'), fish: fish[i], ink: [C.red, C.green, C.blue].includes(c) ? '#fff' : C.ink, numSize: 100, ring: false, fishSize: 15 })).join('')}`;
};

// Teatro do Largo
S['teatro-do-largo-1'] = () => `${bg(C.paper)}<div class="dots"></div>
  ${box({ left: 120, top: 90, width: 520, height: 720, background: C.yellow, border: `6px solid ${C.ink}`, transform: rot(-3), padding: 40 }, `<div style="display:flex;justify-content:center;margin-top:20px">${largoMark(330)}</div><div class="t c62" style="font-size:96px;margin-top:40px;text-align:center">Teatro<br>do Largo</div>`, 'hard')}
  ${box({ left: 720, top: 160 }, largoMark(380, C.red, C.ink))}
  ${text('um círculo<br>e uma porta', { left: 740, top: 600, fontSize: 64 }, 't c70')}`;
S['teatro-do-largo-2'] = () => {
  const inks = [C.red, C.blue, C.ink, C.green, C.red, C.blue, C.ink];
  return `${bg('#f3ead6')}<div class="grain"></div>${inks.map((c, i) => `<div class="stamp" style="${st({ left: 60 + (i % 4) * 280 + (i > 3 ? 140 : 0), top: 90 + Math.floor(i / 4) * 380 + (i % 2) * 40, width: 260, height: 260, color: c, transform: rot((i * 23) % 40 - 20) })}"><svg width="180" height="180" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="currentColor"/><path d="M38 90V56a12 12 0 0 1 24 0v34" fill="#f3ead6"/></svg></div>`).join('')}
  ${text('Sala 1 · Sala 2 · Bar · Bilheteira', { left: 70, bottom: 50, fontSize: 30, fontWeight: 800 }, 'c80')}`;
};
S['teatro-do-largo-3'] = () => `${bg(C.red)}<div class="dots" style="opacity:.4"></div>
  ${[0, 1, 2].map((i) => box({ left: 140 + i * 40, top: 140 + i * 170, width: 820, height: 260, background: [C.paper, C.yellow, C.pink][i], border: `6px solid ${C.ink}`, transform: rot([-6, 2, -2][i]), display: 'flex', alignItems: 'center', gap: 40, padding: '0 44px' }, `${largoMark(170)}<div><div class="t c62" style="font-size:58px">${['A Casa ao Lado', 'Sopa de Pedra', 'Nove Janelas'][i]}</div><div style="font:700 22px Archivo;margin-top:12px;letter-spacing:.06em">FILA ${'CFH'[i]} · LUGAR ${[7, 12, 3][i]} · SALA 1</div></div><div style="margin-left:auto;border-left:5px dashed ${C.ink};height:100%;width:90px;display:grid;place-items:center"><span class="t c62" style="font-size:54px;writing-mode:vertical-rl">N.º ${[214, 87, 302][i]}</span></div>`, 'hard')).join('')}`;

// Fermento Lento
const bag = (x, y, r, date) =>
  box({ left: x, top: y, width: 380, height: 560, background: C.kraft, border: `6px solid ${C.ink}`, transform: rot(r), clipPath: 'polygon(0 4%, 6% 0, 12% 4%, 18% 0, 24% 4%, 30% 0, 36% 4%, 42% 0, 48% 4%, 54% 0, 60% 4%, 66% 0, 72% 4%, 78% 0, 84% 4%, 90% 0, 96% 4%, 100% 0, 100% 100%, 0 100%)', padding: '90px 30px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }, `${ear(150)}<div class="t c125" style="font-size:58px;text-align:center;line-height:.9">Fer<br>mento<br>lento</div><div style="border:4px solid ${C.red};color:${C.red};font:800 20px Archivo;padding:6px 14px;transform:rotate(-6deg);letter-spacing:.08em">FORNADA ${date}</div>`);
S['fermento-lento-1'] = () => `${bg(C.cream)}<div class="dots"></div>${bag(150, 200, -5, '12·03')}${bag(620, 150, 4, '13·03')}`;
S['fermento-lento-2'] = () => `${bg(C.blue)}<div class="dots" style="opacity:.4"></div>${[0, 1, 2, 3].map((i) => box({ left: 110 + (i % 2) * 520, top: 110 + Math.floor(i / 2) * 360, width: 460, height: 290, background: C.cream, border: `6px solid ${C.ink}`, transform: rot([-3, 2, 3, -2][i]), padding: 26 }, `<div style="display:flex;align-items:center;gap:14px">${ear(54)}<span class="t c125" style="font-size:28px">Fermento lento</span></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:26px">${Array.from({ length: 10 }, (_, k) => `<span style="height:54px;border:4px solid ${C.ink};border-radius:50%;background:${k < [3, 7, 10, 5][i] ? C.red : 'transparent'}"></span>`).join('')}</div>`, 'hard')).join('')}`;
S['fermento-lento-3'] = () => `${bg('#b9d3c6')}${box({ left: 0, top: 0, right: 0, height: 90, background: C.ink })}${box({ left: 595, top: 90, width: 10, height: 160, background: C.ink })}
  ${box({ left: 340, top: 230, width: 520, height: 520, borderRadius: '50%', background: C.cream, border: `10px solid ${C.ink}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }, `${ear(170)}<div class="t c125" style="font-size:64px;text-align:center">Fermento<br>lento</div><div style="font:800 20px Archivo;letter-spacing:.2em">PADARIA · PORTO</div>`, 'hard')}`;

// Mão Esquerda
S['mao-esquerda-1'] = () => `${bg(C.bg)}<div class="dots"></div>
  ${book({ x: 70, y: 220, r: -6, color: C.red, ink: '#fff', title: 'Sal<br>na<br>boca', author: 'Rita Amaral' })}
  ${book({ x: 430, y: 150, r: 3, color: C.blue, ink: '#fff', title: 'Os dias<br>úteis', author: 'Hugo Prates', size: 104 })}
  ${book({ x: 800, y: 240, r: -2, color: C.yellow, title: 'Casa<br>fria', author: 'Lia Moura', size: 128 })}`;
S['mao-esquerda-2'] = () => {
  const books = [[C.red, 'Sal na boca'], [C.blue, 'Os dias úteis'], [C.yellow, 'Casa fria'], [C.green, 'Mar de pedra'], [C.pink, 'Tarde'], [C.ink, 'Fim de linha']];
  return `${bg('#d8cfbf')}${box({ left: 0, right: 0, top: 780, height: 120, background: '#8a6a45', borderTop: `6px solid ${C.ink}` })}${books.map(([c, t], i) => `<div class="spine" style="${st({ left: 150 + i * 150, width: 130, height: 560 + (i % 3) * 30, bottom: 120, background: c, color: [C.blue, C.ink, C.red, C.green].includes(c) ? '#fff' : C.ink })}"><span>${t}</span></div>`).join('')}`;
};
S['mao-esquerda-3'] = () => `${bg(C.green)}<div class="dots" style="opacity:.35"></div>
  ${box({ left: 90, top: 120, width: 1020, height: 660, background: C.paper, border: `6px solid ${C.ink}`, transform: rot(-1.5) }, `${box({ left: 509, top: 0, width: 2, bottom: 0, background: '#14121040' })}${box({ left: 60, top: 70, width: 400 }, `<div style="font:800 14px Archivo;letter-spacing:.2em">III</div><div style="font:500 23px/1.7 Archivo;margin-top:30px">Deixei o sal na boca<br>até a manhã acabar,<br>e mesmo assim ninguém<br>me perguntou do mar.<br><br>A casa ficou quieta,<br>a loiça por lavar,<br>e eu a aprender o nome<br>das coisas devagar.</div>`)}${box({ left: 570, top: 70, width: 400 }, `<div class="t c62" style="font-size:150px;color:${C.red}">Sal<br>na<br>boca</div>`)}`, 'hard')}`;

// Grua
const grLabel = (pose, c, name, abv, ink = C.ink) =>
  `<div class="label" style="${st({ left: 22, top: 250, width: 116, height: 170, background: c, color: ink, gap: 2 })}">${crane(pose, ink, 92)}<b style="font:900 19px Archivo;font-stretch:62%;text-transform:uppercase">${name}</b><span style="font:700 11px Archivo">${abv}</span></div>`;
S['grua-1'] = () => `${bg(C.sky)}<div class="dots" style="opacity:.4"></div>${box({ left: 0, right: 0, top: 720, bottom: 0, background: C.navy, borderTop: `6px solid ${C.ink}` })}
  ${[[C.yellow, 'Leve', '4,5%'], [C.pink, 'Ruiva', '5,8%'], [C.red, 'Estiva', '6,9%', '#fff'], [C.ink, 'Carga', '8,5%', C.yellow]].map(([c, n, a, ink], i) => bottle({ x: 140 + i * 240, y: 210, s: 1, glass: '#3a2614', label: grLabel(i, c, n, a, ink) })).join('')}`;
S['grua-2'] = () => `${bg(C.yellow)}<div class="dots" style="opacity:.5"></div>
  ${box({ left: 230, top: 90, width: 740, height: 720, background: C.paper, border: `6px solid ${C.ink}`, transform: rot(2), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, `${crane(3, C.ink, 400)}<div class="t c62" style="font-size:140px">Carga</div><div style="font:800 24px Archivo;letter-spacing:.14em">IMPERIAL STOUT · 8,5% · SETÚBAL</div>`, 'hard')}`;
S['grua-3'] = () => `${bg(C.navy)}${[0, 1, 2, 3].map((i) => box({ left: 90 + (i % 2) * 540, top: 70 + Math.floor(i / 2) * 400, width: 360, height: 360, borderRadius: '50%', background: [C.yellow, C.pink, C.red, C.paper][i], border: `8px solid ${C.ink}`, display: 'grid', placeItems: 'center', transform: rot(i * 12 - 10) }, crane(i, C.ink, 230), 'hard')).join('')}`;

// Contracorrente
S['contracorrente-1'] = () => `${bg(C.blue)}${wave(C.yellow, 380, 70)}${wave(C.pink, 560, 50)}
  ${text('Contra<br>corrente', { left: 60, top: 70, fontSize: 210, color: '#fff' }, 't c62')}
  <div class="tc" style="right:40px;top:40px">00:00:04:12</div>${box({ right: 40, bottom: 40, width: 90, height: 90, borderRadius: '50%', background: C.ink, display: 'grid', placeItems: 'center' }, '<svg width="40" height="40" viewBox="0 0 10 10"><path d="M3 2l5 3-5 3z" fill="#fff"/></svg>')}`;
S['contracorrente-2'] = () => `${bg(C.ink)}${Array.from({ length: 6 }, (_, i) => `<div class="frame" style="${st({ left: 60 + (i % 3) * 370, top: 110 + Math.floor(i / 3) * 360, width: 340, height: 300, background: C.blue, borderColor: C.bg })}"><svg class="abs" style="left:0;top:${230 - i * 34}px" width="340" height="400" viewBox="0 0 340 400"><path d="M0 60 C 80 120, 160 0, 340 60 V 400 H 0 Z" fill="${C.yellow}"/></svg><div class="tc" style="left:10px;top:10px;font-size:13px">00:0${i}</div>${i > 3 ? `<div class="t c62" style="position:absolute;left:20px;bottom:${i === 4 ? 30 : 60}px;font-size:${i === 4 ? 54 : 70}px;color:#fff">${i === 4 ? 'Sábado' : 'Rio'}</div>` : ''}</div>`).join('')}
  ${text('Genérico · 6 s', { left: 60, top: 40, fontSize: 30, color: C.bg }, 't c80')}`;
S['contracorrente-3'] = () => `${bg(C.pink)}<div class="dots" style="opacity:.4"></div>${[0, 1, 2].map((i) => phone({ x: 110 + i * 340, y: 90 + (i % 2) * 60, w: 300, h: 640, r: [-4, 2, 5][i], scr: `${bg([C.blue, C.yellow, C.green][i])}${wave([C.yellow, C.blue, C.pink][i], 300 - i * 40, 40)}<div class="t c62" style="position:absolute;left:22px;top:60px;font-size:72px;color:${i === 1 ? C.ink : '#fff'}">${['Rio<br>acima', 'Sexta<br>22h', 'Palco<br>norte'][i]}</div>` })).join('')}`;

// Oficina Bicla
S['oficina-bicla-1'] = () => `${bg(C.yellow)}<div class="dots" style="opacity:.5"></div>${browser({ x: 70, y: 80, w: 1060, h: 700, r: -1.5, url: 'oficinabicla.exemplo', page: shopPage() })}`;
S['oficina-bicla-2'] = () => `${bg(C.blue)}${[0, 1].map((i) => phone({ x: 230 + i * 400, y: 80 + i * 40, w: 330, h: 700, r: i ? 4 : -4, scr: i === 0 ? `${box({ left: 0, right: 0, top: 0, height: 70, background: C.ink })}${text('Bicla', { left: 20, top: 22, fontSize: 30, color: C.yellow }, 't c80')}${text('Medida da roda', { left: 22, top: 100, fontSize: 40 }, 't c62')}${['26"', '27,5"', '28" / 700c', '29"'].map((m, k) => box({ left: 22, top: 160 + k * 76, width: 256, height: 62, border: `4px solid ${C.ink}`, background: k === 2 ? C.yellow : '#fff', font: '900 22px Archivo', display: 'flex', alignItems: 'center', paddingLeft: 16 }, m)).join('')}${box({ left: 22, top: 500 }, wheel(160))}` : `${box({ left: 0, right: 0, top: 0, height: 70, background: C.ink })}${text('Reparação', { left: 20, top: 22, fontSize: 30, color: C.yellow }, 't c80')}${['09:00', '10:30', '12:00', '14:30', '16:00', '17:30'].map((h, k) => box({ left: 22 + (k % 2) * 132, top: 110 + Math.floor(k / 2) * 80, width: 118, height: 64, border: `4px solid ${C.ink}`, background: k === 3 ? C.blue : '#fff', color: k === 3 ? '#fff' : C.ink, font: '900 22px Archivo', display: 'grid', placeItems: 'center' }, h)).join('')}${box({ left: 22, top: 400, width: 250, height: 60, background: C.yellow, border: `4px solid ${C.ink}`, font: '900 20px Archivo', display: 'grid', placeItems: 'center' }, 'MARCAR')}` })).join('')}`;
S['oficina-bicla-3'] = () => `${bg(C.paper)}<div class="dots"></div>${box({ left: 160, top: 120 }, wheel(620))}${box({ left: 700, top: 160, width: 380, padding: 30, background: C.yellow, border: `6px solid ${C.ink}`, transform: rot(3) }, `<div class="t c62" style="font-size:80px">Leve<br>na rua</div><div style="font:700 22px Archivo;margin-top:10px">fotografias que só carregam quando aparecem no ecrã</div>`, 'hard')}`;

// Atlas Miúdo
const board = (x, y, w, h, r, color) =>
  box({ left: x, top: y, width: w, height: h, background: color, border: `6px solid ${C.ink}`, borderRadius: 40, transform: rot(r), overflow: 'hidden' }, `<svg class="abs" style="inset:0" width="${w}" height="${h}" viewBox="0 0 600 600" preserveAspectRatio="none"><path d="M60 520 C 160 380, 60 300, 220 260 S 420 300, 380 160 S 520 80, 540 60" fill="none" stroke="${C.ink}" stroke-width="44" stroke-linecap="round"/><path d="M60 520 C 160 380, 60 300, 220 260 S 420 300, 380 160 S 520 80, 540 60" fill="none" stroke="${C.paper}" stroke-width="30" stroke-linecap="round" stroke-dasharray="26 18"/><circle cx="120" cy="150" r="50" fill="${C.green}" stroke="${C.ink}" stroke-width="6"/><circle cx="470" cy="420" r="70" fill="${C.blue}" stroke="${C.ink}" stroke-width="6"/><path d="M300 470l40-70 40 70z" fill="${C.red}" stroke="${C.ink}" stroke-width="6"/></svg>`);
S['atlas-miudo-1'] = () => `${bg(C.green)}<div class="dots" style="opacity:.4"></div>${board(520, 110, 600, 680, -3, C.yellow)}${text('Atlas<br>miúdo', { left: 70, top: 140, fontSize: 170, color: '#fff' }, 't c62')}${text('dos 5 aos 8 anos', { left: 76, top: 470, fontSize: 30, color: '#fff' }, 't c100')}`;
S['atlas-miudo-2'] = () => `${bg(C.bg)}<div class="dots"></div>${board(70, 120, 520, 660, -2, C.pink)}${board(610, 120, 520, 660, 2, C.sky)}`;
S['atlas-miudo-3'] = () => `${bg(C.red)}${[0, 1, 2].map((i) => box({ left: 300 - i * 20, top: 560 - i * 150, width: 600, height: 140, background: [C.yellow, C.sky, C.pink][i], border: `6px solid ${C.ink}`, borderRadius: 34, transform: rot([2, -3, 4][i]), display: 'flex', alignItems: 'center', padding: '0 34px' }, `<span class="t c62" style="font-size:60px">Atlas miúdo · ${['Rios', 'Serras', 'Ilhas'][i]}</span>`, 'hard')).join('')}`;

// Terra Alta
const oilLabel = (alt, c) =>
  `<div class="label" style="${st({ left: 22, top: 250, width: 116, height: 200, background: C.cream, color: C.ink, overflow: 'hidden', justifyContent: 'flex-start', paddingTop: 16 })}"><b style="font:900 34px Archivo;font-stretch:62%">${alt} m</b><span style="font:800 10px Archivo;letter-spacing:.1em">TERRA ALTA</span><svg class="abs" style="left:0;bottom:0" width="116" height="90" viewBox="0 0 116 90"><path d="M0 ${90 - alt / 12} L30 ${70 - alt / 14} L55 ${80 - alt / 10} L80 ${60 - alt / 16} L116 ${75 - alt / 12} V90 H0Z" fill="${c}" stroke="${C.ink}" stroke-width="4"/></svg></div>`;
S['terra-alta-1'] = () => `${bg(C.cream)}${hills('#c8c39a', [300, 220, 260, 160, 230, 190, 280], 520)}${[[320, C.olive], [540, C.green], [700, C.ink]].map(([a, c], i) => bottle({ x: 280 + i * 240, y: 200, glass: '#4b5320', label: oilLabel(a, c) })).join('')}`;
S['terra-alta-2'] = () => `${bg(C.olive)}${box({ left: 160, top: 110, width: 880, height: 680, background: C.cream, border: `6px solid ${C.ink}`, overflow: 'hidden' }, `${hills(C.green, [330, 260, 300, 120, 220, 170, 290], 300)}<div class="t c62" style="position:absolute;left:50px;top:50px;font-size:220px">700 m</div><div style="position:absolute;left:56px;top:250px;font:800 22px Archivo;letter-spacing:.18em">LOTE 4 · OLIVAL DA SERRA · MIRANDELA</div>`, 'hard')}`;
S['terra-alta-3'] = () => `${bg(C.yellow)}${box({ left: 330, top: 120, width: 540, height: 660, background: C.ink, border: `6px solid ${C.ink}`, borderRadius: '30px 30px 16px 16px', overflow: 'hidden' }, `${box({ left: 210, top: -20, width: 120, height: 70, background: '#888', border: `6px solid ${C.ink}`, borderRadius: 10 })}${hills(C.olive, [200, 140, 170, 60, 130, 90, 160], 360, C.cream)}<div class="t c62" style="position:absolute;left:40px;top:90px;font-size:160px;color:${C.cream}">540 m</div><div style="position:absolute;left:44px;top:280px;font:800 20px Archivo;letter-spacing:.18em;color:${C.cream}">AZEITE · 3 LITROS</div>`, 'hard')}`;

// Rádio Quintal
S['radio-quintal-1'] = () => `${bg(C.ink)}${box({ left: 380, top: 120 }, antenna(-8, C.bg, 460))}${text('Rádio<br>Quintal', { left: 70, top: 560, fontSize: 150, color: C.yellow }, 't c62')}<div class="tc" style="right:40px;top:40px;background:${C.red}">● EM DIRETO</div>`;
S['radio-quintal-2'] = () => `${bg(C.bg)}<div class="dots"></div>${Array.from({ length: 12 }, (_, i) => `<div class="frame" style="${st({ left: 50 + (i % 4) * 280, top: 60 + Math.floor(i / 4) * 270, width: 260, height: 240, background: [C.yellow, C.pink, C.sky, C.green, C.red, C.blue][i % 6], display: 'grid', placeItems: 'center' })}">${antenna((i % 5) * 4 - 8, C.ink, 160)}<div class="tc" style="left:8px;bottom:8px;font-size:12px">${['Manhãs', 'Bola', 'Discos', 'Bairro', 'Receitas', 'Noite'][i % 6]}</div></div>`).join('')}`;
S['radio-quintal-3'] = () => `${bg(C.yellow)}${[-14, -7, 0, 7, 14].map((s, i) => box({ left: 300, top: 150, opacity: 0.25 + i * 0.18 }, antenna(s, C.ink, 600))).join('')}${text('12 quadros por segundo', { left: 60, top: 60, fontSize: 40 }, 't c80')}`;

// Bigode
S['bigode-1'] = () => `${bg(C.green)}<div class="dots" style="opacity:.35"></div>${browser({ x: 70, y: 90, w: 1060, h: 690, r: 1.5, url: 'bigode.exemplo/marcar', page: vetPage() })}`;
S['bigode-2'] = () => `${bg(C.pink)}${[0, 1, 2].map((i) => phone({ x: 90 + i * 360, y: 110, w: 300, h: 620, r: 0, scr: `${box({ left: 0, right: 0, top: 0, height: 60, background: '#fff', borderBottom: `3px solid ${C.ink}` }, `${box({ left: 14, top: 6 }, whiskers(46))}`)}<div class="t c62" style="position:absolute;left:20px;top:84px;font-size:66px">${i + 1}.</div><div class="t c70" style="position:absolute;left:20px;top:150px;font-size:40px">${['Quem?', 'Quando?', 'Feito!'][i]}</div>${[0, 1, 2].map((k) => box({ left: 20, right: 20, top: 240 + k * 84, height: 66, border: `4px solid ${C.ink}`, background: k === [0, 1, 2][i] ? [C.yellow, C.blue, C.green][i] : '#fff', color: k === i && i ? '#fff' : C.ink, font: '800 20px Archivo', display: 'flex', alignItems: 'center', paddingLeft: 14 }, [['Gato · Tareco', 'Cão · Bolinha', 'Outro'], ['Ter 10:00', 'Ter 11:30', 'Qua 9:00'], ['Consulta marcada', 'Lembrete por email', 'Ficha do Tareco']][i][k])).join('')}` })).join('')}`;
S['bigode-3'] = () => `${bg(C.bg)}<div class="dots"></div>${box({ left: 220, top: 110, width: 760, height: 680, background: '#fff', border: `6px solid ${C.ink}`, padding: 50, transform: rot(-2) }, `<div style="display:flex;align-items:center;gap:16px">${whiskers(80)}<span class="t c80" style="font-size:44px">Bigode</span></div><div class="t c62" style="font-size:92px;margin-top:40px">A vacina<br>do Tareco<br>é dia 9</div><div class="ui-line" style="width:90%;margin-top:40px"></div><div class="ui-line" style="width:70%"></div><span class="ui-btn" style="background:${C.yellow};margin-top:30px;height:60px;font-size:20px">Marcar em 3 toques</span>`, 'hard')}`;

// ---------- Provas (área de cliente) ----------
S['teatro-inicio-1'] = () => `${bg(C.bg)}${browser({ x: 60, y: 60, w: 1080, h: 780, url: 'teatrodolargo.exemplo', page: theatrePage(1) })}`;
S['teatro-inicio-2'] = () => `${bg(C.bg)}${browser({ x: 60, y: 60, w: 1080, h: 780, url: 'teatrodolargo.exemplo', page: theatrePage(2) })}`;
S['teatro-bilheteira-1'] = () => `${bg(C.bg)}${browser({ x: 60, y: 60, w: 1080, h: 780, url: 'teatrodolargo.exemplo/bilhetes', page: `${box({ inset: 0, background: C.paper })}${text('Sopa de Pedra · Sáb 16h', { left: 40, top: 30, fontSize: 54 }, 't c62')}${box({ left: 300, top: 110, width: 420, height: 30, background: C.ink, color: C.bg, font: '800 14px Archivo', display: 'grid', placeItems: 'center', letterSpacing: '.2em' }, 'PALCO')}${Array.from({ length: 8 }, (_, r) => Array.from({ length: 12 }, (_, c) => box({ left: 200 + c * 52 + (c > 5 ? 20 : 0), top: 170 + r * 52, width: 42, height: 42, border: `3px solid ${C.ink}`, borderRadius: '10px 10px 4px 4px', background: (r * 7 + c * 3) % 5 === 0 ? '#14121055' : r === 3 && (c === 6 || c === 7) ? C.red : '#fff' })).join('')).join('')}${box({ left: 40, bottom: 40, height: 56, padding: '0 26px', background: C.yellow, border: `4px solid ${C.ink}`, display: 'flex', alignItems: 'center', fontWeight: 900, fontSize: 18 }, '2 LUGARES · 16,00 € · CONTINUAR')}` })}`;
S['teatro-escolas-1'] = () => `${bg(C.bg)}${browser({ x: 60, y: 60, w: 1080, h: 780, url: 'teatrodolargo.exemplo/escolas', page: `${box({ inset: 0, background: C.green })}${text('Escolas', { left: 40, top: 40, fontSize: 160, color: '#fff' }, 't c62')}${box({ left: 40, top: 240, width: 480, padding: 24, background: C.paper, border: `4px solid ${C.ink}`, font: '700 20px/1.5 Archivo' }, 'Visitas de turma às quartas de manhã. Escolham a peça, o número de alunos e a data.<div class="ui-line" style="width:90%;margin-top:24px"></div><div class="ui-line" style="width:70%"></div>')}${box({ left: 580, top: 240, width: 430, height: 380, background: C.yellow, border: `4px solid ${C.ink}`, padding: 24 }, `<b style="font:900 26px Archivo;font-stretch:70%">MARCAR VISITA</b>${['Escola', 'Turma', 'N.º de alunos', 'Data'].map((l) => `<div style="margin-top:14px;font:700 14px Archivo">${l}</div><div style="height:38px;border:3px solid ${C.ink};background:#fff"></div>`).join('')}`)}` })}`;
S['teatro-programacao-1'] = () => `${bg(C.bg)}${browser({ x: 60, y: 60, w: 1080, h: 780, url: 'teatrodolargo.exemplo/programacao', page: `${box({ inset: 0, background: C.paper })}${text('Programação', { left: 40, top: 30, fontSize: 110 }, 't c62')}${['A Casa ao Lado', 'Sopa de Pedra', 'Nove Janelas', 'O Último Elétrico'].map((t, i) => box({ left: 40, right: 40, top: 160 + i * 130, height: 112, border: `4px solid ${C.ink}`, background: [C.yellow, C.pink, C.sky, '#fff'][i], display: 'flex', alignItems: 'center', gap: 30, padding: '0 26px' }, `<span class="t c62" style="font-size:64px">${['DEZ 04', 'DEZ 12', 'JAN 09', 'JAN 23'][i]}</span><span class="t c80" style="font-size:40px">${t}</span><span class="ui-btn" style="margin-left:auto;background:#fff">Bilhetes</span>`)).join('')}` })}`;
const sketchCan = (x, y, r, label, draw) => `<div class="sketch" style="${st({ left: x, top: y, width: 330, height: 230, transform: rot(r) })}"><svg class="abs" style="inset:20px" width="290" height="190" viewBox="0 0 290 190" fill="none" stroke="#4a443c" stroke-width="3" stroke-linecap="round">${draw}</svg><span class="pencil abs" style="left:10px;bottom:-44px;font-size:24px">${label}</span></div>`;
S['lota-esbocos-1'] = () => `${bg('#f7f2e6')}<div class="grain"></div>${text('Natal · 3 latas · esboços', { left: 60, top: 50, fontSize: 44, color: '#4a443c' }, 't c80')}
  ${sketchCan(60, 220, -4, 'A · polvo com gorro', '<path d="M90 120c0-40 30-60 55-60s55 20 55 60"/><path d="M95 120c-10 30-30 40-40 35M120 125c0 30-10 45-20 45M145 125v45M170 125c0 30 10 45 20 45M195 120c10 30 30 40 40 35"/><path d="M110 62l35-50 35 50z"/><circle cx="145" cy="10" r="8"/>')}
  ${sketchCan(430, 200, 3, 'B · sardinha a cantar', '<path d="M30 100c40-40 160-40 200 0-40 40-160 40-200 0z"/><path d="M230 100l40-30v60z"/><circle cx="70" cy="92" r="6"/><path d="M50 108c8 6 18 6 24 0"/><path d="M110 40c6-10 14-14 22-10M140 30c6-10 14-14 22-10"/>')}
  ${sketchCan(800, 230, -2, 'C · bacalhau de gorro', '<path d="M30 110c30-30 150-40 200-10-50 30-170 40-200 10z"/><path d="M230 100l40-25v50z"/><path d="M40 80l30-50 30 45"/><circle cx="70" cy="28" r="8"/>')}
  ${box({ left: 380, top: 620, width: 440, padding: 18, background: C.yellow, transform: rot(-2), font: '700 22px Archivo', border: `4px solid ${C.ink}` }, 'Cinta de papel a juntar as três latas')}`;
S['lota-polvo-1'] = () => `${bg(C.navy)}${can({ x: 160, y: 160, w: 880, h: 560, r: -2, color: C.red, ink: '#fff', num: 'Natal', fish: 'Polvo', sub: 'edição limitada · 2026', numSize: 300 })}`;
S['sotao-simbolo-1'] = () => `${bg('#f7f2e6')}<div class="grain"></div>${text('Sótão · caminhos para o símbolo', { left: 60, top: 50, fontSize: 44, color: '#4a443c' }, 't c80')}${[0, 1, 2, 3, 4, 5].map((i) => box({ left: 60 + (i % 3) * 370, top: 150 + Math.floor(i / 3) * 360, width: 330, height: 320, background: C.paper, border: `4px solid ${C.ink}`, display: 'grid', placeItems: 'center' }, `<svg width="180" height="180" viewBox="0 0 100 100" fill="none" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round">${['<path d="M10 60L50 20l40 40"/><rect x="34" y="50" width="32" height="40"/>', '<path d="M10 90V50L50 15l40 35v40z"/><path d="M30 70h40M30 80h40"/>', '<path d="M15 55L50 20l35 35"/><path d="M30 70h40v20H30z" fill="#f6c21c"/>', '<path d="M50 10v80M20 30l30-20 30 20"/><circle cx="50" cy="60" r="20"/>', '<path d="M10 50L50 10l40 40H10z" fill="#f3a6c8"/><path d="M25 50v40h50V50"/>', '<rect x="15" y="15" width="70" height="70"/><path d="M15 50L50 15l35 35"/>'][i]}</svg><span class="pencil abs" style="left:14px;bottom:10px;font-size:20px">${'ABCDEF'[i]}</span>`)).join('')}`;

// ---------- Imagem de partilha e ícone ----------
S.og = () => `${bg(C.bg)}<div class="dots"></div>
  ${text('Atira-nos<br>um <span style="color:#d9361f">problema.</span>', { left: 60, top: 56, fontSize: 132 }, 't c62')}
  ${box({ left: 60, top: 440, width: 280, height: 126, background: C.red, color: '#fff', border: `5px solid ${C.ink}`, borderRadius: 999, display: 'grid', placeItems: 'center', boxShadow: `8px 8px 0 ${C.ink}`, transform: rot(-4) }, '<span class="t c62" style="font-size:66px">Marcas</span>')}
  ${box({ left: 370, top: 392, width: 180, height: 180, background: C.blue, color: '#fff', border: `5px solid ${C.ink}`, display: 'grid', placeItems: 'center', boxShadow: `8px 8px 0 ${C.ink}`, transform: rot(5) }, '<span class="t c70" style="font-size:48px">Sites</span>')}
  ${box({ left: 590, top: 300, width: 220, height: 110, background: C.yellow, border: `5px solid ${C.ink}`, borderRadius: '110px 110px 0 0', display: 'grid', placeItems: 'end center', paddingBottom: 12, boxShadow: `8px 8px 0 ${C.ink}`, transform: rot(-3) }, '<span class="t c62" style="font-size:44px">Rótulos</span>')}
  ${box({ left: 610, top: 428, width: 150, height: 150, background: C.ink, color: C.yellow, border: `5px solid ${C.ink}`, borderRadius: '50%', display: 'grid', placeItems: 'center', boxShadow: `8px 8px 0 ${C.red}` }, '<span class="t c100" style="font-size:26px;text-align:center">Movi-<br>mento</span>')}
  ${box({ left: 820, top: 390, width: 140, height: 186, background: C.pink, border: `5px solid ${C.ink}`, borderRadius: '0 0 70px 70px', display: 'grid', placeItems: 'center', boxShadow: `8px 8px 0 ${C.ink}`, transform: rot(6) }, '<span class="t c80" style="font-size:36px">Livros</span>')}
  ${box({ left: 990, top: 484, width: 90, height: 90, background: '#fff', border: `5px solid ${C.ink}`, borderRadius: 14, display: 'grid', placeItems: 'center', boxShadow: `6px 6px 0 ${C.ink}`, transform: rot(-8) }, '<span class="t c100" style="font-size:48px">?</span>')}
  ${box({ left: 0, right: 0, top: 584, height: 8, background: C.ink })}
  ${text('pilha<sup style="font-size:20px">®</sup>', { right: 64, top: 64, fontSize: 60, textTransform: 'none' }, 't c125')}`;
S.icon = () => `${bg(C.yellow)}${box({ left: 210, top: 250, width: 780, height: 400, background: C.red, border: `36px solid ${C.ink}`, borderRadius: 999, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 360, paddingBottom: 70, textTransform: 'none' }, 'p', 't c100')}`;

const name = new URLSearchParams(location.search).get('c') ?? location.hash.slice(1);
document.getElementById('cena').innerHTML = (S[name] ?? (() => `<p style="font:900 60px Archivo;padding:60px">Cena "${name}" não existe</p>`))();
document.fonts.ready.then(() => (document.body.dataset.ready = '1'));
window.SCENES = Object.keys(S);

// Quadro de chaves da receção em 3D: chaves de latão com porta-chaves gravado, a balançar nos ganchos.
import * as THREE from '../../vendor/three.min.js';

// ---------- texturas desenhadas em canvas ----------
function ruido1d(n, seed = 1) {
  let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const v = Array.from({ length: n }, r);
  return (x) => { const i = Math.floor(x), f = x - i, a = v[((i % n) + n) % n], b = v[(((i + 1) % n) + n) % n]; const t = f * f * (3 - 2 * f); return a + (b - a) * t; };
}
function madeira(w = 512, h = 512, escura = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); const img = g.createImageData(w, h);
  const n1 = ruido1d(512, 7), n2 = ruido1d(512, 13), n3 = ruido1d(512, 29);
  const A = escura ? [24, 13, 8] : [40, 22, 12], B = escura ? [58, 33, 19] : [96, 58, 32];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const t = y * 0.022 + 0.9 * Math.sin(x * 0.0021 + n1(y * 0.008) * 2) + 0.7 * n2(x * 0.003 + y * 0.004);
    const anel = Math.pow(0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 0.55), 3);
    const fibra = n3(y * 1.3 + 3 * Math.sin(x * 0.0015)) * 0.6 + n1(y * 4.1 + x * 0.002) * 0.3;
    const k = Math.min(1, 0.1 + anel * 0.35 + fibra * 0.5 + (Math.random() - 0.5) * 0.06);
    const i = (y * w + x) * 4;
    for (let j = 0; j < 3; j++) img.data[i + j] = A[j] + (B[j] - A[j]) * k;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function desgaste(w = 512) { // manchas para a rugosidade do latão envelhecido
  const c = document.createElement('canvas'); c.width = c.height = w; const g = c.getContext('2d');
  g.fillStyle = '#6a6a6a'; g.fillRect(0, 0, w, w);
  for (let i = 0; i < 260; i++) { const r = 6 + Math.random() * 40; g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '20,20,20'},${0.05 + Math.random() * 0.09})`; g.beginPath(); g.arc(Math.random() * w, Math.random() * w, r, 0, 7); g.fill(); }
  for (let i = 0; i < 500; i++) { g.strokeStyle = `rgba(255,255,255,${Math.random() * 0.12})`; g.lineWidth = 0.6; g.beginPath(); const x = Math.random() * w, y = Math.random() * w, a = Math.random() * 6; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// gravação: devolve { cor, relevo, rug } com as mesmas coordenadas que a forma (UV = x,y da forma)
function gravacao(caixa, desenhar) {
  const esc = 120, w = Math.ceil((caixa.max.x - caixa.min.x) * esc), h = Math.ceil((caixa.max.y - caixa.min.y) * esc);
  const mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const cor = mk(), rel = mk(), rug = mk();
  for (const [c, fundo, tinta] of [[cor, '#ffffff', '#3a2c16'], [rel, '#ffffff', '#000000'], [rug, '#555555', '#e0e0e0']]) {
    const g = c.getContext('2d'); g.fillStyle = fundo; g.fillRect(0, 0, w, h);
    g.save(); g.translate(-caixa.min.x * esc, caixa.max.y * esc); g.scale(esc, -esc);
    g.fillStyle = tinta; g.strokeStyle = tinta; desenhar(g); g.restore();
    if (c === rel) { g.filter = 'blur(2px)'; g.drawImage(c, 0, 0); }
  }
  const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1 / (caixa.max.x - caixa.min.x), 1 / (caixa.max.y - caixa.min.y)); t.offset.set(-caixa.min.x * t.repeat.x, -caixa.min.y * t.repeat.y); t.anisotropy = 8; return t; };
  return { cor: tex(cor, true), relevo: tex(rel), rug: tex(rug) };
}
const texto = (g, s, x, y, tam, peso = '700', letras = 0) => { // texto em coordenadas da forma (y para cima)
  g.save(); g.translate(x, y); g.scale(1, -1); g.font = `${peso} ${tam}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (letras) { g.letterSpacing = `${letras}px`; } g.fillText(s, 0, 0); g.restore();
};

function estudio() {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: '#17120d', side: THREE.BackSide })));
  const luz = (w, h, pos, cor, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(cor).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m); };
  luz(7, 1.4, [0, 4.8, 1.5], '#fff1dc', 5); luz(1.4, 5, [-4.8, 0.6, 2.5], '#ffe2bd', 3);
  luz(10, 10, [0, 0, 4.97], '#c89a62', 1.1); luz(3.4, 4.2, [-1.6, 0.6, 4.9], '#ffe6c2', 2.6); luz(2.6, 4.2, [2.6, 0.2, 4.9], '#fff0d8', 2.2); luz(10, 10, [0, -4.95, 0], '#9a7448', 0.9); luz(10, 4, [0, -2.8, 4.9], '#d9aa70', 1.2);
  luz(9, 0.8, [0, -2.2, -4.8], '#ffc68a', 1.4); luz(0.8, 3, [4.8, -1, -1], '#bcd3ff', 1.2);
  return s;
}
// ---------- geometrias ----------
function casco(pts) { // invólucro convexo (monotone chain)
  pts = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], hi = [];
  for (const p of pts) { while (lo.length >= 2 && cr(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p); }
  for (const p of pts.slice().reverse()) { while (hi.length >= 2 && cr(hi.at(-2), hi.at(-1), p) <= 0) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
const circulo = (cx, cy, r, n = 64) => Array.from({ length: n }, (_, i) => new THREE.Vector2(cx + Math.cos((i / n) * Math.PI * 2) * r, cy + Math.sin((i / n) * Math.PI * 2) * r));

function geoPortaChaves() { // pera de latão: furo em cima, disco grande em baixo
  const forma = new THREE.Shape(casco([...circulo(0, 0, 0.85), ...circulo(0, -5.9, 2.15)]));
  forma.holes.push(new THREE.Path(circulo(0, 0, 0.38, 32).reverse()));
  const g = new THREE.ExtrudeGeometry(forma, { depth: 0.28, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 4, curveSegments: 48 });
  g.translate(0, 0, -0.14); g.computeBoundingBox(); return g;
}
function geoChave() { // chave de palhetão: argola trilobada, haste redonda e palhetão com dentes
  const grupo = [];
  const arg = new THREE.Shape(Array.from({ length: 120 }, (_, i) => { const a = (i / 120) * Math.PI * 2, r = 1.05 + 0.2 * Math.cos(3 * a + Math.PI / 2); return new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r - 0.95); }));
  arg.holes.push(new THREE.Path(circulo(0, -0.95, 0.5, 40).reverse()));
  const ga = new THREE.ExtrudeGeometry(arg, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 3 }); ga.translate(0, 0.55, -0.08);
  grupo.push(ga);
  const haste = new THREE.CylinderGeometry(0.19, 0.19, 5.6, 24); haste.translate(0, -4.3, 0); grupo.push(haste);
  for (const y of [-1.75, -2.05]) { const t = new THREE.TorusGeometry(0.24, 0.07, 10, 28); t.rotateX(Math.PI / 2); t.translate(0, y, 0); grupo.push(t); }
  const pont = new THREE.SphereGeometry(0.2, 16, 10); pont.translate(0, -7.1, 0); grupo.push(pont);
  const pal = new THREE.Shape([[0.12, -5.5], [1.35, -5.5], [1.35, -5.95], [0.95, -5.95], [0.95, -6.2], [1.35, -6.2], [1.35, -6.95], [0.78, -6.95], [0.78, -6.62], [0.55, -6.62], [0.55, -6.95], [0.12, -6.95]].map(([x, y]) => new THREE.Vector2(x, y)));
  const gp = new THREE.ExtrudeGeometry(pal, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }); gp.translate(0, 0, -0.08); grupo.push(gp);
  return grupo;
}
function placaGeo(w, h, r) {
  const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3 }); g.computeBoundingBox(); return g;
}

export function quadroDeChaves(canvas, { quartos, livres: livresIniciais, escolhido, aoEscolher = () => {}, perto = false }) {
  let livres = livresIniciais;
  const acaso = (num, k) => { const x = Math.sin(Number(num) * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const cena = new THREE.Scene(); cena.background = new THREE.Color('#14241f');
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(estudio(), 0.02).texture; cena.environmentIntensity = 1;
  const camara = new THREE.PerspectiveCamera(26, 1, 1, 600);

  const latao = new THREE.MeshPhysicalMaterial({ color: '#d2a965', metalness: 1, roughness: 0.3, roughnessMap: desgaste() });
  const lataoEsc = new THREE.MeshPhysicalMaterial({ color: '#b9935a', metalness: 1, roughness: 0.34, roughnessMap: desgaste() });
  const ferro = new THREE.MeshStandardMaterial({ color: '#8a6a30', metalness: 1, roughness: 0.42 });
  const texMad = madeira(), texMadEsc = madeira(512, 256, true);

  // disposição: colunas consoante a proporção do canvas
  let colunas = 7, linhas = 2;
  const SX = 9.2, SY = 16.5;
  const raiz = new THREE.Group(); cena.add(raiz);
  const parede = new THREE.Mesh(new THREE.PlaneGeometry(400, 300), new THREE.MeshStandardMaterial({ color: '#1d332c', roughness: 0.95, envMapIntensity: 0.2 }));
  parede.position.z = -2.2; parede.receiveShadow = true; cena.add(parede);

  const geoFob = geoPortaChaves(), partesChave = geoChave();
  const geoAnel = new THREE.TorusGeometry(0.62, 0.075, 12, 40), geoElo = new THREE.TorusGeometry(0.34, 0.06, 10, 28); geoElo.rotateY(Math.PI / 2);
  const geoPlaca = placaGeo(3.6, 1.6, 0.35);
  const ganchoGeo = (() => { const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1.2), new THREE.Vector3(0, 0.05, 1.9), new THREE.Vector3(0, 0.55, 2.25), new THREE.Vector3(0, 0.95, 2.15)]); return new THREE.TubeGeometry(curva, 40, 0.11, 12); })();
  const rosetaGeo = new THREE.CylinderGeometry(0.42, 0.5, 0.18, 32); rosetaGeo.rotateX(Math.PI / 2);

  const chaves = []; // { grupo, quarto, base, ang, vel, alvo }
  const fobsMat = new Map();
  function matFob(num) {
    if (fobsMat.has(num)) return fobsMat.get(num);
    const t = gravacao(geoFob.boundingBox, (g) => {
      texto(g, num, 0, -5.95, 2.1, '700'); g.lineWidth = 0.08; g.beginPath(); g.arc(0, -5.9, 1.7, 0, Math.PI * 2); g.stroke();
      texto(g, 'ARRIBA', 0, -2.75, 0.62, '700'); texto(g, 'SAGRES', 0, -7.25, 0.36, '400');
      g.beginPath(); g.arc(0, 0, 0.62, 0, Math.PI * 2); g.lineWidth = 0.05; g.stroke();
    });
    const m = new THREE.MeshPhysicalMaterial({ color: '#d8ae68', metalness: 1, roughness: 0.3, map: t.cor, bumpMap: t.relevo, bumpScale: 0.9, roughnessMap: t.rug });
    fobsMat.set(num, m); return m;
  }
  function matPlaca(num) {
    const t = gravacao(geoPlaca.boundingBox, (g) => { texto(g, num, 0, 0.02, 1.25, '700'); g.lineWidth = 0.05; g.strokeRect(-1.55, -0.6, 3.1, 1.2); });
    return new THREE.MeshPhysicalMaterial({ color: '#c9a062', metalness: 1, roughness: 0.3, map: t.cor, bumpMap: t.relevo, bumpScale: 0.8, roughnessMap: t.rug });
  }
  const sombra = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };

  let tabua;
  function montar() {
    raiz.clear(); chaves.length = 0;
    const W = colunas * SX + 5, H = linhas * SY + 5.5;
    // tábua com moldura
    const tm = texMad.clone(); tm.needsUpdate = true; tm.repeat.set(W / 70, H / 70);
    tabua = sombra(new THREE.Mesh(new THREE.BoxGeometry(W, H, 1.4), new THREE.MeshStandardMaterial({ map: tm, roughness: 0.55, bumpMap: tm, bumpScale: 0.8, envMapIntensity: 0.25 })));
    tabua.position.z = -0.7; raiz.add(tabua);
    const molduraMat = new THREE.MeshStandardMaterial({ map: texMadEsc, roughness: 0.4, envMapIntensity: 0.35 });
    for (const [w, h, x, y] of [[W + 2.4, 1.2, 0, H / 2 + 0.6], [W + 2.4, 1.2, 0, -H / 2 - 0.6], [1.2, H, -W / 2 - 0.6, 0], [1.2, H, W / 2 + 0.6, 0]]) {
      const m = sombra(new THREE.Mesh(new THREE.BoxGeometry(w, h, 2.1, 1, 1, 1), molduraMat)); m.position.set(x, y, -0.35); raiz.add(m);
    }
    // filete de latão por cima de cada linha
    for (let r = 0; r < linhas; r++) {
      const y = H / 2 - 2.6 - r * SY;
      const f = sombra(new THREE.Mesh(new THREE.BoxGeometry(W - 1.2, 0.14, 0.14), lataoEsc)); f.position.set(0, y + 1.9, 0.07); raiz.add(f);
    }
    quartos.forEach((q, i) => {
      const r = Math.floor(i / colunas), cNaLinha = Math.min(colunas, quartos.length - r * colunas), c = i % colunas;
      const x = (c - (cNaLinha - 1) / 2) * SX, y = H / 2 - 2.6 - r * SY;
      const placa = sombra(new THREE.Mesh(geoPlaca, matPlaca(q.num))); placa.position.set(x, y, 0); raiz.add(placa);
      for (const dx of [-1.45, 1.45]) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), latao); p.position.set(x + dx, y, 0.2); raiz.add(p); }
      const yg = y - 2.6;
      const ros = sombra(new THREE.Mesh(rosetaGeo, latao)); ros.position.set(x, yg, 0.09); raiz.add(ros);
      const gancho = sombra(new THREE.Mesh(ganchoGeo, latao)); gancho.position.set(x, yg, 0); raiz.add(gancho);
      if (!livres.includes(q.num)) return; // quarto ocupado: gancho vazio
      const grupo = new THREE.Group(); grupo.position.set(x, yg + 0.05, 1.75);
      const anel = sombra(new THREE.Mesh(geoAnel, latao)); anel.position.y = -0.58; grupo.add(anel);
      const elo = sombra(new THREE.Mesh(geoElo, latao)); elo.position.y = -1.42; grupo.add(elo);
      const fob = sombra(new THREE.Mesh(geoFob, matFob(q.num))); fob.position.set(0, -1.58, 0.32); grupo.add(fob);
      const chave = new THREE.Group(); for (const g of partesChave) chave.add(sombra(new THREE.Mesh(g, lataoEsc)));
      chave.scale.setScalar(1.3); chave.position.set(0.15, -1.2, -0.25); chave.rotation.z = 0.42; chave.rotation.y = 0.2; grupo.add(chave);
      grupo.userData.giro = (acaso(q.num, 1) - 0.5) * 0.3;
      grupo.traverse((o) => (o.userData.quarto = q));
      raiz.add(grupo);
      chaves.push({ grupo, quarto: q, base: grupo.position.clone(), ang: (acaso(q.num, 2) - 0.5) * 0.05, vel: 0, t: 0 });
    });
    return { W, H };
  }

  // luz quente de cima, como um candeeiro de receção
  const foco = new THREE.SpotLight('#ffd9a8', 5.5, 0, 0.5, 1, 0);
  foco.castShadow = true; foco.shadow.mapSize.set(2048, 2048); foco.shadow.bias = -0.0004; foco.shadow.normalBias = 0.02; foco.shadow.radius = 6;
  cena.add(foco, foco.target);
  cena.add(new THREE.HemisphereLight('#fff1dc', '#1b2a24', 0.2));
  const preenchimento = new THREE.DirectionalLight('#cfe0ff', 0.25); preenchimento.position.set(-40, -10, 60); cena.add(preenchimento);

  let dims, selecionada = null;
  function ajustar() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    const asp = w / h;
    const [c, l] = asp > 1.45 ? [7, 2] : asp > 0.75 ? [5, 3] : [4, 4];
    if (c !== colunas || l !== linhas || !dims) { colunas = c; linhas = l; dims = montar(); if (selecionada) escolher(selecionada.quarto.num, true, false); }
    renderer.setSize(w, h, false); camara.aspect = asp;
    const t = Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
    const d = Math.max((dims.H / 2 + 3) / t, (dims.W / 2 + 3) / (t * asp)) * 1.02;
    camara.position.set(dims.W * 0.05, 2.5, d); camara.lookAt(0, -0.5, 0); camara.updateProjectionMatrix();
    foco.position.set(-dims.W * 0.25, dims.H * 0.9, d * 0.75); foco.target.position.set(0, -dims.H * 0.1, 0);
    foco.angle = Math.atan((Math.max(dims.W, dims.H) * 0.62) / d);
    // Retrato de uma chave só (a imagem das páginas de entrar)
    const k = perto && chaves.find((c) => c.quarto.num === escolhido);
    if (k) {
      const lx = k.base.x + (k.base.x > 0 ? -2.5 : 2.5), ly = k.base.y + 0.5, lz = k.base.z + 20;
      camara.position.set(lx + 2, ly - 4.5, lz + 30); camara.lookAt(lx + 0.6, ly - 5.6, lz);
    }
  }

  function escolher(num, imediato = false, avisar = true) {
    const k = chaves.find((c) => c.quarto.num === num); if (!k) return;
    selecionada = k; for (const c of chaves) c.t = c === k ? 1 : 0;
    if (imediato || reduzir) for (const c of chaves) c.p = c.t;
    if (avisar) aoEscolher(k.quarto);
  }

  // Datas novas: as chaves ocupadas saem do quadro e as livres voltam aos ganchos
  function atualizar(novos, num) {
    livres = novos; selecionada = null; dims = montar(); ajustar();
    if (num) escolher(num, true, false);
  }

  const rc = new THREE.Raycaster(), rato = new THREE.Vector2();
  function apontar(e) {
    const r = canvas.getBoundingClientRect(); rato.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    rc.setFromCamera(rato, camara); const hit = rc.intersectObjects(chaves.map((c) => c.grupo), true)[0];
    return hit && chaves.find((c) => c.quarto === hit.object.userData.quarto);
  }
  let sobre = null;
  canvas.addEventListener('pointermove', (e) => { const k = apontar(e); canvas.style.cursor = k ? 'pointer' : ''; if (k && k !== sobre && !reduzir) k.vel += (e.movementX || 1) * 0.004; sobre = k; });
  canvas.addEventListener('click', (e) => { const k = apontar(e); if (k) escolher(k.quarto.num); });

  new ResizeObserver(ajustar).observe(canvas); ajustar();
  if (escolhido) escolher(escolhido, true, false);

  // Só desenha quando o quadro está à vista
  let visivel = true;
  new IntersectionObserver(([e]) => (visivel = e.isIntersecting)).observe(canvas);
  let antes = performance.now(), frames = 0, pronto;
  const promessa = new Promise((r) => (pronto = r));
  const v = new THREE.Vector3();
  renderer.setAnimationLoop((agora) => {
    const dt = Math.min(0.05, (agora - antes) / 1000); antes = agora;
    if (!visivel && frames > 3) return;
    for (const k of chaves) {
      // pêndulo amortecido
      if (!reduzir) { k.vel += -k.ang * 18 * dt - k.vel * 2.2 * dt; k.ang += k.vel * dt * 8; }
      k.p ??= 0; k.p += (k.t - k.p) * Math.min(1, dt * 5);
      const p = k.p;
      v.copy(k.base); v.z += p * 20; v.y += p * 0.5; v.x += p * (k.base.x > 0 ? -2.5 : 2.5);
      k.grupo.position.copy(v);
      k.grupo.rotation.set(-p * 0.3, k.grupo.userData.giro * (1 - p) + p * 0.12, k.ang * (1 - p) + p * 0.06);
    }
    renderer.render(cena, camara);
    if (++frames === 3) pronto();
  });
  return { escolher: (num) => escolher(num, false, false), atualizar, pronto: promessa };
}

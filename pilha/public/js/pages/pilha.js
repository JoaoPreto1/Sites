// A pilha da página inicial: cada bloco é um corpo rígido (Matter.js) e o HTML acompanha-o.
// Os blocos continuam a ser links: um toque abre, arrastar atira.
const stage = document.querySelector('[data-pile]');
const els = stage ? [...stage.querySelectorAll('.blk')] : [];
const tip = stage?.querySelector('.tip');
const restack = stage?.querySelector('[data-restack]');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const STEP = 1000 / 60;
const WALL = 600;

let M;
let engine;
let items = [];
let walls = {};
let W = 0;
let H = 0;
let running = false;
let visible = true;
let last = 0;
let acc = 0;
let drag = null;

const scaleFor = (w) => Math.min(1, Math.max(0.52, w / 1280));

function loadMatter() {
  if (window.Matter) return Promise.resolve(window.Matter);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = '/js/vendor/matter.min.js';
    s.onload = () => resolve(window.Matter);
    s.onerror = reject;
    document.head.append(s);
  });
}

// Forma física de cada bloco, igual à forma desenhada em CSS
function makeBody(el, x, y) {
  const { Bodies } = M;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const opts = { restitution: 0.22, friction: 0.55, frictionStatic: 0.9, frictionAir: 0.014, density: 0.0016, slop: 0.04 };
  const r = (v) => Math.max(0, v * 0.985);
  let body;
  switch (el.dataset.shape) {
    case 'circle':
      body = Bodies.circle(x, y, w / 2, opts, 40);
      break;
    case 'pill':
      body = Bodies.rectangle(x, y, w, h, { ...opts, chamfer: { radius: r(h / 2), quality: 14 } });
      break;
    case 'arch':
      body = Bodies.rectangle(x, y, w, h, { ...opts, chamfer: { radius: [r(h), r(h), 0, 0], quality: 16 } });
      break;
    case 'tall':
      body = Bodies.rectangle(x, y, w, h, { ...opts, chamfer: { radius: [0, 0, r(w / 2), r(w / 2)], quality: 14 } });
      break;
    case 'rounded':
      body = Bodies.rectangle(x, y, w, h, { ...opts, chamfer: { radius: 18 * scaleFor(W) } });
      break;
    default:
      body = Bodies.rectangle(x, y, w, h, opts);
  }
  // O Matter põe a posição no centro de massa; o HTML precisa do centro da caixa
  const off = { x: (body.bounds.min.x + body.bounds.max.x) / 2 - body.position.x, y: (body.bounds.min.y + body.bounds.max.y) / 2 - body.position.y };
  return { el, body, w, h, off };
}

function buildWalls() {
  const { Bodies, Composite } = M;
  if (walls.floor) Composite.remove(engine.world, Object.values(walls));
  const opt = { isStatic: true, friction: 0.8 };
  walls = {
    floor: Bodies.rectangle(W / 2, H - 6 + WALL / 2, W + WALL * 2, WALL, opt),
    left: Bodies.rectangle(-WALL / 2, H / 2 - H, WALL, H * 4, opt),
    right: Bodies.rectangle(W + WALL / 2, H / 2 - H, WALL, H * 4, opt),
    ceiling: Bodies.rectangle(W / 2, -H * 2.5 - WALL / 2, W + WALL * 2, WALL, opt),
  };
  Composite.add(engine.world, Object.values(walls));
}

// Onde cada bloco começa: espalhados na largura, acima do topo, a cair um a seguir ao outro
function spawnPoints() {
  const order = [0, 3, 1, 4, 2, 5, 6];
  const cols = W < 700 ? [0.28, 0.72, 0.5, 0.25, 0.75, 0.4, 0.62] : [0.16, 0.42, 0.62, 0.8, 0.93, 0.3, 0.55];
  return els.map((el, i) => {
    const k = order.indexOf(i);
    const jitter = (Math.random() - 0.5) * W * 0.05;
    return { x: Math.min(W - 60, Math.max(60, cols[i] * W + jitter)), y: -el.offsetHeight - k * (W < 700 ? 150 : 190), angle: (Math.random() - 0.5) * 0.7 };
  });
}

function render() {
  for (const it of items) {
    const { position: p, angle } = it.body;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const cx = p.x + it.off.x * c - it.off.y * s;
    const cy = p.y + it.off.x * s + it.off.y * c;
    it.el.style.transform = `translate3d(${(cx - it.w / 2).toFixed(1)}px, ${(cy - it.h / 2).toFixed(1)}px, 0) rotate(${angle.toFixed(4)}rad)`;
  }
}

// Se um bloco for atirado com tanta força que salta para fora, volta a cair do topo
function rescue() {
  const { Body } = M;
  for (const it of items) {
    const p = it.body.position;
    if (p.x < -150 || p.x > W + 150 || p.y > H + 150 || p.y < -H * 2.6) {
      Body.setPosition(it.body, { x: W / 2, y: -it.h });
      Body.setVelocity(it.body, { x: 0, y: 0 });
      Body.setAngularVelocity(it.body, 0);
    }
  }
}

function allAsleep() {
  return !drag && items.every((it) => it.body.isSleeping);
}

function frame(now) {
  if (!running) return;
  const dt = Math.min(100, now - (last || now));
  last = now;
  acc += dt;
  while (acc >= STEP) {
    M.Engine.update(engine, STEP);
    acc -= STEP;
  }
  rescue();
  render();
  if (allAsleep() || !visible) {
    running = false;
    return;
  }
  requestAnimationFrame(frame);
}

function wake() {
  if (running || !visible) return;
  running = true;
  last = 0;
  acc = 0;
  requestAnimationFrame(frame);
}

// Com movimento reduzido a pilha aparece já assente: a física corre de uma vez, sem animação
function settleNow() {
  for (let i = 0; i < 900; i++) M.Engine.update(engine, STEP);
  render();
}

function populate() {
  const { Composite, Body } = M;
  if (items.length) Composite.remove(engine.world, items.map((it) => it.body));
  const spawn = spawnPoints();
  items = els.map((el, i) => {
    const it = makeBody(el, spawn[i].x, spawn[i].y);
    Body.setAngle(it.body, spawn[i].angle);
    return it;
  });
  Composite.add(engine.world, items.map((it) => it.body));
  render();
}

function measure() {
  W = stage.clientWidth;
  H = stage.clientHeight;
  stage.style.setProperty('--s', scaleFor(W).toFixed(3));
}

function build() {
  measure();
  engine = M.Engine.create({ enableSleeping: true, positionIterations: 8, velocityIterations: 6 });
  engine.gravity.y = 1.15;
  buildWalls();
  populate();
  stage.classList.add('is-live');
  if (reduceMotion.matches) settleNow();
  else wake();
}

function restackAll() {
  populate();
  if (reduceMotion.matches) settleNow();
  else wake();
}

// ---------- Arrastar e atirar ----------
const local = (e) => {
  const r = stage.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
};

function onDown(e) {
  if (e.button > 0) return;
  const it = items.find((x) => x.el === e.currentTarget);
  if (!it) return;
  const { Constraint, Composite, Sleeping, Vector } = M;
  const p = local(e);
  Sleeping.set(it.body, false);
  const constraint = Constraint.create({ pointA: p, bodyB: it.body, pointB: Vector.sub(p, it.body.position), stiffness: 0.18, damping: 0.08, length: 0 });
  Composite.add(engine.world, constraint);
  drag = { it, constraint, start: p, t: performance.now(), moved: false, id: e.pointerId };
  it.el.setPointerCapture(e.pointerId);
  it.el.style.zIndex = 9;
  hideTip();
  wake();
}

function onMove(e) {
  if (drag && e.pointerId === drag.id) {
    const p = local(e);
    drag.constraint.pointA = p;
    if (Math.hypot(p.x - drag.start.x, p.y - drag.start.y) > 6) drag.moved = true;
    M.Sleeping.set(drag.it.body, false);
    return;
  }
  if (finePointer && e.pointerType === 'mouse') showTip(e);
}

function onUp(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { Composite, Body } = M;
  Composite.remove(engine.world, drag.constraint);
  // Limita a velocidade para nenhum bloco atravessar as paredes
  const v = drag.it.body.velocity;
  const speed = Math.hypot(v.x, v.y);
  if (speed > 45) Body.setVelocity(drag.it.body, { x: (v.x / speed) * 45, y: (v.y / speed) * 45 });
  drag.it.el.style.zIndex = '';
  drag.it.el.dataset.dragged = drag.moved || performance.now() - drag.t > 450 ? '1' : '';
  if (drag.moved && restack) restack.hidden = false;
  drag = null;
  wake();
}

// Um clique que foi na verdade um arrasto não abre o link
function onClick(e) {
  if (e.currentTarget.dataset.dragged) {
    e.preventDefault();
    e.currentTarget.dataset.dragged = '';
  }
}

// No teclado, a barra de espaços dá um pulo ao bloco que tem o foco
function onKey(e) {
  if (e.key !== ' ') return;
  const it = items.find((x) => x.el === e.currentTarget);
  if (!it) return;
  e.preventDefault();
  M.Sleeping.set(it.body, false);
  M.Body.setVelocity(it.body, { x: (Math.random() - 0.5) * 10, y: -18 });
  M.Body.setAngularVelocity(it.body, (Math.random() - 0.5) * 0.3);
  wake();
}

function showTip(e) {
  if (!tip) return;
  const target = e.target.closest('.blk');
  if (!target) return hideTip();
  const p = local(e);
  tip.textContent = target.dataset.tip;
  tip.hidden = false;
  tip.style.transform = `translate(${Math.min(p.x + 18, W - tip.offsetWidth - 8)}px, ${p.y + 20}px)`;
}
function hideTip() {
  if (tip) tip.hidden = true;
}

function bind() {
  for (const el of els) {
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave', hideTip);
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', onKey);
    el.addEventListener('dragstart', (e) => e.preventDefault());
  }
  restack?.addEventListener('click', restackAll);
  if (restack && finePointer) restack.hidden = false;

  // Só corre quando a pilha está à vista
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !allAsleep()) wake();
  }).observe(stage);

  // Ao mudar a largura volta a empilhar; se só mudar a altura (barra do telemóvel), o chão acompanha
  let t;
  addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (Math.abs(w - W) > 40) {
        measure();
        buildWalls();
        restackAll();
      } else if (h !== H) {
        H = h;
        buildWalls();
        items.forEach((it) => M.Sleeping.set(it.body, false));
        wake();
      }
    }, 180);
  });
}

if (stage) {
  loadMatter()
    .then((Matter) => {
      M = Matter;
      build();
      bind();
    })
    .catch(() => stage.classList.add('is-static'));
}

// Animações pequenas para a cena 3D: cada uma é uma Promise que acaba quando a animação acaba
const active = new Set();
let scale = 1;

export const ease = {
  linear: (t) => t,
  out: (t) => 1 - (1 - t) ** 3,
  in: (t) => t ** 3,
  inOut: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  back: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
};

// Com "reduzir movimento" ligado as animações ficam quase instantâneas
export const setScale = (value) => (scale = value);

export function tween(seconds, onUpdate, easing = ease.inOut) {
  return new Promise((resolve) => {
    const item = { start: performance.now(), duration: Math.max(1, seconds * 1000 * scale), onUpdate, easing, resolve };
    active.add(item);
  });
}

// Anima as propriedades numéricas de um objeto (ex.: mesh.position, mesh.rotation)
export function to(target, values, seconds, easing) {
  const from = Object.fromEntries(Object.keys(values).map((key) => [key, target[key]]));
  return tween(
    seconds,
    (t) => {
      for (const key in values) target[key] = from[key] + (values[key] - from[key]) * t;
    },
    easing,
  );
}

export const wait = (seconds) => tween(seconds, () => {});

export function step(now = performance.now()) {
  for (const item of active) {
    const t = Math.min(1, (now - item.start) / item.duration);
    item.onUpdate(item.easing(t));
    if (t >= 1) {
      active.delete(item);
      item.resolve();
    }
  }
  return active.size > 0;
}

export const busy = () => active.size > 0;

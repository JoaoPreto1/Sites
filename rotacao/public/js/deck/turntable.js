import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PointLight,
  SphereGeometry,
  Vector3,
} from '/vendor/three.min.js';
import { woodTexture } from './textures.js';
import { ease, to, tween } from './tween.js';

// Medidas em decímetros, mais ou menos as de um gira-discos a sério
const PLINTH = { w: 4.8, h: 0.5, d: 3.8, feet: 0.1 };
const TOP = PLINTH.feet + PLINTH.h;
export const PLATTER = { x: -0.55, z: 0.1, r: 1.62, h: 0.14 };
export const RECORD_Y = TOP + 0.04 + PLATTER.h + 0.02;
const PIVOT = { x: 1.62, z: -1.08, y: TOP + 0.4 };
const ARM = 2.36;
const RPM = (33.33 / 60) * Math.PI * 2;

const mesh = (geometry, material, { cast = true, receive = true } = {}) => {
  const m = new Mesh(geometry, material);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
};

// Ângulo do braço para a agulha ficar a uma dada distância do centro do prato
function angleFor(radius) {
  let best = 0;
  let bestError = Infinity;
  for (let a = -2.2; a <= 0.2; a += 0.0005) {
    const x = PIVOT.x + Math.sin(a) * ARM - PLATTER.x;
    const z = PIVOT.z + Math.cos(a) * ARM - PLATTER.z;
    const error = Math.abs(Math.hypot(x, z) - radius);
    if (error < bestError) {
      bestError = error;
      best = a;
    }
  }
  return best;
}

export function createTurntable() {
  const group = new Group();
  group.name = 'gira-discos';

  const wood = new MeshStandardMaterial({ map: woodTexture({ base: '#4a2e1c', dark: '#2f1c10', light: '#6b4429' }), roughness: 0.55, metalness: 0.05 });
  const graphite = new MeshStandardMaterial({ color: '#1d1b1a', roughness: 0.38, metalness: 0.6 });
  const alu = new MeshStandardMaterial({ color: '#cfccc6', roughness: 0.26, metalness: 0.92 });
  const rubber = new MeshStandardMaterial({ color: '#111', roughness: 0.95 });

  const plinth = mesh(new BoxGeometry(PLINTH.w, PLINTH.h, PLINTH.d), wood);
  plinth.position.y = PLINTH.feet + PLINTH.h / 2;
  group.add(plinth);

  const plate = mesh(new BoxGeometry(PLINTH.w - 0.12, 0.04, PLINTH.d - 0.12), graphite);
  plate.position.y = TOP + 0.02;
  group.add(plate);

  for (const [x, z] of [[-1.9, -1.5], [1.9, -1.5], [-1.9, 1.5], [1.9, 1.5]]) {
    const foot = mesh(new CylinderGeometry(0.22, 0.26, PLINTH.feet, 24), rubber);
    foot.position.set(x, PLINTH.feet / 2, z);
    group.add(foot);
  }

  // Prato: gira com tudo o que estiver em cima dele
  const platter = new Group();
  platter.position.set(PLATTER.x, TOP + 0.04, PLATTER.z);
  group.add(platter);

  const rim = mesh(new CylinderGeometry(PLATTER.r, PLATTER.r, PLATTER.h, 96), alu);
  rim.position.y = PLATTER.h / 2;
  platter.add(rim);

  // Pontos do estroboscópio na borda: mostram que o prato está a girar
  const dotMaterial = new MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.5 });
  for (let i = 0; i < 48; i++) {
    const dot = new Mesh(new BoxGeometry(0.05, 0.05, 0.02), dotMaterial);
    const a = (i / 48) * Math.PI * 2;
    dot.position.set(Math.sin(a) * (PLATTER.r + 0.005), PLATTER.h / 2, Math.cos(a) * (PLATTER.r + 0.005));
    dot.rotation.y = a;
    platter.add(dot);
  }

  const mat = mesh(new CylinderGeometry(PLATTER.r - 0.06, PLATTER.r - 0.06, 0.015, 96), rubber);
  mat.position.y = PLATTER.h + 0.008;
  platter.add(mat);

  const spindle = mesh(new CylinderGeometry(0.035, 0.035, 0.16, 16), alu);
  spindle.position.y = PLATTER.h + 0.08;
  platter.add(spindle);

  // Braço: base, pivô, tubo, cabeça com a agulha e contrapeso
  const base = mesh(new CylinderGeometry(0.3, 0.32, 0.12, 40), alu);
  base.position.set(PIVOT.x, TOP + 0.1, PIVOT.z);
  group.add(base);
  const pillar = mesh(new CylinderGeometry(0.08, 0.08, 0.32, 20), graphite);
  pillar.position.set(PIVOT.x, TOP + 0.24, PIVOT.z);
  group.add(pillar);

  const arm = new Group();
  arm.position.set(PIVOT.x, PIVOT.y, PIVOT.z);
  group.add(arm);
  const lift = new Group();
  arm.add(lift);

  const tube = mesh(new CylinderGeometry(0.032, 0.032, ARM * 0.92, 16), alu);
  tube.rotation.x = Math.PI / 2;
  tube.position.z = ARM * 0.44;
  lift.add(tube);

  const head = mesh(new BoxGeometry(0.2, 0.05, 0.34), graphite);
  head.position.set(0, -0.03, ARM - 0.06);
  head.rotation.y = 0.32;
  lift.add(head);

  const cartridge = mesh(new BoxGeometry(0.13, 0.11, 0.18), new MeshStandardMaterial({ color: '#ff5a1f', roughness: 0.45 }));
  cartridge.position.set(0, -0.11, ARM - 0.03);
  cartridge.rotation.y = 0.32;
  lift.add(cartridge);

  const weight = mesh(new CylinderGeometry(0.16, 0.16, 0.26, 32), alu);
  weight.rotation.x = Math.PI / 2;
  weight.position.z = -0.4;
  lift.add(weight);

  const rest = mesh(new CylinderGeometry(0.04, 0.05, 0.36, 12), graphite);
  rest.position.set(PIVOT.x + 0.02, TOP + 0.18, PIVOT.z + ARM * 0.7);
  group.add(rest);

  // Botões da frente e a luz que acende quando toca
  const startButton = mesh(new BoxGeometry(0.62, 0.08, 0.36), alu);
  startButton.position.set(-1.72, TOP + 0.06, 1.5);
  startButton.name = 'start';
  group.add(startButton);

  const speedMaterial = (on) => new MeshStandardMaterial({ color: on ? '#4be37d' : '#3a3632', emissive: on ? new Color('#1f8f45') : new Color('#000'), roughness: 0.4 });
  const on = speedMaterial(true);
  const off = speedMaterial(false);
  const speed33 = mesh(new BoxGeometry(0.3, 0.06, 0.22), on);
  speed33.position.set(-1.14, TOP + 0.05, 1.5);
  speed33.name = '33';
  const speed45 = mesh(new BoxGeometry(0.3, 0.06, 0.22), off);
  speed45.position.set(-0.76, TOP + 0.05, 1.5);
  speed45.name = '45';
  group.add(speed33, speed45);
  let rpmFactor = 1;

  const ledMaterial = new MeshStandardMaterial({ color: '#ff3b20', emissive: new Color('#ff3b20'), emissiveIntensity: 0.2 });
  const led = new Mesh(new SphereGeometry(0.06, 16, 16), ledMaterial);
  led.position.set(1.98, TOP + 0.05, 1.52);
  group.add(led);

  // Uma luz morna por baixo do prato, que respira com os graves
  const glow = new PointLight('#ff7a3d', 0, 6, 2);
  glow.position.set(PLATTER.x, TOP + 1.2, PLATTER.z + 0.4);
  group.add(glow);

  const angles = { rest: 0.04, start: angleFor(1.42), end: angleFor(0.72) };
  arm.rotation.y = angles.rest;
  lift.rotation.x = -0.05;

  let speed = 0;
  let targetSpeed = 0;
  let current = null;

  return {
    group,
    platter,
    clickables: [startButton, speed33, speed45, rim, mat],
    get record() {
      return current;
    },
    set record(value) {
      current = value;
    },
    // Ponto onde o vinil assenta, em coordenadas da cena
    recordWorld() {
      return group.localToWorld(new Vector3(PLATTER.x, RECORD_Y, PLATTER.z));
    },
    spin(on) {
      targetSpeed = on ? RPM * rpmFactor : 0;
    },
    setSpeed(rpm) {
      rpmFactor = rpm === 45 ? 45 / 33.33 : 1;
      speed33.material = rpm === 45 ? off : on;
      speed45.material = rpm === 45 ? on : off;
      if (targetSpeed) targetSpeed = RPM * rpmFactor;
    },
    get spinning() {
      return targetSpeed > 0;
    },
    async armTo(progress) {
      const angle = angles.start + (angles.end - angles.start) * progress;
      await to(lift.rotation, { x: -0.12 }, 0.25, ease.out);
      await to(arm.rotation, { y: angle }, 0.7, ease.inOut);
      await to(lift.rotation, { x: 0 }, 0.35, ease.out);
    },
    async armHome() {
      await to(lift.rotation, { x: -0.12 }, 0.25, ease.out);
      await to(arm.rotation, { y: angles.rest }, 0.65, ease.inOut);
      await to(lift.rotation, { x: -0.05 }, 0.2);
    },
    // Enquanto toca, a agulha vai andando para o centro
    follow(progress) {
      arm.rotation.y += (angles.start + (angles.end - angles.start) * progress - arm.rotation.y) * 0.08;
    },
    lifted: (up) => to(lift.rotation, { x: up ? -0.1 : 0 }, 0.3, ease.out),
    press: (button) => tween(0.18, (t) => (button.position.y = TOP + 0.06 - Math.sin(t * Math.PI) * 0.04)),
    update(dt, level) {
      speed += (targetSpeed - speed) * Math.min(1, dt * (targetSpeed ? 1.6 : 1.1));
      if (Math.abs(speed) < 0.001) speed = 0;
      platter.rotation.y -= speed * dt;
      const playing = targetSpeed > 0;
      ledMaterial.emissiveIntensity += ((playing ? 1.2 + level.all * 3 : 0.15) - ledMaterial.emissiveIntensity) * 0.2;
      glow.intensity += ((playing ? 2 + level.bass * 14 : 0) - glow.intensity) * 0.15;
      return speed !== 0 || glow.intensity > 0.01;
    },
    vinylMaterial: (map) => new MeshPhysicalMaterial({ map, roughness: 0.32, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.18 }),
  };
}

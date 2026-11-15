import { BoxGeometry, Color, Group, Mesh, MeshStandardMaterial, PlaneGeometry } from '/vendor/three.min.js';
import { backTexture, coverTexture, stencilTexture, tabTexture, woodTexture } from './textures.js';

// Caixote de madeira com os discos de pé e separadores de cartão entre os géneros
const INNER = { w: 3.42, d: 2.75 };
const WALL = 0.1;
const SIDE_H = 1.75;
const FRONT_H = 1.12;
const FLOOR = 0.14;
export const SLEEVE = 3.1;
const GAP = 0.07;

const box = (w, h, d, material) => {
  const m = new Mesh(new BoxGeometry(w, h, d), material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

export function createCrate({ records, crates, anisotropy }) {
  const group = new Group();
  group.name = 'caixote';
  const wood = new MeshStandardMaterial({ map: woodTexture({ anisotropy }), roughness: 0.75 });
  const darkWood = new MeshStandardMaterial({ map: woodTexture({ base: '#74492a', dark: '#583520', light: '#8d5f3c', anisotropy }), roughness: 0.8 });

  // Ripas com frestas, como os caixotes de fruta
  const slats = (length, height, horizontal, material) => {
    const g = new Group();
    const count = Math.round(height / 0.48);
    const h = height / count - 0.05;
    for (let i = 0; i < count; i++) {
      const slat = horizontal ? box(length, h, WALL, material) : box(WALL, h, length, material);
      slat.position.y = FLOOR + i * (height / count) + h / 2;
      g.add(slat);
    }
    return g;
  };

  const floor = box(INNER.w + WALL * 2, FLOOR, INNER.d + WALL * 2, darkWood);
  floor.position.y = FLOOR / 2;
  group.add(floor);

  const back = slats(INNER.w + WALL * 2, SIDE_H, true, wood);
  back.position.z = -INNER.d / 2 - WALL / 2;
  const left = slats(INNER.d, SIDE_H, false, wood);
  left.position.x = -INNER.w / 2 - WALL / 2;
  const right = slats(INNER.d, SIDE_H, false, wood);
  right.position.x = INNER.w / 2 + WALL / 2;
  group.add(back, left, right);

  const front = box(INNER.w + WALL * 2, FRONT_H, WALL, wood);
  front.position.set(0, FLOOR + FRONT_H / 2, INNER.d / 2 + WALL / 2);
  group.add(front);

  // Letras pintadas à frente, mudam com o género que está a ser folheado
  const stencilMaterial = new MeshStandardMaterial({ transparent: true, roughness: 0.9, depthWrite: false });
  const stencil = new Mesh(new PlaneGeometry(INNER.w * 0.92, INNER.w * 0.92), stencilMaterial);
  stencil.position.set(0, FLOOR + FRONT_H * 0.5, INNER.d / 2 + WALL + 0.002);
  group.add(stencil);
  let stencilName = '';
  const setStencil = (name) => {
    if (name === stencilName) return;
    stencilName = name;
    stencilMaterial.map?.dispose();
    stencilMaterial.map = stencilTexture(`Rotação · ${name}`, anisotropy);
    stencilMaterial.needsUpdate = true;
  };

  // Lista com separador + discos de cada género, da frente para trás
  const items = [];
  crates.forEach((crate, c) => {
    const list = records.filter((r) => r.crate === crate.slug);
    if (!list.length) return;
    items.push({ type: 'divider', crate, tabIndex: c });
    list.forEach((record) => items.push({ type: 'record', crate, record }));
  });

  const frontZ = INNER.d / 2 - 0.12;
  const edgeColor = (hex) => new Color(hex).multiplyScalar(0.55);

  items.forEach((item, i) => {
    const holder = new Group();
    holder.position.set(0, FLOOR, frontZ - i * GAP);
    item.z = holder.position.z;
    item.group = holder;
    item.index = i;
    item.angle = -0.1;
    item.targetZ = item.z;
    item.lift = 0;
    item.out = false;

    if (item.type === 'record') {
      const edge = new MeshStandardMaterial({ color: edgeColor(item.record.color), roughness: 0.7 });
      const materials = [
        edge,
        edge,
        edge,
        edge,
        new MeshStandardMaterial({ map: coverTexture(item.record, anisotropy), roughness: 0.55 }),
        new MeshStandardMaterial({ map: backTexture(item.record, anisotropy), roughness: 0.8 }),
      ];
      const sleeve = new Mesh(new BoxGeometry(SLEEVE, SLEEVE, 0.035), materials);
      sleeve.position.y = SLEEVE / 2;
      sleeve.castShadow = true;
      sleeve.receiveShadow = true;
      sleeve.userData.item = item;
      holder.add(sleeve);
      item.sleeve = sleeve;
    } else {
      const card = new MeshStandardMaterial({ color: '#d9cdb6', roughness: 0.9 });
      const board = new Mesh(new BoxGeometry(INNER.w - 0.08, SLEEVE - 0.15, 0.018), card);
      board.position.y = (SLEEVE - 0.15) / 2;
      board.castShadow = true;
      const tabMaterials = [card, card, card, card, new MeshStandardMaterial({ map: tabTexture(item.crate.name, anisotropy), roughness: 0.9 }), card];
      const tab = new Mesh(new BoxGeometry(1.15, 0.43, 0.018), tabMaterials);
      tab.position.set(-1.05 + (item.tabIndex % 3) * 1.05, SLEEVE - 0.15 + 0.21, 0);
      tab.castShadow = true;
      board.userData.item = tab.userData.item = item;
      holder.add(board, tab);
      item.sleeve = board;
    }
    group.add(holder);
  });

  const recordItems = items.filter((i) => i.type === 'record');
  let selected = items.findIndex((i) => i.type === 'record');
  let hovered = null;

  // Os da frente tombam para a frente e encostam à parede; o escolhido levanta-se; os de trás encostam-se para trás
  function layout() {
    for (const item of items) {
      if (item.out) continue;
      const i = item.index;
      if (i < selected) {
        // Tombados para a frente, pendurados por cima da parede da frente, em leque
        const k = selected - i;
        item.targetAngle = Math.min(1.5, 1.34 + k * 0.012);
        item.targetLift = FRONT_H - 0.02 + k * 0.004;
        item.targetZ = INNER.d / 2 + WALL * 0.5 - k * 0.012;
      } else if (i === selected) {
        item.targetAngle = -0.14;
        item.targetLift = item.type === 'record' ? 0.85 : 0;
        item.targetZ = item.z;
      } else {
        item.targetAngle = -0.18 - Math.min(0.12, (i - selected) * 0.004);
        item.targetLift = 0;
        item.targetZ = item.z;
      }
    }
    const current = items[selected];
    setStencil(current.crate.name);
  }

  function select(index) {
    let i = Math.max(0, Math.min(items.length - 1, index));
    if (items[i].type === 'divider') i = Math.min(items.length - 1, i + 1);
    selected = i;
    layout();
    return items[selected];
  }

  const step = (direction) => {
    const position = recordItems.indexOf(items[selected]);
    const next = recordItems[Math.max(0, Math.min(recordItems.length - 1, position + direction))];
    return select(next.index);
  };

  layout();

  return {
    group,
    items,
    recordItems,
    get selected() {
      return items[selected];
    },
    select,
    next: () => step(1),
    prev: () => step(-1),
    selectCrate(slug) {
      const divider = items.find((i) => i.type === 'divider' && i.crate.slug === slug);
      return divider ? select(divider.index + 1) : items[selected];
    },
    find: (recordId) => recordItems.find((i) => i.record.id === recordId),
    position: () => recordItems.indexOf(items[selected]),
    meshes: () => items.filter((i) => !i.out).flatMap((i) => i.group.children),
    hover(item) {
      hovered = item;
    },
    // Ponto onde um disco fica depois de sair do caixote
    slotTop: (item) => ({ x: 0, y: FLOOR + SLEEVE + 0.4, z: item.z }),
    update(dt) {
      let moving = false;
      const k = Math.min(1, dt * 9);
      for (const item of items) {
        if (item.out) continue;
        const lift = item.targetLift + (item === hovered && item.type === 'record' ? 0.14 : 0);
        const da = item.targetAngle - item.angle;
        const dl = lift - item.lift;
        const dz = item.targetZ - item.group.position.z;
        if (Math.abs(da) > 0.0005 || Math.abs(dl) > 0.0005 || Math.abs(dz) > 0.0005) moving = true;
        item.angle += da * k;
        item.lift += dl * k;
        item.group.rotation.x = item.angle;
        item.group.position.y = FLOOR + item.lift;
        item.group.position.z += dz * k;
      }
      return moving;
    },
  };
}

// O gira-discos 3D: um caixote para folhear e um prato onde o disco escolhido vai tocar.
// Clicar num disco tira-o da capa, pousa-o no prato, baixa a agulha e começa a tocar.
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  Raycaster,
  RoomEnvironment,
  Scene,
  ShadowMaterial,
  SpotLight,
  Vector2,
  Vector3,
  WebGLRenderer,
  MeshBasicMaterial,
} from '/vendor/three.min.js';
import * as player from '../player.js';
import { createCrate, SLEEVE } from './crate.js';
import { floorTexture, vinylTexture, woodTexture } from './textures.js';
import { PLATTER, createTurntable } from './turntable.js';
import { ease, setScale, step, to, tween, wait } from './tween.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createDeck(container, { records, crates, onHover = () => {}, onSelect = () => {}, onBusy = () => {} }) {
  setScale(reducedMotion ? 0.15 : 1);

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.5 : 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.domElement.className = 'deck__canvas';
  container.append(renderer.domElement);
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;

  const camera = new PerspectiveCamera(34, 1, 0.1, 100);
  const lookAt = new Vector3();
  const cameraBase = new Vector3();
  const cameraNow = new Vector3();

  // Luzes: uma principal morna com sombras, um contorno laranja por trás e luz ambiente baixa
  scene.add(new HemisphereLight('#ffe6c7', '#1a1210', 0.55), new AmbientLight('#ffffff', 0.08));
  const key = new DirectionalLight('#ffd9b0', 2.1);
  key.position.set(-5, 11, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -7;
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new DirectionalLight('#ff8a4c', 1.6);
  rim.position.set(6, 5, -8);
  scene.add(rim);
  const pool = new SpotLight('#ffcf9a', 40, 30, 0.6, 0.8, 1.4);
  pool.position.set(0, 12, 3);
  scene.add(pool, pool.target);

  // Chão: uma mancha de luz e a sombra dos objetos
  const floor = new Mesh(new PlaneGeometry(26, 26), new MeshBasicMaterial({ map: floorTexture(), transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.001;
  scene.add(floor);
  const shadow = new Mesh(new PlaneGeometry(26, 26), new ShadowMaterial({ opacity: 0.5 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.receiveShadow = true;
  scene.add(shadow);

  const crate = createCrate({ records, crates, anisotropy });
  const deck = createTurntable();
  scene.add(crate.group, deck.group);

  // Prateleira atrás do gira-discos onde a capa do disco que está a tocar fica à vista
  const ledge = new Mesh(new BoxGeometry(3.6, 0.16, 0.6), new MeshStandardMaterial({ map: woodTexture({ base: '#5a3a24', dark: '#3b2414', light: '#73492d', anisotropy }), roughness: 0.7 }));
  ledge.position.set(-0.55, 0.08, -2.75);
  ledge.castShadow = ledge.receiveShadow = true;
  deck.group.add(ledge);
  const stand = new Object3D();
  stand.position.set(-0.55, 0.16, -2.72);
  stand.rotation.x = -0.24;
  deck.group.add(stand);

  // Disposição: lado a lado em ecrãs largos, em diagonal em ecrãs estreitos
  function arrange() {
    const { clientWidth: w, clientHeight: h } = container;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const wide = camera.aspect >= 1.15;

    if (wide) {
      crate.group.position.set(-3.05, 0, 0.35);
      crate.group.rotation.y = 0.2;
      deck.group.position.set(2.75, 0, 0.55);
      deck.group.rotation.y = -0.14;
      camera.fov = 32;
      cameraBase.set(0.3, 6.6, 11.6);
      lookAt.set(0.1, 1.35, 0);
    } else {
      crate.group.position.set(-1.45, 0, 1.55);
      crate.group.rotation.y = 0.32;
      deck.group.position.set(1.55, 0, -1.9);
      deck.group.rotation.y = -0.3;
      camera.fov = 40;
      cameraBase.set(0, 9.2, 11.4);
      lookAt.set(0, 1.25, -0.2);
    }

    // Afasta a câmara até tudo caber na largura
    const needed = wide ? 7.1 : 4.3;
    const halfWidth = Math.tan(((camera.fov * Math.PI) / 180) / 2) * camera.aspect * cameraBase.distanceTo(lookAt);
    if (halfWidth < needed) cameraBase.sub(lookAt).multiplyScalar(needed / halfWidth).add(lookAt);
    camera.updateProjectionMatrix();
    cameraNow.copy(cameraBase);
    camera.position.copy(cameraNow);
    camera.lookAt(lookAt);
    camera.updateMatrixWorld();
    dirty = true;
  }

  // Leva um objeto, por um arco, até à posição e rotação de outro objeto da cena
  const tmpQ = new Quaternion();
  async function fly(object, target, seconds, arc = 1.2) {
    scene.attach(object);
    const fromP = object.position.clone();
    const fromQ = object.quaternion.clone();
    const toP = new Vector3();
    const toQ = new Quaternion();
    target.updateWorldMatrix(true, false);
    target.getWorldPosition(toP);
    target.getWorldQuaternion(toQ);
    const mid = fromP.clone().lerp(toP, 0.5);
    mid.y = Math.max(fromP.y, toP.y) + arc;
    await tween(
      seconds,
      (t) => {
        const a = (1 - t) ** 2;
        const b = 2 * (1 - t) * t;
        const c = t ** 2;
        object.position.set(a * fromP.x + b * mid.x + c * toP.x, a * fromP.y + b * mid.y + c * toP.y, a * fromP.z + b * mid.z + c * toP.z);
        object.quaternion.slerpQuaternions(fromQ, toQ, t);
      },
      ease.inOut,
    );
    // Recalcula no fim, porque o alvo pode ter mexido (o prato gira)
    target.getWorldPosition(toP);
    target.getWorldQuaternion(tmpQ);
    object.position.copy(toP);
    object.quaternion.copy(tmpQ);
  }

  const anchor = (parent, position, rotation = [0, 0, 0]) => {
    const o = new Object3D();
    o.position.set(...position);
    o.rotation.set(...rotation);
    parent.add(o);
    return o;
  };

  const vinylGeometry = new CylinderGeometry(1.5, 1.5, 0.022, 128);
  const vinylEdge = new MeshStandardMaterial({ color: '#0c0c0c', roughness: 0.4 });
  function vinylFor(item) {
    if (!item.vinyl) {
      const material = deck.vinylMaterial(vinylTexture(item.record, anisotropy));
      item.vinyl = new Mesh(vinylGeometry, [vinylEdge, material, material]);
      item.vinyl.castShadow = true;
      item.vinyl.receiveShadow = true;
      item.vinyl.userData.vinyl = item;
    }
    return item.vinyl;
  }

  let current = null;
  let queue = Promise.resolve();
  let wanted = null;
  let busy = false;

  // Tira o disco do prato e devolve-o ao caixote
  async function unload(item) {
    player.pause();
    deck.spin(false);
    await deck.armHome();
    const vinyl = item.vinyl;
    const back = anchor(item.group, [SLEEVE * 0.62, SLEEVE / 2, 0.03], [Math.PI / 2, 0, 0]);
    await fly(vinyl, back, 0.9, 1.4);
    item.group.attach(vinyl);
    back.removeFromParent();
    await to(vinyl.position, { x: 0 }, 0.4, ease.inOut);
    vinyl.visible = false;

    const top = crate.slotTop(item);
    const slot = anchor(crate.group, [top.x, top.y, top.z]);
    await fly(item.group, slot, 0.85, 1.5);
    crate.group.attach(item.group);
    slot.removeFromParent();
    item.group.rotation.set(item.angle, 0, 0);
    item.lift = item.group.position.y - 0.14;
    item.out = false;
    deck.record = null;
  }

  // Tira o disco da capa e pousa-o no prato
  async function load(item) {
    crate.select(item.index);
    onSelect(item.record);
    item.out = true;
    const startY = item.group.position.y;
    await tween(0.55, (t) => {
      item.group.position.y = startY + t * (SLEEVE + 0.4 - startY);
      item.group.rotation.x = item.angle * (1 - t);
    }, ease.out);

    await fly(item.group, stand, 0.95, 1.3);
    deck.group.attach(item.group);

    const vinyl = vinylFor(item);
    vinyl.visible = true;
    vinyl.position.set(0, SLEEVE / 2, 0.03);
    vinyl.rotation.set(Math.PI / 2, 0, 0);
    item.group.add(vinyl);
    await to(vinyl.position, { x: SLEEVE * 0.62 }, 0.5, ease.inOut);

    const seat = anchor(deck.platter, [0, PLATTER.h + 0.03, 0]);
    await fly(vinyl, seat, 1.0, 1.1);
    deck.platter.attach(vinyl);
    seat.removeFromParent();
    vinyl.position.set(0, PLATTER.h + 0.03, 0);
    deck.record = item.record;
  }

  async function play(item, { startAudio = true, index = 0 } = {}) {
    if (current === item) {
      if (startAudio) player.toggle();
      return;
    }
    busy = true;
    onBusy(true);
    if (startAudio) player.pause();
    if (current) await unload(current);
    current = item;
    await load(item);
    deck.spin(true);
    await deck.armTo(0);
    if (startAudio) await player.playRecord(item.record, index);
    busy = false;
    onBusy(false);
  }

  // Pedidos feitos a meio de uma animação: fica só o último
  function request(item, options) {
    wanted = { item, options };
    queue = queue.then(async () => {
      if (!wanted) return;
      const next = wanted;
      wanted = null;
      await play(next.item, next.options);
    });
    return queue;
  }

  // O leitor manda: se tocar outro disco (pelas capas da página), o gira-discos acompanha
  const off = player.on('change', (state, event) => {
    if (event === 'track' && state.record && state.record.id !== current?.record.id && !busy) {
      const item = crate.find(state.record.id);
      if (item) request(item, { startAudio: false });
    }
    if (!current || state.record?.id !== current.record.id) return;
    if (event === 'play') {
      deck.spin(true);
      deck.lifted(false);
    } else if (event === 'pause' && !busy) {
      deck.spin(false);
      deck.lifted(true);
    } else if (event === 'end') {
      deck.spin(false);
      deck.armHome();
    } else if (event === 'time' && state.playing) {
      const total = state.record.tracks.length;
      deck.follow((state.index + state.time / (state.duration || 30)) / total);
    }
    dirty = true;
  });

  // Rato e toque
  const raycaster = new Raycaster();
  const pointer = new Vector2(2, 2);
  const parallax = new Vector2();
  let pointerDirty = false;
  let drag = null;

  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const objects = [...crate.meshes(), ...deck.clickables, ...(current?.vinyl ? [current.vinyl] : [])];
    const hit = raycaster.intersectObjects(objects, false)[0];
    if (!hit) return null;
    const object = hit.object;
    if (object.userData.item) return { kind: 'crate', item: object.userData.item };
    if (object.userData.vinyl || deck.clickables.includes(object)) return { kind: 'deck', object };
    return null;
  }

  const toNdc = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    parallax.copy(pointer);
    return rect;
  };

  let hoverState = null;
  function updateHover(event) {
    const rect = toNdc(event);
    const hit = pick();
    const item = hit?.kind === 'crate' && hit.item.type === 'record' ? hit.item : null;
    crate.hover(item);
    renderer.domElement.style.cursor = hit ? 'pointer' : drag ? 'grabbing' : 'grab';
    const record = item?.record ?? (hit?.kind === 'deck' && current ? current.record : null);
    const key = record ? `${record.id}:${hit.kind}` : null;
    if (record) onHover({ record, onDeck: hit.kind === 'deck', selected: item === crate.selected || item === current, x: event.clientX - rect.left, y: event.clientY - rect.top });
    else if (hoverState) onHover(null);
    hoverState = key;
    dirty = true;
  }

  function click() {
    const hit = pick();
    if (!hit) return;
    if (hit.kind === 'crate') {
      const item = hit.item;
      if (item.type === 'divider') return onSelect(crate.selectCrate(item.crate.slug).record);
      if (item === crate.selected || item === current) return request(item);
      crate.select(item.index);
      onSelect(item.record);
      return;
    }
    // 33 ou 45 rotações: muda a velocidade do prato e do som
    if (hit.object.name === '33' || hit.object.name === '45') {
      const rpm = Number(hit.object.name);
      deck.setSpeed(rpm);
      player.setRate(rpm === 45 ? 45 / 33.33 : 1);
      return;
    }
    // Botão de arranque, prato ou o próprio disco: pára e recomeça
    if (hit.object.name === 'start') deck.press(hit.object);
    if (current) player.toggle();
    else request(crate.selected);
  }

  const canvas = renderer.domElement;
  canvas.addEventListener('pointermove', (event) => {
    if (drag) {
      const dx = event.clientX - drag.x;
      if (Math.abs(dx) > 34) {
        dx < 0 ? crate.next() : crate.prev();
        onSelect(crate.selected.record);
        drag.x = event.clientX;
        drag.moved = true;
      }
    }
    if (!pointerDirty) {
      pointerDirty = true;
      requestAnimationFrame(() => {
        pointerDirty = false;
        updateHover(event);
      });
    }
  });
  canvas.addEventListener('pointerdown', (event) => {
    drag = { x: event.clientX, moved: false };
    toNdc(event);
    player.prepare();
  });
  canvas.addEventListener('pointerup', () => {
    if (drag && !drag.moved) click();
    drag = null;
  });
  canvas.addEventListener('pointerleave', () => {
    drag = null;
    crate.hover(null);
    hoverState = null;
    onHover(null);
    parallax.set(0, 0);
  });
  canvas.addEventListener(
    'wheel',
    (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 8) return;
      event.preventDefault();
      event.deltaX > 0 ? crate.next() : crate.prev();
      onSelect(crate.selected.record);
    },
    { passive: false },
  );

  // Ciclo de desenho: só desenha quando alguma coisa mexe
  let dirty = true;
  let last = performance.now();
  let running = true;
  let visible = true;
  let frame = 0;

  function loop(now) {
    frame = requestAnimationFrame(loop);
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const level = player.level();

    let moving = step(now);
    moving = crate.update(dt) || moving;
    moving = deck.update(dt, level) || moving;

    if (!reducedMotion) {
      const target = cameraBase.clone().add(new Vector3(parallax.x * 0.55, parallax.y * 0.3, 0));
      if (cameraNow.distanceToSquared(target) > 0.00001) {
        cameraNow.lerp(target, Math.min(1, dt * 3));
        moving = true;
      }
    }
    if (moving || dirty) {
      camera.position.copy(cameraNow);
      camera.lookAt(lookAt);
      renderer.render(scene, camera);
      dirty = false;
    }
  }

  const resizeObserver = new ResizeObserver(arrange);
  resizeObserver.observe(container);
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  io.observe(container);
  arrange();

  // Entrada: os discos caem para dentro do caixote, um a um
  if (!reducedMotion) {
    crate.items.forEach((item, i) => {
      item.out = true;
      item.group.visible = false;
      wait(0.15 + i * 0.03).then(() => {
        item.lift = 4.5;
        item.group.position.y = 4.5;
        item.group.visible = true;
        item.out = false;
      });
    });
  }
  frame = requestAnimationFrame(loop);

  return {
    next() {
      onSelect(crate.next().record);
    },
    prev() {
      onSelect(crate.prev().record);
    },
    selectCrate(slug) {
      onSelect(crate.selectCrate(slug).record);
    },
    select(recordId) {
      const item = crate.find(recordId);
      if (item) onSelect(crate.select(item.index).record);
    },
    play(recordId, index = 0) {
      player.prepare();
      const item = recordId ? crate.find(recordId) : crate.selected;
      if (!item) return;
      if (current === item) return player.playRecord(item.record, index);
      return request(item, { index });
    },
    get selected() {
      return crate.selected.record;
    },
    get position() {
      return { index: crate.position(), total: crate.recordItems.length };
    },
    destroy() {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      io.disconnect();
      off();
      renderer.dispose();
      canvas.remove();
    },
    get running() {
      return running;
    },
  };
}

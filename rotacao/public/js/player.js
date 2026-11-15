// Um só leitor para a página toda: o gira-discos 3D, as capas e o mini leitor usam este.
// Toca as pré-escutas de 30 s; quem tem o disco ouve a faixa completa, quando a loja a tiver.
import { api } from './api.js';
import { currentUser } from './session.js';

const VOLUME_KEY = 'rotacao.volume';
const listeners = new Map();
const state = { record: null, index: 0, playing: false, loading: false, full: false };

let audio = null;
let analyser = null;
let bins = null;

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => listeners.get(event).delete(fn);
}

function emit(event) {
  const detail = snapshot();
  listeners.get(event)?.forEach((fn) => fn(detail));
  listeners.get('change')?.forEach((fn) => fn(detail, event));
}

export function snapshot() {
  return {
    ...state,
    track: state.record?.tracks[state.index] ?? null,
    time: audio?.currentTime ?? 0,
    duration: audio && Number.isFinite(audio.duration) ? audio.duration : 30,
    volume: audio?.volume ?? storedVolume(),
  };
}

function storedVolume() {
  try {
    const value = Number(localStorage.getItem(VOLUME_KEY));
    return value >= 0 && value <= 1 && localStorage.getItem(VOLUME_KEY) !== null ? value : 0.8;
  } catch {
    return 0.8;
  }
}

function element() {
  if (audio) return audio;
  audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  audio.volume = storedVolume();

  audio.addEventListener('playing', () => {
    state.playing = true;
    state.loading = false;
    emit('play');
  });
  audio.addEventListener('pause', () => {
    state.playing = false;
    emit('pause');
  });
  audio.addEventListener('waiting', () => {
    state.loading = true;
    emit('loading');
  });
  audio.addEventListener('timeupdate', () => emit('time'));
  audio.addEventListener('ended', () => (hasNext() ? next() : finish()));
  audio.addEventListener('error', () => {
    state.loading = false;
    state.playing = false;
    emit('error');
  });
  return audio;
}

// O analisador só pode nascer depois de um clique (regra dos browsers para o som)
function connectAnalyser() {
  if (analyser || !window.AudioContext) return;
  try {
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    bins = new Uint8Array(analyser.frequencyBinCount);
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    analyser = null;
  }
}

// Nível do som entre 0 e 1: graves, médios e total (para as luzes e os medidores)
export function level() {
  if (!analyser || !state.playing) return { bass: 0, mid: 0, all: 0, bins: null };
  analyser.getByteFrequencyData(bins);
  const avg = (from, to) => {
    let sum = 0;
    for (let i = from; i < to; i++) sum += bins[i];
    return sum / (to - from) / 255;
  };
  return { bass: avg(1, 8), mid: avg(8, 40), all: avg(1, 64), bins };
}

// Chamado num clique: prepara o som enquanto o browser ainda deixa
export function prepare() {
  element();
  connectAnalyser();
}

// 45 rotações: o mesmo disco mais rápido e mais agudo
export function setRate(rate) {
  const el = element();
  el.preservesPitch = false;
  el.playbackRate = rate;
}

async function sourceFor(record, index) {
  const track = record.tracks[index];
  if (track.hasFull && currentUser()) {
    try {
      const { url } = await api(`/discos/${record.id}/faixas/${index}/completa`, { auth: true });
      return { url, full: true };
    } catch {}
  }
  return { url: track.preview, full: false };
}

export async function playRecord(record, index = 0) {
  const el = element();
  connectAnalyser();
  const sameTrack = state.record?.id === record.id && state.index === index;
  state.record = record;
  state.index = index;

  if (sameTrack && el.src) {
    await el.play().catch(() => {});
    return;
  }

  state.loading = true;
  emit('track');
  const { url, full } = await sourceFor(record, index);
  if (state.record?.id !== record.id || state.index !== index) return;
  state.full = full;
  el.src = url;
  await el.play().catch(() => {
    state.loading = false;
    emit('error');
  });
}

const hasNext = () => state.record && state.index < state.record.tracks.length - 1;

export const next = () => hasNext() && playRecord(state.record, state.index + 1);
export const prev = () => state.record && playRecord(state.record, Math.max(0, (audio?.currentTime ?? 0) > 3 ? state.index : state.index - 1));

export function pause() {
  audio?.pause();
}

export function resume() {
  if (state.record) return playRecord(state.record, state.index);
}

export const toggle = () => (state.playing ? pause() : resume());

export function seek(fraction) {
  if (!audio || !Number.isFinite(audio.duration)) return;
  audio.currentTime = Math.max(0, Math.min(0.999, fraction)) * audio.duration;
}

export function setVolume(value) {
  element().volume = value;
  try {
    localStorage.setItem(VOLUME_KEY, String(value));
  } catch {}
  emit('volume');
}

function finish() {
  state.playing = false;
  emit('end');
}

// Tira o disco do prato: pára e esquece
export function stop() {
  audio?.pause();
  state.record = null;
  state.index = 0;
  state.playing = false;
  emit('stop');
}

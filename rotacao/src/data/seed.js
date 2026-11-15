import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';
import { addDays, today } from '../utils/dates.js';
import { RECORDS } from './records.js';

const itunes = JSON.parse(readFileSync(new URL('./itunes.json', import.meta.url), 'utf8'));

// Contas de demonstração: a palavra-passe é igual para todas
const passwordHash = bcrypt.hashSync('rotacao1', 10);
const now = today();
const at = (days) => new Date(`${addDays(now, days)}T15:00:00Z`).toISOString();

export const users = [
  { id: 'u-cliente', name: 'Marta Salgueiro', email: 'cliente@rotacao.pt', phone: '912 345 678', address: 'Rua dos Anjos 12, 3.º esq.', postalCode: '1150-037', city: 'Lisboa', role: 'cliente', passwordHash, createdAt: at(-120) },
  { id: 'u-musico', name: 'Rui Fonseca', email: 'musico@rotacao.pt', phone: '934 222 111', address: '', postalCode: '', city: 'Lisboa', band: 'Os Fósforos', role: 'cliente', passwordHash, createdAt: at(-60) },
  { id: 'u-staff', name: 'Joana Reis', email: 'staff@rotacao.pt', phone: '', address: '', postalCode: '', city: '', role: 'staff', passwordHash, createdAt: at(-400) },
  { id: 'u-admin', name: 'Duarte Vaz', email: 'admin@rotacao.pt', phone: '', address: '', postalCode: '', city: '', role: 'admin', passwordHash, createdAt: at(-900) },
];

// Cada faixa pode ter um ficheiro completo (`full`) com licença da loja; sem ele só há a pré-escuta
export const records = RECORDS.map(({ itunesId, ...record }) => {
  const info = itunes[itunesId];
  return {
    ...record,
    itunesId,
    artwork: info.artwork,
    appleUrl: info.appleUrl,
    tracks: info.tracks.map((t) => ({ ...t, full: null })),
    createdAt: `${record.arrivedAt}T10:00:00.000Z`,
  };
});

const line = (id, quantity = 1) => {
  const r = records.find((x) => x.id === id);
  return { recordId: r.id, title: r.title, artist: r.artist, price: r.price, quantity };
};

const order = (id, number, userId, items, status, days, method = 'envio') => {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = method === 'envio' && subtotal < 80 ? 4.9 : 0;
  return { id, number, userId, items, subtotal, shipping, total: subtotal + shipping, method, status, address: method === 'envio' ? 'Rua dos Anjos 12, 3.º esq., 1150-037 Lisboa' : '', notes: '', createdAt: at(days) };
};

export const orders = [
  order('o-1041', 1041, 'u-cliente', [line('kind-of-blue'), line('cantigas-do-maio')], 'entregue', -34),
  order('o-1057', 1057, 'u-cliente', [line('elis-e-tom')], 'entregue', -12, 'loja'),
  order('o-1063', 1063, 'u-cliente', [line('back-to-black')], 'enviada', -2),
  order('o-1064', 1064, 'u-musico', [line('discovery'), line('mezzanine')], 'paga', -1),
];

export const rooms = [
  {
    id: 'grave', name: 'Sala Grave', size: 22, capacity: 6, price: 16, knobs: ['GUIT', 'BAIXO', 'PA'],
    gear: ['Bateria Gretsch', '2 × Marshall JCM800', 'Baixo Ampeg SVT', 'PA de 1000 W', '4 microfones'],
    note: 'A maior, com a bateria a sério. Cabe uma banda de seis.',
  },
  {
    id: 'media', name: 'Sala Média', size: 16, capacity: 5, price: 14, knobs: ['GUIT', 'TECL', 'PA'],
    gear: ['Bateria Yamaha', 'Fender Twin Reverb', 'Orange 4×12', 'PA de 600 W', 'Teclado Nord'],
    note: 'A preferida para ensaios de quarteto e para quem traz teclas.',
  },
  {
    id: 'aguda', name: 'Sala Aguda', size: 9, capacity: 3, price: 9, knobs: ['VOZ', 'PIANO', 'REV'],
    gear: ['Piano de parede', '2 guitarras acústicas', 'Microfone de voz Neumann', 'Interface para demos'],
    note: 'Pequena e seca. Para voz, acústicos e gravar maquetas.',
  },
];

// Marcações dos próximos dias, para a mesa de mistura não aparecer vazia
const plan = [
  ['grave', 0, 12, 2, 'Lume Brando'], ['grave', 0, 17, 4, 'Ruído Rosa'], ['media', 0, 14, 2, 'Trio Alfama'], ['media', 0, 18, 1, 'Ana Sal'], ['aguda', 0, 10, 3, 'Coro da Graça'], ['aguda', 0, 19, 2, 'Tomás Vaz'],
  ['grave', 1, 20, 3, 'Os Fósforos', 'u-musico'], ['media', 1, 16, 2, 'Lume Brando'], ['aguda', 1, 11, 2, 'Rita Lobo'],
  ['grave', 2, 15, 2, 'Banda Sal'], ['media', 2, 19, 3, 'Ruído Rosa'], ['aguda', 2, 18, 2, 'Pó de Arroz'],
  ['grave', 3, 21, 3, 'Kuduro Fantasma'], ['media', 3, 12, 2, 'Trio Alfama'], ['aguda', 3, 10, 2, 'Coro da Graça'],
  ['grave', 4, 18, 4, 'Os Fósforos', 'u-musico'], ['media', 4, 20, 2, 'Ana Sal'], ['aguda', 4, 15, 3, 'Tomás Vaz'],
  ['grave', 5, 14, 3, 'Banda Sal'], ['grave', 5, 19, 3, 'Ruído Rosa'], ['media', 5, 11, 4, 'Lume Brando'],
  ['media', 6, 17, 2, 'Pó de Arroz'], ['aguda', 6, 12, 2, 'Rita Lobo'],
];

export const bookings = plan.map(([roomId, day, start, hours, band, userId = null], i) => {
  const room = rooms.find((r) => r.id === roomId);
  return { id: `b-${i + 1}`, roomId, userId, band, date: addDays(now, day), start, hours, extras: [], total: room.price * hours, status: 'confirmada', createdAt: at(day - 3) };
});

export const wants = [
  { id: 'w-1', userId: 'u-musico', name: 'Rui', artist: 'Sérgio Godinho', title: 'Pré-Histórias', minGrade: 'VG', maxPrice: 40, note: '1.ª edição, se possível', status: 'aberto', createdAt: at(-90) },
  { id: 'w-2', userId: 'u-cliente', name: 'Marta', artist: 'Amália Rodrigues', title: 'Busto', minGrade: 'VG+', maxPrice: 60, note: 'Capa aberta', status: 'aberto', createdAt: at(-40) },
  { id: 'w-3', userId: null, name: 'Joana', artist: 'Chet Baker', title: 'Chet Baker Sings', minGrade: 'VG', maxPrice: 45, note: '', status: 'encontrado', recordId: 'chet-baker-sings', holdUntil: new Date(Date.now() + 30 * 3600 * 1000).toISOString(), createdAt: at(-70) },
  { id: 'w-4', userId: null, name: 'Tiago', artist: 'Kraftwerk', title: 'Autobahn', minGrade: 'VG', maxPrice: 35, note: 'Qualquer prensagem', status: 'aberto', createdAt: at(-25) },
  { id: 'w-5', userId: null, name: 'Bruno', artist: 'Tom Waits', title: 'Rain Dogs', minGrade: 'VG+', maxPrice: 45, note: '', status: 'aberto', createdAt: at(-18) },
  { id: 'w-6', userId: null, name: 'Sr. Albano', artist: 'Vários', title: 'Fado de Coimbra, anos 50', minGrade: 'VG', maxPrice: 30, note: 'Discos de 78 também servem', status: 'aberto', createdAt: at(-12) },
  { id: 'w-7', userId: null, name: 'Inês', artist: 'Nina Simone', title: 'Pastel Blues', minGrade: 'NM', maxPrice: 40, note: '', status: 'aberto', createdAt: at(-5) },
];

export const offers = [
  { id: 'a-1', name: 'Helena Matos', email: 'helena@exemplo.pt', phone: '916 000 111', count: '200 a 500', genres: 'Jazz, MPB, fado', method: 'casa', area: 'Almada', notes: 'Discos do meu pai, guardados num armário desde os anos 90.', status: 'nova', createdAt: at(-1) },
  { id: 'a-2', name: 'Pedro Lino', email: 'pedro@exemplo.pt', phone: '', count: 'Menos de 50', genres: 'Rock dos anos 70', method: 'loja', area: 'Lisboa', notes: '', status: 'marcada', date: addDays(now, 2), createdAt: at(-4) },
];

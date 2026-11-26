// Dados de exemplo, todos inventados. As datas são calculadas a partir de hoje para a demonstração estar sempre viva.
import bcrypt from 'bcryptjs';
import { addDays, nextWeekend, today } from '../utils/dates.js';
import { ROOM_TYPES, ROOMS } from '../config/site.js';

const t = today();
const { checkIn: F } = nextWeekend(t);
const hash = (p) => bcrypt.hashSync(p, 10);
const priceOf = (num) => ROOM_TYPES.find((type) => type.rooms.includes(num)).price;

const extraGuests = [
  ['u-tiago', 'Tiago Mendes'],
  ['u-sofia', 'Sofia Ramos'],
  ['u-pedro', 'Pedro Alves'],
  ['u-ana', 'Ana Duarte'],
  ['u-helena', 'Helena Brito'],
  ['u-jonas', 'Jonas Weber'],
  ['u-claire', 'Claire Martin'],
  ['u-rita', 'Rita Sousa'],
];

export const users = [
  { id: 'u-rececao', name: 'Carla Vidal', email: 'rececao@arriba.exemplo', role: 'rececao', active: true, passwordHash: hash('arriba-rececao-2026') },
  { id: 'u-ines', name: 'Inês Correia', email: 'hospede@arriba.exemplo', phone: '+351 910 000 001', role: 'hospede', active: true, passwordHash: hash('arriba-hospede-2026') },
  ...extraGuests.map(([id, name], i) => ({
    id,
    name,
    email: `${id.slice(2)}@hospede.exemplo`,
    phone: `+351 910 000 0${10 + i}`,
    role: 'hospede',
    active: true,
    passwordHash: hash(`conta-de-exemplo-${i}`),
  })),
];

let n = 4800;
function booking(userId, room, from, nightsCount, status, extra = {}) {
  n += 1;
  return {
    id: `r-${n}`,
    code: `ARR-${n}`,
    userId,
    guestName: users.find((u) => u.id === userId).name,
    room,
    type: ROOMS.find((r) => r.num === room).type,
    checkIn: from,
    checkOut: addDays(from, nightsCount),
    guests: 2,
    nights: nightsCount,
    total: nightsCount * priceOf(room),
    status,
    arrivalTime: '17:00',
    notes: '',
    createdAt: new Date(Date.now() - (40 - (n % 20)) * 86400000).toISOString(),
    ...extra,
  };
}

export const reservations = [
  // Já cá estão, ou chegam e saem hoje
  booking('u-tiago', '01', addDays(t, -3), 3, 'em-casa', { arrivalTime: '18:30' }),
  booking('u-sofia', '04', addDays(t, -2), 3, 'em-casa'),
  booking('u-pedro', '09', addDays(t, -1), 2, 'em-casa', { notes: 'Trazemos um cão pequeno.' }),
  booking('u-ana', '13', t, 1, 'confirmada', { arrivalTime: '21:00', notes: 'Chegamos tarde, depois do jantar.' }),
  // O próximo fim de semana: seis quartos ocupados, oito chaves no quadro
  booking('u-helena', '05', F, 2, 'confirmada'),
  booking('u-jonas', '06', F, 3, 'confirmada', { guests: 1 }),
  booking('u-claire', '08', addDays(F, -1), 3, 'confirmada', { guests: 3 }),
  booking('u-rita', '10', F, 2, 'confirmada'),
  booking('u-tiago', '12', F, 2, 'confirmada'),
  booking('u-sofia', '14', addDays(F, -2), 4, 'confirmada'),
  // Reservas da conta de demonstração do hóspede
  booking('u-ines', '03', addDays(F, 14), 3, 'confirmada', { arrivalTime: '16:00', notes: 'É o nosso aniversário de casamento.' }),
  booking('u-ines', '11', addDays(t, -60), 3, 'terminada'),
  // Mais adiante
  booking('u-pedro', '02', addDays(F, 7), 2, 'confirmada'),
  booking('u-helena', '07', addDays(F, 21), 5, 'confirmada', { guests: 3 }),
  booking('u-rita', '04', addDays(t, -12), 2, 'cancelada'),
];

const byCode = (code) => reservations.find((r) => r.code === code);
const request = (idx, code, kind, date, notes, status) => ({ id: `q-${idx}`, reservationId: byCode(code).id, userId: byCode(code).userId, kind, date, notes, status, createdAt: new Date().toISOString() });

export const requests = [
  request(1, 'ARR-4803', 'bicicletas', addDays(t, 1), 'Duas bicicletas, de manhã.', 'pendente'),
  request(2, 'ARR-4802', 'massagem', t, 'Ao fim da tarde, se possível.', 'pendente'),
  request(3, 'ARR-4801', 'lancheira', addDays(t, -1), '', 'feito'),
  request(4, 'ARR-4811', 'jantar', addDays(F, 14), 'Mesa à janela para dois, às 20h30.', 'pendente'),
];

export const menus = [
  {
    id: 'm-1',
    date: t,
    items: [
      { name: 'Percebes da costa vicentina', detail: 'Cozidos em água do mar, limão', price: 18 },
      { name: 'Carapau alimado', detail: 'Cebola roxa, pimento assado, coentros', price: 11 },
      { name: 'Polvo à lagareiro', detail: 'Batata a murro, azeite de Monchique', price: 24 },
      { name: 'Medronho com figo', detail: 'Gelado de figo, crumble de amêndoa', price: 8 },
    ],
  },
];

export const prices = ROOM_TYPES.map((type) => ({ id: type.slug, price: type.price }));

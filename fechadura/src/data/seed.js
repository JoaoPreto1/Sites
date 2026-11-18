import bcrypt from 'bcryptjs';
import { VENUE } from '../config/venue.js';
import { groupPrice } from '../../public/js/shared/pricing.js';
import { addDays, lisbonToday, weekday } from '../utils/dates.js';

const hash = (password) => bcrypt.hashSync(password, 10);

export const rooms = [
  {
    id: 'r-banco',
    slug: 'banco-rua-das-flores',
    name: 'O Banco da Rua das Flores',
    short: 'O Banco',
    caseNo: '01',
    year: '1932',
    tagline: 'Um cofre que ninguém abriu desde a falência.',
    story: [
      'Em março de 1932, o Banco Comercial da Rua das Flores fechou as portas de um dia para o outro. O gerente, o senhor Abílio Seixas, desapareceu na mesma noite. O cofre ficou trancado, com tudo lá dentro.',
      'Noventa anos depois, a cave do banco foi encontrada tal como ficou: secretárias, livros de contas, um telefone de manivela e um cofre de porta redonda. O senhor Seixas deixou mais pistas do que devia.',
      'Têm uma hora para descobrir a combinação antes de o segurança da noite fazer a ronda.',
    ],
    players: { min: 2, max: 6 },
    difficulty: 3,
    minAge: 12,
    duration: 60,
    escapeRate: 41,
    accessible: true,
    status: 'aberta',
    color: '#c9a24a',
    photos: [
      { id: '1582139329536-e7284fece509', alt: 'Porta redonda de um cofre de banco antigo, em aço' },
      { id: '1462045504115-6c1d931f07d1', alt: 'Parede de cofres de depósito numerados' },
      { id: '1609587415882-97552f39c6c2', alt: 'Chaves antigas em cima de uma mesa de madeira' },
    ],
    clues: ['Livros de contas', 'Telefone de manivela', 'Cofre de combinação', 'Código Morse'],
  },
  {
    id: 'r-farol',
    slug: 'farol-apagado',
    name: 'O Farol Apagado',
    short: 'O Farol',
    caseNo: '02',
    year: '1958',
    tagline: 'A luz apagou-se à meia-noite. O faroleiro desapareceu.',
    story: [
      'Na noite de 14 de dezembro de 1958, o farol da Boa Nova apagou-se pela primeira vez em trinta anos. Um navio de pesca esteve quase a bater nas rochas.',
      'Na manhã seguinte, o faroleiro Ventura já lá não estava. Ficou o livro de registos, um rádio ligado e uma lâmpada partida.',
      'A tempestade está a chegar. Têm uma hora para voltar a acender a luz e perceber o que aconteceu ao Ventura.',
    ],
    players: { min: 2, max: 5 },
    difficulty: 4,
    minAge: 14,
    duration: 60,
    escapeRate: 29,
    accessible: false,
    status: 'aberta',
    color: '#4b7fa8',
    photos: [
      { id: '1761901364448-98d25941332e', alt: 'Farol aceso numa costa de rochas, de noite' },
      { id: '1610029795220-e5afca4dc7ba', alt: 'Farol debaixo de um céu cheio de estrelas' },
      { id: '1560346731-e3a7cc3bb8f1', alt: 'Farol fotografado a preto e branco' },
    ],
    clues: ['Livro de registos', 'Rádio de ondas curtas', 'Mapas náuticos', 'Escada em caracol'],
  },
  {
    id: 'r-quarto',
    slug: 'quarto-207',
    name: 'Quarto 207',
    short: 'Quarto 207',
    caseNo: '03',
    year: '1974',
    tagline: 'Uma chave que não abre nada e um elevador que só pára no segundo andar.',
    story: [
      'O Grande Hotel do Bolhão fechou em 1974 com um hóspede ainda registado no quarto 207. Nunca fez o check-out.',
      'A rececionista jura que o elevador continua a parar no segundo andar todas as noites, à mesma hora. A chave do 207 está pendurada no quadro, mas não abre a porta do quarto.',
      'É a sala mais difícil da casa. Recomendamos a quem já fez pelo menos duas escape rooms.',
    ],
    players: { min: 3, max: 6 },
    difficulty: 5,
    minAge: 16,
    duration: 75,
    escapeRate: 18,
    accessible: false,
    status: 'aberta',
    color: '#8a2a22',
    photos: [
      { id: '1763142106375-fb47c275ed45', alt: 'Corredor escuro de hotel com duas portas e candeeiros de parede' },
      { id: '1762779943673-fcb177e7fe56', alt: 'Corredor comprido de hotel com tapete vermelho' },
      { id: '1584985429926-08867327d3a6', alt: 'Chave antiga de metal' },
    ],
    clues: ['Livro de hóspedes', 'Elevador antigo', 'Quadro das chaves', 'Gira-discos'],
  },
  {
    id: 'r-cave',
    slug: 'cave-da-avo',
    name: 'A Cave da Avó',
    short: 'A Cave',
    caseNo: '04',
    year: 'hoje',
    tagline: 'Compotas, enigmas e um gato. Para estrear, a partir dos 8 anos.',
    story: [
      'A avó Lurdes guardou a receita do doce de abóbora numa caixa com quatro cadeados. Morreu de velhice e de teimosia, sem dizer a ninguém os códigos.',
      'A cave está como ela a deixou: prateleiras de frascos, um rádio, uma máquina de costura e o gato Tareco, que sabe mais do que parece.',
      'É a sala certa para quem nunca fez uma escape room e para famílias com crianças a partir dos 8 anos, sempre com um adulto.',
    ],
    players: { min: 2, max: 6 },
    difficulty: 1,
    minAge: 8,
    duration: 60,
    escapeRate: 74,
    accessible: true,
    status: 'nova',
    color: '#3f6b3a',
    photos: [
      { id: '1576325782957-363cfe40a6d6', alt: 'Frascos de compota numa prateleira de madeira' },
      { id: '1582840803949-474387fd70a3', alt: 'Frascos de vidro de vários tamanhos numa prateleira' },
      { id: '1645047573426-8d013c071193', alt: 'Cadeado antigo numa porta de madeira' },
    ],
    clues: ['Frascos com etiquetas', 'Máquina de costura', 'Caixa de quatro cadeados', 'Um gato'],
  },
];

export const users = [
  { id: 'u-admin', name: 'Marco Teixeira', email: 'admin@fechadura.pt', phone: VENUE.phone, role: 'admin', passwordHash: hash('fechadura123') },
  { id: 'u-rita', name: 'Rita Moreira', email: 'cliente@fechadura.pt', phone: '912 345 678', role: 'cliente', passwordHash: hash('fechadura123') },
];

const TEAMS = [
  'Os Primos Silva', 'Equipa Gaveta', 'Despedida da Rita', 'Turma 12.º B', 'Os Sem Pista', 'Família Antunes', 'Contabilidade Lda.',
  'As Chaves Perdidas', 'Quarteto Fantasma', 'Os do Costume', 'Erasmus Porto', 'Tio Zé e Sobrinhos', 'Equipa Tareco', 'Vizinhos do 3.º',
  'Os Arrombadores', 'Clube do Livro', 'Escuteiros 412', 'Turno da Noite', 'Os Trancados', 'Aniversário do Duarte',
];

// Dados de exemplo calculados a partir de hoje, para o site ter sempre reservas e fugas recentes
let seq = 1;
const code = (n) => `FX-${(n * 7919).toString(36).toUpperCase().padStart(4, '0').slice(-4)}`;
const today = lisbonToday();
const slotsFor = (date) => (weekday(date) === 0 || weekday(date) === 6 ? VENUE.slots.weekend : VENUE.slots.weekday);

function booking({ room, date, time, players, team, name, email, userId = null, status = 'confirmada', result = null }) {
  const n = seq++;
  return {
    id: `b-${n}`,
    code: code(n),
    roomId: room.id,
    date,
    time,
    players,
    team,
    name,
    email,
    phone: '',
    userId,
    total: groupPrice(players).total,
    status,
    result,
    createdAt: `${addDays(date, -6)}T10:00:00.000Z`,
  };
}

function pastBookings() {
  const list = [];
  for (let d = 60; d >= 1; d--) {
    const date = addDays(today, -d);
    if (VENUE.closedWeekdays.includes(weekday(date))) continue;
    slotsFor(date).forEach((time, i) => {
      rooms.forEach((room, r) => {
        const k = d * 31 + i * 7 + r * 13;
        if (k % 5 > 1) return;
        const players = Math.max(room.players.min, 2 + (k % 5));
        const escaped = (k % 100) < room.escapeRate + 12;
        const seconds = escaped ? (room.duration - 22) * 60 + ((k * 37) % (20 * 60)) : room.duration * 60;
        const team = TEAMS[(d * 5 + i * 3 + r * 7) % TEAMS.length];
        list.push(booking({ room, date, time, players: Math.min(players, room.players.max), team, name: team, email: `reservas+${k}@exemplo.pt`, status: 'jogada', result: { escaped, seconds, hints: k % 4 } }));
      });
    });
  }
  return list;
}

function futureBookings() {
  const list = [];
  for (let d = 0; d <= 14; d++) {
    const date = addDays(today, d);
    if (VENUE.closedWeekdays.includes(weekday(date))) continue;
    slotsFor(date).forEach((time, i) => {
      rooms.forEach((room, r) => {
        const k = d * 17 + i * 5 + r * 11;
        if (k % 3 !== 0 && !(weekday(date) === 6 && k % 2 === 0)) return;
        const team = TEAMS[(k + 3) % TEAMS.length];
        list.push(booking({ room, date, time, players: Math.min(room.players.max, Math.max(room.players.min, 3 + (k % 3))), team, name: team, email: `reservas+${k}@exemplo.pt` }));
      });
    });
  }
  return list;
}

const ritaPast = [
  booking({ room: rooms[3], date: addDays(today, -52), time: '16:00', players: 4, team: 'Os Moreira', name: 'Rita Moreira', email: 'cliente@fechadura.pt', userId: 'u-rita', status: 'jogada', result: { escaped: true, seconds: 41 * 60 + 7, hints: 1 } }),
  booking({ room: rooms[0], date: addDays(today, -17), time: '20:30', players: 5, team: 'Os Moreira', name: 'Rita Moreira', email: 'cliente@fechadura.pt', userId: 'u-rita', status: 'jogada', result: { escaped: true, seconds: 53 * 60 + 40, hints: 3 } }),
];

const nextSaturday = (() => {
  let d = addDays(today, 1);
  while (weekday(d) !== 6) d = addDays(d, 1);
  return d;
})();

const ritaNext = booking({ room: rooms[1], date: nextSaturday, time: '20:30', players: 4, team: 'Os Moreira', name: 'Rita Moreira', email: 'cliente@fechadura.pt', userId: 'u-rita' });

export const bookings = [...pastBookings(), ...ritaPast, ...futureBookings().filter((b) => !(b.date === ritaNext.date && b.time === ritaNext.time && b.roomId === ritaNext.roomId)), ritaNext];

export const blocks = [
  { id: 'k-1', roomId: 'r-quarto', date: addDays(today, 2), time: null, reason: 'Manutenção do elevador' },
];

export const vouchers = [
  {
    id: 'v-1',
    code: 'CHAVE-4K7Q',
    players: 4,
    roomId: null,
    amount: groupPrice(4).total,
    from: 'Rita',
    to: 'Pai e Mãe',
    message: 'Para os 35 anos de casados. Vejam se conseguem sair juntos de um sítio fechado sem discutir.',
    buyerName: 'Rita Moreira',
    buyerEmail: 'cliente@fechadura.pt',
    userId: 'u-rita',
    status: 'ativo',
    validUntil: addDays(today, 300),
    createdAt: `${addDays(today, -20)}T15:00:00.000Z`,
  },
  {
    id: 'v-2',
    code: 'CHAVE-9TQ2',
    players: 6,
    roomId: 'r-cave',
    amount: groupPrice(6).total,
    from: 'Avó Isabel',
    to: 'Netos',
    message: 'Para as férias do Natal.',
    buyerName: 'Isabel Carvalho',
    buyerEmail: 'isabel.c@exemplo.pt',
    userId: null,
    status: 'por pagar',
    validUntil: addDays(today, 365),
    createdAt: `${addDays(today, -1)}T19:20:00.000Z`,
  },
];

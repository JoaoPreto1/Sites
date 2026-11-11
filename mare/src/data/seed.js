import bcrypt from 'bcryptjs';
import { addDays, today } from '../utils/dates.js';
import { quoteStay } from '../services/pricing.js';

const photo = (id) => `https://images.unsplash.com/photo-${id}`;
const demoPassword = bcrypt.hashSync('mare1234', 10);
const now = today();

export const users = [
  { id: 'u-admin', name: 'Administração Maré', email: 'admin@mare.pt', role: 'admin', phone: '+351 282 000 000' },
  { id: 'u-rita', name: 'Rita Mendes', email: 'dono@mare.pt', role: 'proprietario', phone: '+351 912 000 001' },
  { id: 'u-ines', name: 'Inês Duarte', email: 'hospede@mare.pt', role: 'hospede', phone: '+351 913 000 002' },
  { id: 'u-tom', name: 'Tom Baker', email: 'tom@example.com', role: 'hospede', phone: '+44 7700 900123' },
].map((user) => ({ ...user, passwordHash: demoPassword, createdAt: '2026-01-10T10:00:00.000Z' }));

const seasons = (high, mid) => [
  { name: 'Época alta', from: '07-01', to: '08-31', price: high },
  { name: 'Época média', from: '06-01', to: '06-30', price: mid },
  { name: 'Época média', from: '09-01', to: '09-30', price: mid },
];

const commonAmenities = ['Wi-Fi rápido', 'Ar condicionado', 'Cozinha equipada', 'Roupa de cama e toalhas', 'Máquina de café'];

export const properties = [
  {
    id: 'p-farol',
    slug: 'casa-farol',
    name: 'Casa Farol',
    tagline: 'Acordar com o mar à janela',
    area: 'Ponta da Piedade',
    nearby: [
      { place: 'Farol da Ponta da Piedade', distance: '5 min a pé' },
      { place: 'Praia do Camilo', distance: '8 min a pé' },
      { place: 'Centro de Lagos', distance: '5 min de carro' },
    ],
    description:
      'Uma casa térrea virada a sul, a cinco minutos a pé do farol da Ponta da Piedade. A sala abre-se para um terraço com vista para o mar, perfeito para o pequeno-almoço ao sol ou para um copo de vinho ao fim do dia. Os dois quartos têm casa de banho própria.',
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    size: 95,
    pricePerNight: 145,
    cleaningFee: 60,
    minNights: 3,
    seasons: seasons(220, 175),
    tags: ['vista-mar', 'casais'],
    amenities: [...commonAmenities, 'Terraço com vista mar', 'Estacionamento privado', 'Churrasqueira'],
    images: [
      photo('1557122764-dc9f8447fafb'),
      photo('1705095605806-4b2936e90471'),
      photo('1583847268964-b28dc8f51f92'),
      photo('1774311237295-a65a4c1ff38a'),
      photo('1773579305267-8d75e0af5be4'),
    ],
    rating: 4.96,
    reviews: [
      { author: 'Marta S.', from: 'Lisboa', rating: 5, date: '2026-08', text: 'O terraço é ainda melhor do que nas fotos. A Rita foi impecável e deixou-nos dicas de praias que nunca teríamos encontrado.' },
      { author: 'Julien P.', from: 'Lyon', rating: 5, date: '2026-06', text: 'Calme, propre, vue incroyable. On reviendra sans hésiter.' },
      { author: 'Carlos e Ana', from: 'Porto', rating: 4.9, date: '2026-05', text: 'Casa muito confortável e bem equipada. Fomos a pé ao farol todos os dias ao pôr do sol.' },
    ],
    ownerId: 'u-rita',
    active: true,
  },
  {
    id: 'p-azulejo',
    slug: 'casa-azulejo',
    name: 'Casa Azulejo',
    tagline: 'Uma casa antiga cheia de cor, no centro histórico',
    area: 'Centro histórico',
    nearby: [
      { place: 'Praça do Infante', distance: '2 min a pé' },
      { place: 'Praia da Batata', distance: '10 min a pé' },
      { place: 'Mercado de Lagos', distance: '5 min a pé' },
    ],
    description:
      'Casa tradicional recuperada dentro das muralhas, com azulejos originais, tetos altos e um pátio interior com laranjeira. Fica a dois minutos da Praça do Infante e a dez da praia da Batata. Ideal para famílias: há berço, cadeira de bebé e jogos para os mais novos.',
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    size: 140,
    pricePerNight: 180,
    cleaningFee: 75,
    minNights: 3,
    seasons: seasons(260, 210),
    tags: ['familias'],
    amenities: [...commonAmenities, 'Pátio interior', 'Berço e cadeira de bebé', 'Máquina de lavar roupa'],
    images: [
      photo('1667125095636-dce94dcbdd96'),
      photo('1618220179428-22790b461013'),
      photo('1628797285815-453c1d0d21e3'),
      photo('1612152605347-f93296cb657d'),
      photo('1716667282987-c03452d43181'),
    ],
    rating: 4.91,
    reviews: [
      { author: 'Família Rocha', from: 'Braga', rating: 5, date: '2026-07', text: 'Os miúdos adoraram o pátio. Tudo perto a pé, nem tirámos o carro da garagem.' },
      { author: 'Hannah K.', from: 'Berlim', rating: 4.8, date: '2026-04', text: 'Beautiful old house with so much character. Great location in the old town.' },
    ],
    ownerId: 'u-rita',
    active: true,
  },
  {
    id: 'p-cal',
    slug: 'estudio-cal',
    name: 'Estúdio Cal',
    tagline: 'Pequeno, luminoso e feito para dois',
    area: 'Rua da Barroca',
    nearby: [
      { place: 'Restaurantes e bares', distance: 'à porta' },
      { place: 'Praia do Pinhão', distance: '10 min a pé' },
      { place: 'Marina de Lagos', distance: '12 min a pé' },
    ],
    description:
      'Um estúdio branco e simples, com cama de casal, pequena cozinha e um banco de alvenaria junto à janela. Fica numa das ruas mais bonitas de Lagos, com restaurantes e bares à porta, e a praia do Pinhão a dez minutos a pé.',
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    size: 38,
    pricePerNight: 95,
    cleaningFee: 35,
    minNights: 2,
    seasons: seasons(140, 115),
    tags: ['casais'],
    amenities: [...commonAmenities, 'Secretária para trabalhar', 'Persianas blackout'],
    images: [
      photo('1790419683322-b08a7050c424'),
      photo('1617048400527-e6ab223281e1'),
      photo('1499916078039-922301b0eb9b'),
      photo('1781344334947-60c704bafd51'),
    ],
    rating: 5,
    reviews: [
      { author: 'Sofia e Pedro', from: 'Coimbra', rating: 5, date: '2026-09', text: 'Pequenino mas com tudo o que é preciso. A localização é perfeita.' },
      { author: 'Lucas M.', from: 'São Paulo', rating: 5, date: '2026-03', text: 'Trabalhei daqui uma semana inteira, internet ótima e o silêncio à noite surpreendeu.' },
    ],
    ownerId: 'u-rita',
    active: true,
  },
  {
    id: 'p-barlavento',
    slug: 'vila-barlavento',
    name: 'Vila Barlavento',
    tagline: 'Piscina privada para a família inteira',
    area: 'Porto de Mós',
    nearby: [
      { place: 'Praia de Porto de Mós', distance: '6 min a pé' },
      { place: 'Supermercado', distance: '3 min de carro' },
      { place: 'Centro de Lagos', distance: '7 min de carro' },
    ],
    description:
      'Moradia com quatro quartos, piscina privada e jardim, numa zona tranquila acima da praia de Porto de Mós. A sala e a cozinha abrem-se para o alpendre e para a piscina. Há espaço para oito pessoas e ainda sobra lugar para o churrasco.',
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    size: 220,
    pricePerNight: 320,
    cleaningFee: 120,
    minNights: 5,
    seasons: seasons(480, 390),
    tags: ['piscina', 'familias'],
    amenities: [...commonAmenities, 'Piscina privada', 'Jardim', 'Churrasqueira', 'Estacionamento para 2 carros', 'Máquina de lavar loiça'],
    images: [
      photo('1596178067639-5c6e68aea6dc'),
      photo('1651108066220-f61c22fc281f'),
      photo('1786051376076-9ff627bcdcba'),
      photo('1725905803121-dd123b058a5c'),
      photo('1771611186938-39a6b934f2f6'),
    ],
    rating: 4.88,
    reviews: [
      { author: 'Grupo dos Amigos', from: 'Leiria', rating: 4.9, date: '2026-08', text: 'Piscina sempre limpa, casa enorme e muito bem decorada. Ficámos dez dias e soube a pouco.' },
      { author: 'Emma W.', from: 'Londres', rating: 4.8, date: '2026-07', text: 'Perfect for our family holiday. Short drive to the beach and the town.' },
    ],
    ownerId: 'u-rita',
    active: true,
  },
  {
    id: 'p-patio',
    slug: 'casa-do-patio',
    name: 'Casa do Pátio',
    tagline: 'Sombra, piscina e silêncio na Luz',
    area: 'Praia da Luz',
    nearby: [
      { place: 'Praia da Luz', distance: '600 m' },
      { place: 'Cafés e esplanadas', distance: '5 min a pé' },
      { place: 'Centro de Lagos', distance: '10 min de carro' },
    ],
    description:
      'Casa de dois quartos com um pátio coberto de buganvílias e uma piscina partilhada só com mais uma casa. A praia da Luz fica a 600 metros, com cafés e esplanadas pelo caminho.',
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    size: 80,
    pricePerNight: 160,
    cleaningFee: 55,
    minNights: 3,
    seasons: seasons(235, 190),
    tags: ['piscina', 'casais'],
    amenities: [...commonAmenities, 'Piscina partilhada', 'Pátio com sombra', 'Bicicletas'],
    images: [
      photo('1720161263981-84281892ee4b'),
      photo('1760067538559-49b2bfb5f42a'),
      photo('1757417983938-2c2a931d41aa'),
      photo('1628797279405-8cd6ffdbeb6c'),
    ],
    rating: 4.93,
    reviews: [
      { author: 'Rui T.', from: 'Évora', rating: 5, date: '2026-09', text: 'O pátio é um sossego. Usámos as bicicletas todos os dias para ir à praia.' },
    ],
    ownerId: 'u-rita',
    active: true,
  },
  {
    id: 'p-ponta',
    slug: 'refugio-da-ponta',
    name: 'Refúgio da Ponta',
    tagline: 'Por cima da praia do Camilo',
    area: 'Praia do Camilo',
    nearby: [
      { place: 'Praia do Camilo', distance: '3 min a pé' },
      { place: 'Ponta da Piedade', distance: '10 min a pé' },
      { place: 'Centro de Lagos', distance: '6 min de carro' },
    ],
    description:
      'Casa de três quartos com janelas de chão ao teto sobre o Atlântico. Desce-se à praia do Camilo pelos famosos 200 degraus. Tem uma sala ampla, lareira para as noites de inverno e uma varanda onde se vê o pôr do sol todos os dias.',
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    size: 130,
    pricePerNight: 210,
    cleaningFee: 80,
    minNights: 4,
    seasons: seasons(320, 260),
    tags: ['vista-mar', 'familias'],
    amenities: [...commonAmenities, 'Varanda com vista mar', 'Lareira', 'Smart TV', 'Estacionamento privado'],
    images: [
      photo('1635690280190-0eec6bc587fd'),
      photo('1695259496167-c05f25f1d793'),
      photo('1631679706909-1844bbd07221'),
      photo('1694350639569-6706d403a30d'),
      photo('1584622650111-993a426fbf0a'),
    ],
    rating: 4.97,
    reviews: [
      { author: 'Beatriz L.', from: 'Lisboa', rating: 5, date: '2026-10', text: 'A vista da sala é de cortar a respiração. Já reservámos outra vez para o próximo ano.' },
      { author: 'Mark & Jo', from: 'Dublin', rating: 4.9, date: '2026-06', text: 'Stunning house. The sunsets from the balcony were the highlight of our trip.' },
    ],
    ownerId: 'u-rita',
    active: true,
  },
];

export const experiences = [
  {
    id: 'e-grutas',
    slug: 'barco-grutas',
    name: 'Passeio de barco às grutas',
    summary: 'Uma hora e meia pelas grutas e arcos da Ponta da Piedade, num barco pequeno que entra onde os grandes não chegam.',
    duration: '1h30',
    price: 35,
    image: photo('1544946853-801555e27f3d'),
    category: 'Mar',
  },
  {
    id: 'e-kayak',
    slug: 'kayak-ponta-piedade',
    name: 'Kayak na Ponta da Piedade',
    summary: 'Remar entre falésias douradas com um guia local, com paragem numa praia só acessível pelo mar.',
    duration: '2h30',
    price: 45,
    image: photo('1631219303551-ef2fa4f4b6f0'),
    category: 'Mar',
  },
  {
    id: 'e-surf',
    slug: 'aula-surf',
    name: 'Aula de surf',
    summary: 'Aula para iniciantes na Meia Praia, com prancha, fato e instrutor certificado incluídos.',
    duration: '2h',
    price: 40,
    image: photo('1730564725670-11ce15658ac8'),
    category: 'Desporto',
  },
  {
    id: 'e-vinhos',
    slug: 'prova-vinhos',
    name: 'Prova de vinhos do Algarve',
    summary: 'Visita a uma quinta familiar perto de Lagos, com prova de cinco vinhos e petiscos regionais.',
    duration: '3h',
    price: 28,
    image: photo('1768497262022-2afdf6b1266f'),
    category: 'Gastronomia',
  },
  {
    id: 'e-veleiro',
    slug: 'veleiro-por-do-sol',
    name: 'Veleiro ao pôr do sol',
    summary: 'Duas horas à vela ao longo da costa, com espumante a bordo enquanto o sol se põe no mar.',
    duration: '2h',
    price: 55,
    image: photo('1526761122248-c31c93f8b2b9'),
    category: 'Mar',
  },
  {
    id: 'e-chef',
    slug: 'chef-em-casa',
    name: 'Chef em casa: cataplana',
    summary: 'Um chef vai à sua casa preparar uma cataplana de marisco e ensina-lhe os segredos do prato.',
    duration: '3h',
    price: 65,
    image: photo('1448043552756-e747b7a2b2b8'),
    category: 'Gastronomia',
  },
];

function booking({ code, propertyId, userId, checkIn, nights, adults, children = 0, extras = [], status, notes = '' }) {
  const property = properties.find((p) => p.id === propertyId);
  const user = users.find((u) => u.id === userId);
  const checkOut = addDays(checkIn, nights);
  const price = quoteStay(property, {
    checkIn,
    checkOut,
    adults,
    children,
    extras: extras.map(([experienceId, people]) => ({ experience: experiences.find((e) => e.id === experienceId), people })),
  });

  return {
    id: `b-${code}`,
    code,
    propertyId,
    userId,
    checkIn,
    checkOut,
    adults,
    children,
    extras: price.extras,
    price,
    status,
    guest: { name: user.name, email: user.email, phone: user.phone },
    notes,
    checkin: null,
    createdAt: new Date(`${addDays(checkIn, -30)}T12:00:00Z`).toISOString(),
  };
}

export const bookings = [
  booking({ code: 'MR-7K2Q9A', propertyId: 'p-farol', userId: 'u-ines', checkIn: addDays(now, 12), nights: 5, adults: 2, extras: [['e-grutas', 2]], status: 'confirmada', notes: 'Chegamos ao fim da tarde.' }),
  booking({ code: 'MR-3HF8LD', propertyId: 'p-cal', userId: 'u-ines', checkIn: addDays(now, -70), nights: 4, adults: 2, status: 'concluida' }),
  booking({ code: 'MR-9PZ4TE', propertyId: 'p-barlavento', userId: 'u-tom', checkIn: addDays(now, 4), nights: 7, adults: 4, children: 2, extras: [['e-surf', 3]], status: 'confirmada' }),
  booking({ code: 'MR-5WN1RC', propertyId: 'p-azulejo', userId: 'u-tom', checkIn: addDays(now, 38), nights: 6, adults: 2, children: 2, status: 'pendente' }),
  booking({ code: 'MR-2BX7VM', propertyId: 'p-ponta', userId: 'u-ines', checkIn: addDays(now, 60), nights: 4, adults: 4, status: 'pendente' }),
  booking({ code: 'MR-8QJ3NS', propertyId: 'p-ponta', userId: 'u-tom', checkIn: addDays(now, -20), nights: 5, adults: 2, status: 'concluida' }),
];

export const blocks = [
  { id: 'k-1', propertyId: 'p-patio', from: addDays(now, 20), to: addDays(now, 25), reason: 'Pintura da fachada', createdAt: new Date().toISOString() },
];

export const messages = [
  {
    id: 'm-1',
    name: 'Helena Costa',
    email: 'helena@example.com',
    subject: 'Grupo grande em setembro',
    message: 'Olá! Somos 10 pessoas e queríamos saber se é possível reservar a Vila Barlavento e o Estúdio Cal na mesma semana.',
    status: 'nova',
    createdAt: new Date().toISOString(),
  },
];

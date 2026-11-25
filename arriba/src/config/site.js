// Tudo o que aqui está é fictício: o hotel, as pessoas e os preços foram inventados para a demonstração.
// As fotografias são do Unsplash e pertencem aos seus autores.
export const SITE = {
  name: 'Arriba',
  tagline: 'Hotel de 14 quartos em Sagres',
  city: 'Sagres',
  region: 'Vila do Bispo, Algarve',
  email: 'reservas@arriba.exemplo',
  checkIn: '15:00',
  checkInUntil: '23:00',
  checkOut: '12:00',
  freeCancelDays: 7,
  maxNights: 14,
};

// Os quatro tipos de quarto e os números das chaves de cada um
export const ROOM_TYPES = [
  {
    slug: 'suite-farol',
    name: 'Suite Farol',
    rooms: ['03', '04'],
    price: 290,
    size: 38,
    bed: 'King, 180 cm',
    view: 'Mar e farol',
    outside: 'Varanda de 9 m²',
    guests: 3,
    photos: ['qmar', 'banho', 'lencois'],
    lead: 'Os dois quartos do canto, com varanda corrida e o farol de São Vicente ao fundo.',
    text: 'A cama fica virada para a janela e a banheira também, por isso o pôr do sol entra na água. A varanda dá a volta ao canto da casa e tem duas cadeiras e uma mesa pequena para o pequeno-almoço, que se pode pedir ao quarto.',
    features: ['Banheira junto à janela', 'Varanda corrida com mesa', 'Cama extra para uma criança', 'Máquina de café e chaleira', 'Pequeno-almoço no quarto sem custo'],
  },
  {
    slug: 'falesia',
    name: 'Falésia',
    rooms: ['11', '12', '13', '14'],
    price: 185,
    size: 28,
    bed: 'Casal, 160 cm',
    view: 'Falésia e mar',
    outside: 'Janela com banco',
    guests: 2,
    photos: ['qmadeira', 'terraco', 'banho2'],
    lead: 'No primeiro andar, a dar diretamente para a falésia.',
    text: 'Janela de peito com banco e almofadas, secretária de madeira de pinho e cortinas que escurecem o quarto todo. Quem acorda cedo vê os barcos a sair do porto da Baleeira.',
    features: ['Banco à janela', 'Cortinas opacas', 'Duche de chuva', 'Secretária', 'Esplanada do primeiro andar'],
  },
  {
    slug: 'patio',
    name: 'Pátio',
    rooms: ['07', '08', '09', '10'],
    price: 145,
    size: 26,
    bed: 'Duas camas de 90 ou casal de 160',
    view: 'Pátio das roseiras',
    outside: 'Porta para o pátio',
    guests: 3,
    pets: true,
    photos: ['qazulejo', 'rosas', 'qcadeiras'],
    lead: 'Rés-do-chão, com porta envidraçada para o pátio das roseiras.',
    text: 'São os quartos mais práticos para quem chega com pranchas, bicicletas ou um cão: a porta abre direta para o pátio e há um duche de água doce lá fora. As camas juntam-se ou separam-se como preferir.',
    features: ['Entrada direta pelo pátio', 'Aceita cães (sem custo)', 'Duche exterior', 'Camas que se juntam ou separam', 'Lugar para pranchas e bicicletas'],
  },
  {
    slug: 'duna',
    name: 'Duna',
    rooms: ['01', '02', '05', '06'],
    price: 130,
    size: 19,
    bed: 'Casal, 140 cm',
    view: 'Dunas',
    outside: 'Janela',
    guests: 2,
    photos: ['qbranco', 'quarto', 'arcosbrancos'],
    lead: 'Os mais pequenos e os mais claros.',
    text: 'Paredes caiadas, chão de madeira, uma cadeira, uma janela para as dunas e tudo o que é preciso para dormir bem. Bons para uma ou duas noites de passagem pela costa.',
    features: ['Chão de madeira', 'Janela para as dunas', 'Duche', 'Secretária pequena', 'Os mais silenciosos da casa'],
  },
];

export const typeBySlug = (slug) => ROOM_TYPES.find((t) => t.slug === slug);
export const ROOMS = ROOM_TYPES.flatMap((t) => t.rooms.map((num) => ({ num, type: t.slug }))).sort((a, b) => a.num.localeCompare(b.num));
export const ROOM_NUMS = ROOMS.map((r) => r.num);
export const typeOfRoom = (num) => typeBySlug(ROOMS.find((r) => r.num === num)?.type);

// Textos alternativos das fotografias (public/img/fotos/<nome>-480|800|1200.webp)
export const PHOTO_ALT = {
  falesia: 'Falésias douradas sobre uma enseada de água verde, com barcos pequenos',
  costa: 'Rochedos e arcos de pedra no mar azul',
  praia: 'Praia de areia entre rochedos altos, com banhistas',
  pordosol: 'Veleiro ancorado diante do sol a pôr-se no mar',
  veleiro: 'Proa de um veleiro no mar ao fim da tarde',
  baia: 'Praia vista de cima da falésia, com água verde e transparente',
  qmar: 'Quarto com janelas grandes abertas para a falésia e o mar, com um candeeiro antigo',
  qcadeiras: 'Duas cadeiras de vime viradas para o mar e uma ilha de rocha',
  qbranco: 'Quarto branco e claro com cama de casal, almofadas amarelas e uma planta',
  qmadeira: 'Quarto com parede de madeira escura, cortinas de linho e luz quente',
  quarto: 'Quarto simples com cama de madeira, candeeiro de mesa e janela',
  qazulejo: 'Quarto com duas camas de colchas azuis, tapete estampado e portas abertas',
  qescuro: 'Cama com cabeceira de palhinha e almofadas verdes',
  arcosbrancos: 'Sala caiada de branco com arcos e uma mesa de madeira',
  sala: 'Sala de estar branca com sofá, espelhos redondos e mesa baixa',
  terraco: 'Sofá com almofadas amarelas numa esplanada virada ao mar',
  terraco2: 'Terraço coberto com sofás, candeeiros de verga e plantas',
  rosas: 'Roseira vermelha num muro com o mar azul por trás',
  piscina: 'Piscina com espreguiçadeiras azuis entre palmeiras',
  banho: 'Casa de banho com banheira solta, madeira clara e janela',
  banho2: 'Casa de banho branca com lavatório e duche de parede',
  lencois: 'Cama desfeita com lençóis de linho junto a uma parede de cal',
  cocktail: 'Copo de cocktail cor de âmbar com raminho de alecrim num balcão',
  mesa: 'Mesa de madeira com tábuas de petiscos, copos e mãos a servir',
  prato: 'Tacho de barro gratinado ao lado de um copo de vinho branco',
  cafe: 'Chávena de café com leite numa mesa de madeira',
  pasteis: 'Pastéis de nata acabados de sair do forno',
  petiscos: 'Mesa posta à beira-mar com mariscos e pratos de petiscos',
  jantar: 'Brinde com copos de vinho numa mesa à luz das velas',
  massagem: 'Massagem às costas com mãos sobre uma toalha branca',
};

export const RESERVATION_STATUS = [
  ['confirmada', 'Confirmada'],
  ['em-casa', 'Em casa'],
  ['terminada', 'Terminada'],
  ['cancelada', 'Cancelada'],
];
export const STATUS_KEYS = RESERVATION_STATUS.map(([k]) => k);

export const REQUEST_KINDS = [
  ['bicicletas', 'Bicicletas para o dia'],
  ['lancheira', 'Lancheira para a praia'],
  ['massagem', 'Massagem (60 min, 70 €)'],
  ['barco', 'Saída de barco com pescadores (35 € por pessoa)'],
  ['jantar', 'Mesa para jantar'],
  ['outro', 'Outro pedido'],
];
export const REQUEST_KEYS = REQUEST_KINDS.map(([k]) => k);
export const requestLabel = (k) => REQUEST_KINDS.find(([key]) => key === k)?.[1] ?? k;

export const PLACES = [
  { photo: 'falesia', when: '12 min a pé', name: 'Fortaleza de Sagres', text: 'Vai-se pela falésia. Chegue cedo, antes dos autocarros.' },
  { photo: 'praia', when: '8 min a pé', name: 'Praia do Tonel', text: 'Ondas para surf quase todo o ano e pouco vento ao fim do dia.' },
  { photo: 'pordosol', when: '20 min de bicicleta', name: 'Cabo de São Vicente', text: 'Para ver o sol a cair no mar. Leve um casaco, mesmo em agosto.' },
  { photo: 'veleiro', when: 'Porto da Baleeira', name: 'Barco à costa', text: 'Saídas de duas horas com pescadores da vila, marcadas na receção.' },
];

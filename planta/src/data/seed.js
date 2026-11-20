import bcrypt from 'bcryptjs';
import { PHASES } from '../config/studio.js';

// Os dados vivem em memória e as datas são calculadas a partir de hoje,
// por isso há sempre pedidos recentes, reuniões marcadas e mensagens novas.
const DAY = 24 * 60 * 60 * 1000;
const at = (days, hour = 10, minute = 0) => {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const hash = (password) => bcrypt.hashSync(password, 10);

// Fotografia: chave do ficheiro em public/img/<projeto>/, texto alternativo e proporção (altura / largura)
const p = (key, alt, ratio = 0.667) => ({ key, alt, ratio });

export const projects = [
  {
    id: 'p-silvalde',
    slug: 'casa-em-silvalde',
    order: 1,
    published: true,
    name: 'Casa em Silvalde',
    type: 'moradia',
    place: 'Silvalde, Espinho',
    year: 2017,
    area: 240,
    state: 'Construída',
    summary: 'Uma casa térrea que se curva à volta do logradouro, para que todas as divisões vejam o jardim.',
    story: [
      'O terreno é um triângulo apertado entre duas ruas. Em vez de lutar contra os ângulos, a casa dobra-se: uma parede curva abraça o logradouro e deixa a rua para trás de um muro baixo e contínuo.',
      'A sala acompanha a curva com um vidro de canto a canto. Ao fim do dia a luz entra rasante pelo jardim e chega à cozinha, que fica no outro extremo da casa.',
      'A cobertura é plana e verde, e lê-se na planta como mais um jardim: quem a vê de cima percebe a curva inteira.',
    ],
    tags: ['curva', 'logradouro', 'casa térrea'],
    cover: p('logradouro', 'Casa em Silvalde ao fim do dia, vista do logradouro, com a parede curva e a sala iluminada'),
    photos: [
      p('logradouro', 'Casa em Silvalde ao fim do dia, vista do logradouro, com a parede curva e a sala iluminada'),
      p('interior', 'Sala com vidro em curva aberta para o jardim e a cozinha ao fundo'),
      p('frente', 'Frente da casa para a rua, com o muro baixo e contínuo'),
    ],
    drawing: {
      key: 'planta',
      alt: 'Planta do piso 0 da Casa em Silvalde, com o jardim triangular e a casa encostada às ruas',
      ratio: 0.707,
      label: 'Planta do piso 0',
      pins: [
        { x: 50, y: 40, title: 'O jardim entra na casa', text: 'O logradouro ocupa a ponta larga do triângulo; a casa encosta-se às ruas para o deixar inteiro.', photo: 'logradouro' },
        { x: 59, y: 63, title: 'A sala em curva', text: 'O vidro segue a parede curva e abre a sala ao jardim de uma ponta à outra.', photo: 'interior' },
        { x: 44, y: 90, title: 'A frente para a rua', text: 'Um muro baixo e contínuo protege a casa da estrada e esconde a garagem.', photo: 'frente' },
      ],
    },
    extra: { key: 'cobertura', alt: 'Planta da cobertura da Casa em Silvalde', ratio: 0.707, label: 'Planta da cobertura' },
    sketch: { key: 'poema', alt: 'Esboço com o poema da curva de Oscar Niemeyer', ratio: 1.3 },
  },
  {
    id: 'p-prime',
    slug: 'prime-studios',
    order: 2,
    published: true,
    name: 'Prime Studios',
    type: 'coletiva',
    place: 'Porto',
    year: 2022,
    area: 410,
    state: 'Construída',
    summary: 'Nove estúdios num prédio dos anos 70, cada um com cozinha de madeira e janela a toda a largura.',
    story: [
      'O prédio tinha escritórios divididos em salas pequenas. Tirámos as paredes que não eram estruturais e desenhámos nove estúdios com a mesma regra: a cozinha encostada à parede do corredor e a cama virada para a janela.',
      'O corredor comum é revestido a grés escuro e as portas são de madeira, para que cada entrada pareça a porta de uma casa e não de um quarto de hotel.',
    ],
    tags: ['estúdios', 'reabilitação', 'madeira'],
    cover: p('corredor', 'Corredor comum revestido a grés escuro com portas de madeira'),
    photos: [
      p('corredor', 'Corredor comum revestido a grés escuro com portas de madeira'),
      p('cozinha', 'Cozinha do estúdio em madeira clara e branco'),
      p('estudio', 'Estúdio vazio com chão de madeira e janela larga'),
    ],
  },
  {
    id: 'p-pedroucos',
    slug: 'apartamento-em-pedroucos',
    order: 3,
    published: true,
    name: 'Apartamento em Pedrouços',
    type: 'reabilitacao',
    place: 'Pedrouços, Maia',
    year: 2022,
    area: 110,
    state: 'Construída',
    summary: 'Um duplex aberto de ponta a ponta, com uma escada em ripado de madeira que deixa passar a luz.',
    story: [
      'Era um duplex escuro, com a escada fechada entre paredes. Abrimos a cozinha para a sala e trocámos as paredes da escada por um ripado de madeira, que separa sem fechar.',
      'Os armários são verde-escuro e madeira clara, do chão ao teto, para que a cozinha pareça um móvel só e esconda o frigorífico, o micro-ondas e a despensa.',
    ],
    tags: ['duplex', 'ripado', 'cozinha aberta'],
    cover: p('cozinha', 'Cozinha em madeira clara e armários verde-escuro com ilha branca'),
    photos: [
      p('cozinha', 'Cozinha em madeira clara e armários verde-escuro com ilha branca'),
      p('escada', 'Escada de madeira atrás de um ripado vertical'),
      p('ilha', 'Ilha da cozinha com a escada e o ripado ao fundo'),
      p('bancada', 'Bancada da cozinha com armários verdes em cima'),
      p('armario', 'Nicho em madeira dentro do armário verde'),
    ],
  },
  {
    id: 'p-granja',
    slug: 'casas-da-granja-ii',
    order: 4,
    published: true,
    name: 'Casas da Granja II',
    type: 'coletiva',
    place: 'Granja, Vila Nova de Gaia',
    year: 2023,
    area: 980,
    state: 'Construída',
    summary: 'Seis casas em banda, brancas, com um pátio de luz no meio de cada uma e o jardim virado a sul.',
    story: [
      'Seis casas iguais por fora e diferentes por dentro. A fachada branca repete o mesmo ritmo de janelas e varandas; atrás dela cada família escolheu a cozinha, os quartos e os acabamentos.',
      'No meio de cada casa há um pátio de luz com claraboia, que ilumina a escada e as casas de banho do piso de cima.',
    ],
    tags: ['casas em banda', 'pátio de luz', 'branco'],
    cover: p('jardim', 'Traseiras das casas brancas em banda com jardim e varandas'),
    photos: [
      p('jardim', 'Traseiras das casas brancas em banda com jardim e varandas'),
      p('rua', 'As seis casas vistas da rua'),
      p('sala', 'Cozinha e sala abertas com ilha e escada ao fundo'),
      p('patio', 'Pátio de luz com claraboia e guarda de vidro'),
      p('banho', 'Casa de banho em mármore branco'),
    ],
  },
  {
    id: 'p-vilhena',
    slug: 'casa-filipa-de-vilhena',
    order: 5,
    published: true,
    name: 'Casa Filipa de Vilhena',
    type: 'moradia',
    place: 'Porto',
    year: 2025,
    area: 210,
    state: 'Em obra',
    summary: 'Uma casa branca de arcos e madeira, com a garagem escondida debaixo de uma curva.',
    story: [
      'A rua é estreita e a casa tinha de ser discreta. A fachada é branca e quase cega, com dois arcos que deixam ver a madeira por dentro, e a garagem entra por baixo de uma curva.',
      'Do lado do jardim a casa abre-se: a cozinha e a sala dão para o relvado e os quartos têm janelas em arco viradas a nascente.',
    ],
    tags: ['arcos', 'branco', 'madeira'],
    cover: p('fachada', 'Fachada branca com arcos, madeira e a garagem por baixo de uma curva'),
    photos: [
      p('fachada', 'Fachada branca com arcos, madeira e a garagem por baixo de uma curva'),
      p('jardim', 'Traseiras da casa com janelas em arco e jardim'),
      p('cozinha', 'Cozinha branca com madeira e mesa de jantar'),
    ],
  },
];

export const users = [
  { id: 'u-leonor', name: 'Leonor Castelo', email: 'leonor@leonorcastelo.pt', phone: '', role: 'admin', passwordHash: hash('planta2026'), createdAt: at(-900) },
  { id: 'u-ana', name: 'Ana Ribeiro', email: 'ana@exemplo.pt', phone: '912 000 001', role: 'cliente', passwordHash: hash('cliente2026'), createdAt: at(-140) },
  { id: 'u-tiago', name: 'Tiago Moreira', email: 'tiago@exemplo.pt', phone: '912 000 002', role: 'cliente', passwordHash: hash('cliente2026'), createdAt: at(-60) },
];

const phases = (current, starts) =>
  PHASES.map((phase, i) => ({
    key: phase.key,
    status: i < current ? 'feita' : i === current ? 'agora' : 'depois',
    start: starts[i] ?? null,
  }));

export const works = [
  {
    id: 'w-fafe',
    userId: 'u-ana',
    title: 'Casa no Monte, Fafe',
    place: 'Fafe, Braga',
    summary: 'Casa de família num terreno inclinado, com três quartos e o escritório virado para o vale.',
    phase: 2,
    phases: phases(2, [at(-140), at(-95), at(-20)]),
    meetings: [
      { id: 'm-1', at: at(4, 15, 0), topic: 'Respostas da câmara ao pedido de licenciamento', where: 'Atelier de Matosinhos', confirmed: false },
      { id: 'm-2', at: at(-12, 11, 0), topic: 'Escolha das janelas e da cor da caixilharia', where: 'Videochamada', confirmed: true },
    ],
    documents: [
      { id: 'd-1', code: 'A-201', name: 'Plantas do estudo prévio', phase: 'estudo', at: at(-70), size: '4,2 MB' },
      { id: 'd-2', code: 'A-202', name: 'Alçados e cortes', phase: 'estudo', at: at(-70), size: '3,1 MB' },
      { id: 'd-3', code: 'A-301', name: 'Projeto de licenciamento entregue', phase: 'licenciamento', at: at(-18), size: '12,8 MB' },
      { id: 'd-4', code: 'A-302', name: 'Pedido de elementos da câmara', phase: 'licenciamento', at: at(-3), size: '0,4 MB' },
    ],
    messages: [
      { id: 'msg-1', from: 'arquiteta', text: 'A câmara pediu mais duas fotografias do terreno e a planta de localização à escala 1:2000. Eu trato disso esta semana.', at: at(-3, 9, 40) },
      { id: 'msg-2', from: 'cliente', text: 'Obrigada! Se precisar que eu vá ao terreno tirar as fotografias, diga.', at: at(-3, 13, 5) },
      { id: 'msg-3', from: 'arquiteta', text: 'Marquei a reunião de quinta para lhe mostrar as respostas. Confirme na sua folha, por favor.', at: at(-1, 17, 20) },
    ],
  },
  {
    id: 'w-viseu',
    userId: 'u-tiago',
    title: 'Reabilitação na Rua Direita, Viseu',
    place: 'Viseu',
    summary: 'Casa de granito do século XIX com loja no rés-do-chão e dois pisos de habitação.',
    phase: 0,
    phases: phases(0, [at(-25)]),
    meetings: [{ id: 'm-3', at: at(9, 10, 30), topic: 'Visita à casa para o levantamento', where: 'Rua Direita, Viseu', confirmed: true }],
    documents: [{ id: 'd-5', code: 'A-101', name: 'Fotografias e medições da primeira visita', phase: 'programa', at: at(-20), size: '18,4 MB' }],
    messages: [{ id: 'msg-4', from: 'arquiteta', text: 'Bem-vindo, Tiago. Aqui vai ver cada fase do projeto, as reuniões e os desenhos à medida que ficam prontos.', at: at(-25, 10, 0) }],
  },
];

export const requests = [
  { id: 'r-1', name: 'Marta Sousa', email: 'marta@exemplo.pt', phone: '913 000 003', situation: 'terreno', budget: '150-300', place: 'Póvoa de Varzim', message: 'Comprámos um terreno perto do mar e queremos uma casa térrea com três quartos e um pátio. Gostava de perceber por onde começar.', status: 'novo', notes: '', createdAt: at(-1, 21, 14) },
  { id: 'r-2', name: 'João Pires', email: 'joao@exemplo.pt', phone: '', situation: 'apartamento', budget: 'ate-150', place: 'Porto, Bonfim', message: 'Apartamento de 1960 com corredor comprido e cozinha fechada. Quero abrir a cozinha e ganhar um escritório.', status: 'novo', notes: '', createdAt: at(-2, 11, 2) },
  { id: 'r-3', name: 'Helena e Rui Costa', email: 'helena@exemplo.pt', phone: '914 000 004', situation: 'reabilitar', budget: '300-mais', place: 'Viseu', message: 'Casa de granito herdada dos avós, com o telhado em mau estado. Queremos viver lá e manter as paredes de pedra.', status: 'conversa', notes: 'Visita marcada para dia 28. Levar a ficha do levantamento.', createdAt: at(-9, 18, 30) },
  { id: 'r-4', name: 'Sofia Lima', email: 'sofia@exemplo.pt', phone: '', situation: 'ideia', budget: 'nao-sei', place: '', message: 'Ainda não temos terreno, mas queremos saber quanto custa um projeto de uma casa.', status: 'proposta', notes: 'Enviada tabela de honorários.', createdAt: at(-21, 10, 0) },
];

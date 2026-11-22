// Versões do site por época do ano. Cada época tem uma janela em que fica disponível
// (a opção aparece na barra de cima) e um período principal. O site nunca muda sozinho:
// quem visita é que escolhe ver a versão da época.

const DAY = 24 * 60 * 60 * 1000;
const date = (y, m, d) => new Date(y, m - 1, d);
const addDays = (d, n) => new Date(d.getTime() + n * DAY);

// Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher)
export function easter(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 114);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return date(year, month, day);
}

export const EPOCAS = [
  {
    id: 'natal',
    name: 'Natal',
    pill: 'Ver a versão de Natal',
    // de 15 de novembro aos Reis (6 de janeiro)
    window: (y) => [date(y, 11, 15), date(y + 1, 1, 7)],
    photo: 'vila',
    eyebrow: 'Natal em Freixo',
    sub: 'A vila iluminada, a Fogueira do Galo e os Concursos de Natal nas quatro freguesias.',
    banner: {
      kicker: 'Natal em Freixo',
      title: 'Luzes na vila e a Fogueira do Galo.',
      text: 'Em dezembro o centro histórico acende-se, as montras e os presépios entram nos Concursos de Natal e, na noite de 24, a praça junta-se à volta da Fogueira do Galo.',
      items: [
        ['1 dez', 'Iluminação de Natal', 'O centro histórico acende-se ao fim da tarde.'],
        ['Inscrições', 'Concursos de Natal', 'Montras, presépios e casas iluminadas. Participação gratuita.'],
        ['24 dez', 'Fogueira do Galo', 'Na praça da vila, depois da ceia.'],
      ],
      link: ['/atualidade/concursos-de-natal', 'Concursos de Natal'],
    },
  },
  {
    id: 'halloween',
    name: 'Pão-por-Deus',
    pill: 'Ver a versão de Halloween',
    window: (y) => [date(y, 10, 15), date(y, 11, 3)],
    photo: 'torre',
    eyebrow: 'Halloween e Pão-por-Deus',
    sub: 'Noite de histórias na Torre do Galo e, a 1 de novembro, o Pão-por-Deus porta a porta.',
    banner: {
      kicker: 'Halloween e Pão-por-Deus',
      title: 'Histórias à sombra da Torre do Galo.',
      text: 'No fim de outubro as crianças pedem o Pão-por-Deus de porta em porta e a biblioteca conta lendas do concelho, da espada cravada no freixo à torre de sete lados.',
      items: [
        ['31 out', 'Noite de lendas', 'Histórias do concelho na Biblioteca Municipal.'],
        ['1 nov', 'Pão-por-Deus', 'A tradição de pedir de porta em porta, nas aldeias e na vila.'],
        ['Todo o mês', 'Castanhas e magustos', 'Nas escolas e nas associações.'],
      ],
      link: ['/atualidade#agenda', 'Ver a agenda'],
    },
  },
  {
    id: 'carnaval',
    name: 'Carnaval',
    pill: 'Ver a versão de Carnaval',
    // da quinta-feira de Comadres à Quarta-feira de Cinzas
    window: (y) => {
      const tuesday = addDays(easter(y), -47);
      return [addDays(tuesday, -14), addDays(tuesday, 2)];
    },
    photo: 'vila',
    eyebrow: 'Carnaval e Enterro do Entrudo',
    sub: 'Na terça-feira de Carnaval, às 20h00, o Largo do Outeiro despede-se do Entrudo.',
    banner: {
      kicker: 'Carnaval',
      title: 'O Enterro do Entrudo, no Largo do Outeiro.',
      text: 'Na noite de terça-feira de Carnaval, a vila junta-se no Largo do Outeiro para o Enterro do Entrudo, uma das tradições mais vivas do concelho.',
      items: [
        ['Sexta', 'Desfile das escolas', 'As crianças mascaradas pelas ruas da vila.'],
        ['Terça, 20h', 'Enterro do Entrudo', 'Concentração no Largo do Outeiro.'],
      ],
      link: ['/atualidade#agenda', 'Ver a agenda'],
    },
  },
  {
    id: 'amendoeira',
    name: 'Amendoeira em Flor',
    pill: 'Ver a versão Amendoeira em Flor',
    window: (y) => [date(y, 2, 1), date(y, 3, 21)],
    photo: 'amendoeiras',
    eyebrow: 'Amendoeira em Flor',
    sub: 'As encostas ficam brancas e a vila recebe a Feira da Amendoeira em Flor.',
    banner: {
      kicker: 'Amendoeira em Flor',
      title: 'Quando as encostas do concelho ficam brancas.',
      text: 'No fim de fevereiro e no início de março, a Feira da Amendoeira em Flor enche a vila de produtos da terra, artesanato e música, com o Concurso de Ilustração.',
      items: [
        ['Fev. e março', 'Feira da Amendoeira em Flor', 'Dois fins de semana de feira na vila.'],
        ['Concurso', 'Ilustração Amendoeira em Flor', 'Ilustradores de todo o país desenham o concelho.'],
        ['Passeios', 'Miradouros e percursos', 'Do Penedo Durão às encostas de Lagoaça.'],
      ],
      link: ['/atualidade/feira-amendoeira-em-flor-concurso-ilustracao', 'Saber mais'],
    },
  },
  {
    id: 'pascoa',
    name: 'Páscoa',
    pill: 'Ver a versão de Páscoa',
    // do Domingo de Ramos à Segunda-feira de Páscoa, feriado municipal
    window: (y) => {
      const sunday = easter(y);
      return [addDays(sunday, -14), addDays(sunday, 2)];
    },
    photo: 'matriz',
    eyebrow: 'Páscoa e feriado municipal',
    sub: 'A Procissão dos Sete Passos na Quaresma e, na segunda-feira de Páscoa, o feriado do concelho.',
    banner: {
      kicker: 'Páscoa',
      title: 'Semana Santa e feriado municipal.',
      text: 'Na Quaresma, a Procissão dos Sete Passos sai à meia-noite de cada sexta-feira, ao toque do relógio da torre. A segunda-feira de Páscoa é o feriado municipal.',
      items: [
        ['Sextas, 0h', 'Procissão dos Sete Passos', 'A única do distrito de Bragança.'],
        ['Domingo', 'Páscoa', 'Celebrações na Igreja Matriz.'],
        ['Segunda', 'Feriado municipal', 'Serviços do Município encerrados.'],
      ],
      link: ['/visitar#tradicoes', 'Tradições do concelho'],
    },
  },
  {
    id: 'verao',
    name: 'Verão',
    pill: 'Ver a versão de Verão',
    window: (y) => [date(y, 7, 10), date(y, 9, 1)],
    photo: 'congida',
    eyebrow: 'Verão no Douro',
    sub: 'Praia fluvial da Congida, férias desportivas e, em agosto, as Festas da Vila e as romarias.',
    banner: {
      kicker: 'Verão no Douro',
      title: 'Congida, festas e romarias.',
      text: 'O verão passa-se à beira do Douro, na praia fluvial da Congida, e em agosto as Festas da Vila, a Festa de Mazouco e Nossa Senhora dos Montes Ermos enchem o concelho.',
      items: [
        ['Julho', 'Férias desportivas e culturais', 'Para crianças e jovens do concelho.'],
        ['Agosto', 'Festas da Vila', 'Música, procissões e o regresso de quem está fora.'],
        ['Todo o verão', 'Praia fluvial da Congida', 'Piscina, esplanada e o rio.'],
      ],
      link: ['/visitar#congida', 'Visitar a Congida'],
    },
  },
];

const inWindow = (epoca, now) => {
  // a janela pode começar no ano anterior (o Natal acaba em janeiro)
  for (const y of [now.getFullYear() - 1, now.getFullYear()]) {
    const [from, to] = epoca.window(y);
    if (now >= from && now < to) return true;
  }
  return false;
};

// Época que está disponível agora (a primeira da lista, por ordem de prioridade)
export const availableEpoca = (now = new Date()) => EPOCAS.find((e) => inWindow(e, now)) ?? null;

export const findEpoca = (id) => EPOCAS.find((e) => e.id === id) ?? null;

// Decide a versão a mostrar: ?epoca=… (para pré-visualizar) > cookie, só se a época estiver disponível
export function resolveEpoca(req, res) {
  const offer = availableEpoca();
  const asked = typeof req.query.epoca === 'string' ? req.query.epoca : null;

  if (asked) {
    const chosen = findEpoca(asked);
    res.cookie('epoca', chosen ? chosen.id : 'normal', { maxAge: 60 * DAY, sameSite: 'lax', path: '/' });
    return { offer: offer ?? chosen, active: chosen };
  }

  const saved = req.cookies?.epoca;
  const active = saved && offer && saved === offer.id ? offer : null;
  return { offer, active };
}

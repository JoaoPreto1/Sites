import { producers, wines } from '../repositories/index.js';
import { DISHES, REGIONS, TYPES } from '../data/seed.js';
import { notFound } from '../utils/httpError.js';

const regionName = Object.fromEntries(REGIONS.map((r) => [r.slug, r.name]));
const typeName = Object.fromEntries(TYPES.map((t) => [t.slug, t.single]));
const typeOrder = Object.fromEntries(TYPES.map((t, i) => [t.slug, i]));

// Porque é que um vinho combina com o prato, consoante a família do vinho
const REASONS = {
  marisco: { fresco: 'Acidez e sal para o iodo do marisco.', tinto: 'Um tinto leve que não tapa o marisco.', generoso: 'Seco e salino, como aperitivo antes do marisco.' },
  peixe: { fresco: 'Fresco e limpo, deixa o peixe brilhar.', tinto: 'Tinto leve, servido fresco, para peixes gordos.', generoso: 'Para abrir o apetite antes do peixe.' },
  polvo: { fresco: 'A acidez corta o azeite do polvo.', tinto: 'Tinto atlântico e fresco, aguenta o alho e o azeite.', generoso: 'Uma excentricidade que resulta.' },
  bacalhau: { fresco: 'Textura para acompanhar o bacalhau e o azeite.', tinto: 'Tinto com acidez, para um bacalhau assado na brasa.', generoso: 'Um clássico de fim de refeição.' },
  leitao: { fresco: 'A bolha limpa a gordura e a pimenta do leitão.', tinto: 'Taninos firmes e acidez para a pele estaladiça.', generoso: 'Para depois do leitão.' },
  carne: { fresco: 'Um branco com corpo para carnes brancas.', tinto: 'Estrutura e taninos para a carne vermelha.', generoso: 'Fica para a sobremesa.' },
  caca: { fresco: 'Para começar a refeição.', tinto: 'Fruto escuro e especiaria, à altura de um prato de caça.', generoso: 'Para o fim da noite, à lareira.' },
  queijos: { fresco: 'A acidez equilibra queijos cremosos.', tinto: 'Para queijos curados e de pasta dura.', generoso: 'O par clássico para o queijo da Serra.' },
  petiscos: { fresco: 'Leve e fresco, para petiscar sem pressa.', tinto: 'Tinto ligeiro que se bebe fresco entre petiscos.', generoso: 'Seco e gelado, como os ingleses gostam.' },
  doces: { fresco: 'Bolha e fruta para sobremesas leves.', tinto: 'Melhor guardar para a próxima refeição.', generoso: 'Doce, com acidez para não cansar.' },
};

const family = (type) => (type === 'tinto' ? 'tinto' : type === 'generoso' ? 'generoso' : 'fresco');

export async function producerMap() {
  const list = await producers.findAll();
  return Object.fromEntries(list.map((p) => [p.id, p]));
}

export function summary(wine, byProducer) {
  const producer = byProducer[wine.producerId];
  return {
    ...wine,
    producer: { name: producer?.name ?? '', slug: producer?.slug ?? '' },
    regionName: regionName[wine.region],
    typeName: typeName[wine.type],
    vintage: wine.year ? String(wine.year) : 'Sem ano',
    soldOut: wine.stock <= 0,
  };
}

const SORTS = {
  carta: (a, b) => typeOrder[a.type] - typeOrder[b.type] || a.price - b.price,
  'preco-asc': (a, b) => a.price - b.price,
  'preco-desc': (a, b) => b.price - a.price,
  antigos: (a, b) => (a.year ?? 0) - (b.year ?? 0),
};

export async function listWines({ tipo, regiao, ate, prato, q, ordem = 'carta', destaque } = {}) {
  const term = q?.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const byProducer = await producerMap();
  const all = await wines.findAll(
    (w) =>
      (!tipo || w.type === tipo) &&
      (!regiao || w.region === regiao) &&
      (!ate || w.price <= ate) &&
      (!prato || w.pairings.includes(prato)) &&
      (!destaque || w.featured),
  );

  const list = all.map((w) => summary(w, byProducer));
  const searched = term
    ? list.filter((w) =>
        [w.name, w.producer.name, w.regionName, ...w.grapes]
          .join(' ')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .includes(term),
      )
    : list;

  return searched.sort(SORTS[ordem] ?? SORTS.carta);
}

export async function wineDetail(slug) {
  const wine = await wines.findOne((w) => w.slug === slug);
  if (!wine) throw notFound('Vinho');

  const byProducer = await producerMap();
  const producer = byProducer[wine.producerId];
  const others = await wines.findAll((w) => w.id !== wine.id);
  const related = others
    .map((w) => ({ w, score: (w.producerId === wine.producerId) * 2 + (w.region === wine.region) + (w.type === wine.type) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ w }) => summary(w, byProducer));

  return { wine: summary(wine, byProducer), producer, related };
}

export async function pairing({ prato, pessoas = 2, orcamento }) {
  const dish = DISHES.find((d) => d.slug === prato);
  if (!dish) throw notFound('Prato');

  const byProducer = await producerMap();
  const candidates = await wines.findAll((w) => w.pairings.includes(prato) && w.stock > 0);
  const inBudget = candidates.filter((w) => !orcamento || w.price <= orcamento);
  const pool = inBudget.length ? inBudget : candidates.sort((a, b) => a.price - b.price).slice(0, 3);

  const bottles = Math.max(1, Math.ceil(pessoas / 3));
  const picks = pool
    .map((w) => ({ w, score: (w.pairings.indexOf(prato) === 0) * 3 + w.featured * 2 + (orcamento ? w.price / orcamento : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ w }) => ({ ...summary(w, byProducer), reason: REASONS[prato][family(w.type)], bottles }));

  return { dish, people: pessoas, budget: orcamento ?? null, overBudget: !inBudget.length, picks };
}

export async function catalog() {
  const all = await wines.findAll();
  const count = (key, value) => all.filter((w) => w[key] === value).length;
  return {
    types: TYPES.map((t) => ({ ...t, count: count('type', t.slug) })),
    regions: REGIONS.map((r) => ({ ...r, count: count('region', r.slug) })),
    dishes: DISHES,
    total: all.length,
  };
}

export async function producerList() {
  return producers.findAll();
}

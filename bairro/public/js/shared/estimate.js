// Tabela de preços do estúdio. Fica num ficheiro partilhado para a calculadora
// do browser e o servidor darem sempre o mesmo valor.
export const SERVICES = [
  { id: 'marca', name: 'Marca', detail: 'Nome, logótipo, cores, letra e manual de uso', min: 1800, max: 4000, weeks: [4, 6] },
  { id: 'site', name: 'Site', detail: 'Desenho e código, até 8 páginas, gerido por vocês', min: 2500, max: 6500, weeks: [6, 9] },
  { id: 'loja', name: 'Loja online', detail: 'Catálogo, pagamentos e envios', min: 4500, max: 9000, weeks: [8, 12] },
  { id: 'embalagem', name: 'Embalagem', detail: 'Caixas, rótulos e sacos, com acompanhamento na gráfica', min: 2000, max: 5000, weeks: [5, 8] },
  { id: 'menu', name: 'Menu e sinalética', detail: 'Cartas, ardósias, montra e placas', min: 900, max: 2200, weeks: [2, 4] },
  { id: 'editorial', name: 'Livro ou revista', detail: 'Paginação, capa e preparação para impressão', min: 1500, max: 4000, weeks: [4, 8] },
  { id: 'cartaz', name: 'Cartazes e campanha', detail: 'Série de cartazes, redes sociais e outdoor', min: 800, max: 2000, weeks: [2, 3] },
];

export const EXTRAS = [
  { id: 'fotografia', name: 'Sessão fotográfica', add: 600 },
  { id: 'textos', name: 'Escrita dos textos', add: 450 },
  { id: 'urgente', name: 'Prazo apertado', percent: 20 },
];

export const BUDGETS = [
  ['ate-2000', 'Até 2 000 €'],
  ['2000-5000', '2 000 a 5 000 €'],
  ['5000-10000', '5 000 a 10 000 €'],
  ['mais-10000', 'Mais de 10 000 €'],
];

// Trabalhos feitos em conjunto partilham pesquisa e reuniões: a partir do segundo serviço há 10% de desconto
const BUNDLE_DISCOUNT = 0.1;

const roundTo50 = (value) => Math.round(value / 50) * 50;

export function estimate(serviceIds = [], extraIds = []) {
  const items = SERVICES.filter((s) => serviceIds.includes(s.id));
  const extras = EXTRAS.filter((e) => extraIds.includes(e.id));
  if (!items.length) return { items: [], extras: [], min: 0, max: 0, weeks: [0, 0], discount: false };

  const discount = items.length > 1;
  const factor = discount ? 1 - BUNDLE_DISCOUNT : 1;
  let min = items.reduce((sum, s) => sum + s.min, 0) * factor;
  let max = items.reduce((sum, s) => sum + s.max, 0) * factor;

  for (const extra of extras) {
    if (extra.add) {
      min += extra.add;
      max += extra.add;
    }
  }

  const urgent = extras.some((e) => e.percent);
  if (urgent) {
    min *= 1.2;
    max *= 1.2;
  }

  // Os serviços correm em paralelo: conta o mais longo e mais uma semana por cada serviço a mais
  const longest = items.reduce((acc, s) => [Math.max(acc[0], s.weeks[0]), Math.max(acc[1], s.weeks[1])], [0, 0]);
  const weeks = longest.map((w) => w + items.length - 1).map((w) => (urgent ? Math.max(2, Math.ceil(w * 0.7)) : w));

  return {
    items: items.map((s) => s.id),
    extras: extras.map((e) => e.id),
    min: roundTo50(min),
    max: roundTo50(max),
    weeks,
    discount,
  };
}

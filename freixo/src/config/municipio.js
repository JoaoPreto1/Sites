// Dados fixos do concelho. Fontes: Wikipedia (pt e en) e Censos 2011/2021.
export const MUNICIPIO = {
  name: 'Município de Freixo de Espada à Cinta',
  short: 'Freixo de Espada à Cinta',
  district: 'Bragança',
  subregion: 'Douro',
  areaKm2: 244.14,
  residents2021: 3216,
  patron: 'São Miguel Arcanjo',
  holiday: 'Segunda-feira de Páscoa',
  postalCode: '5180',
  dialCode: '279',
  geo: { latitude: 41.0898, longitude: -6.8072 },
  hours: [
    ['Manhã', '9h00–12h30'],
    ['Tarde', '14h00–17h30'],
  ],
};

export const FREGUESIAS = [
  {
    slug: 'freixo-e-mazouco',
    name: 'Freixo de Espada à Cinta e Mazouco',
    residents2011: 2355,
    residents2021: 2114,
    note: 'Sede do concelho; gravuras rupestres do Mazouco',
    text: 'A sede do concelho, com o centro histórico manuelino, a Torre do Galo e a Igreja Matriz. Em Mazouco ficam as gravuras rupestres.',
  },
  {
    slug: 'lagoaca-e-fornos',
    name: 'Lagoaça e Fornos',
    residents2011: 617,
    residents2021: 443,
    note: 'Montanha de Lagoaça, 884 m',
    text: 'No planalto a norte, com a Montanha de Lagoaça, a 884 m, o ponto mais alto do concelho.',
  },
  {
    slug: 'ligares',
    name: 'Ligares',
    residents2011: 397,
    residents2021: 332,
    note: 'Terra natal de Guerra Junqueiro',
    text: 'Terra natal de Guerra Junqueiro, servida pela EN325 que liga o concelho ao IP2.',
  },
  {
    slug: 'poiares',
    name: 'Poiares',
    residents2011: 411,
    residents2021: 326,
    note: 'Calçada de Alpajares',
    text: 'Aldeia sobre as arribas, perto da Calçada de Alpajares, também conhecida por Calçada dos Mouros.',
  },
];

export const SERVICE_CATEGORIES = [
  ['agua', 'Água e resíduos'],
  ['obras', 'Obras e urbanismo'],
  ['social', 'Ação social'],
  ['educacao', 'Educação'],
  ['geral', 'Atendimento geral'],
];

export const NEWS_CATEGORIES = [
  ['municipio', 'Município'],
  ['cultura', 'Cultura'],
  ['obras', 'Obras'],
  ['social', 'Apoios'],
];

export const REQUEST_STATUS = [
  ['recebido', 'Recebido'],
  ['em-analise', 'Em análise'],
  ['aguarda', 'Aguarda documentos'],
  ['concluido', 'Concluído'],
];

export const ISSUE_TYPES = [
  ['via', 'Buraco ou pavimento'],
  ['luz', 'Iluminação pública'],
  ['lixo', 'Lixo ou limpeza'],
  ['sinal', 'Sinalização'],
  ['agua', 'Fuga de água'],
  ['outro', 'Outro'],
];

export const NOTICE_TYPES = [
  ['agua', 'Água'],
  ['transito', 'Trânsito'],
  ['ambiente', 'Ambiente'],
  ['geral', 'Geral'],
];

// Dados do concelho. Fontes: site atual do Município (cm-freixoespadacinta.pt),
// Wikipedia (pt e en) e Censos 2011/2021. Onde o site atual se contradiz, fica a versão do rodapé.
export const MUNICIPIO = {
  name: 'Município de Freixo de Espada à Cinta',
  short: 'Freixo de Espada à Cinta',
  district: 'Bragança',
  subregion: 'Douro',
  areaKm2: 244.14,
  altitude: 471,
  residents2021: 3216,
  patron: 'São Miguel Arcanjo',
  holiday: 'Segunda-feira de Páscoa',
  postalCode: '5180',
  dialCode: '279',
  geo: { latitude: 41.0898, longitude: -6.8072 },
  address: 'Praceta do Município',
  postal: '5180-103 Freixo de Espada à Cinta',
  phone: '279 658 160',
  fax: '279 658 165',
  email: 'geral@cm-fec.pt',
  hours: [
    ['Manhã', '9h00–12h30'],
    ['Tarde', '13h30–17h00'],
  ],
  distances: [
    ['Bragança', '140 km'],
    ['Porto', '235 km'],
    ['Lisboa', '420 km'],
  ],
};

export const SOCIAL = [
  ['Facebook', 'https://www.facebook.com/municipiofreixoespadacinta'],
  ['Instagram', 'https://www.instagram.com/municipio_freixo_espada_cinta/'],
  ['YouTube', 'https://www.youtube.com/@freixodeespadaacinta-terra1517'],
];

export const EMERGENCY = [
  ['Emergência', '112'],
  ['Proteção Civil', '279 653 653'],
  ['GNR', '279 653 323'],
  ['Bombeiros Voluntários', '279 653 230'],
  ['SNS 24', '808 24 24 24'],
];

export const EXECUTIVO = [
  { name: 'Nuno Ferreira', role: 'Presidente da Câmara', party: 'PS', email: 'nuno.m.ferreira@cm-fec.pt', pelouros: ['Coordenação geral e relações exteriores', 'Gestão financeira', 'Recursos humanos', 'Ação social', 'Planeamento e gestão urbanística', 'Comunicação', 'Proteção civil', 'Candidaturas e apoio ao desenvolvimento', 'Obras públicas', 'Juntas de freguesia', 'Agricultura', 'Jardins e zonas verdes'] },
  { name: 'Rui Pedro Vicente', role: 'Vereador', party: 'PS', email: 'pedro.vicente@cm-fec.pt', pelouros: ['Juventude', 'Associativismo', 'Desporto', 'Mercados e feiras mensais', 'Obras particulares', 'Sociedade Congida-La Barca'] },
  { name: 'Marisa Madeira', role: 'Vereadora', party: 'PS', email: 'marisa.madeira@cm-fec.pt', pelouros: ['Educação', 'Cultura', 'Turismo', 'Ambiente'] },
  { name: 'Daniela Pereira', role: 'Vereadora', party: 'PSD', pelouros: [] },
  { name: 'António Morgado', role: 'Vereador', party: 'PSD', pelouros: [] },
];

export const ASSEMBLEIA = {
  president: 'Ana Luísa Peleira',
  secretaries: ['Ana Cristina Faustino', 'António Manuel Fidalgo'],
  elected: 12,
  email: 'assembleiamunicipal@cm-fec.pt',
  sessions: 'Cinco sessões ordinárias por ano: fevereiro, abril, junho, setembro e novembro ou dezembro, convocadas por edital.',
};

export const FREGUESIAS = [
  {
    slug: 'freixo-e-mazouco',
    name: 'Freixo de Espada à Cinta e Mazouco',
    junta: 'União das Freguesias de Freixo de Espada à Cinta e Mazouco',
    president: 'Carlos Madeira',
    address: 'Rua Dr. Valentim Garcia, 15 · 5180-122 Freixo de Espada à Cinta',
    phone: '279 653 485',
    email: 'juntafreixo@mail.telepac.pt',
    hours: 'Freixo: dias úteis, 9h00–17h30 · Mazouco: terça 14h00–17h00 e quinta 9h00–12h00',
    residents2011: 2355,
    residents2021: 2114,
    note: 'Sede do concelho; gravuras rupestres do Mazouco',
    text: 'A sede do concelho, com o centro histórico manuelino, a Torre do Galo e a Igreja Matriz. Em Mazouco ficam as gravuras rupestres.',
  },
  {
    slug: 'lagoaca-e-fornos',
    name: 'Lagoaça e Fornos',
    junta: 'União das Freguesias de Lagoaça e Fornos',
    president: 'José Manuel Marcos',
    address: 'Rua Nova, s/n · 5180-231 Lagoaça',
    phone: '279 649 396',
    email: 'jf.lagoacaefornos@sapo.pt',
    hours: 'Lagoaça: segunda 9h00–12h30 · Fornos: terça 9h00–12h30 e quinta 9h00–12h30',
    residents2011: 617,
    residents2021: 443,
    note: 'Montanha de Lagoaça, 884 m',
    text: 'No planalto a norte, com a Montanha de Lagoaça, a 884 m, o ponto mais alto do concelho.',
  },
  {
    slug: 'ligares',
    name: 'Ligares',
    junta: 'Junta de Freguesia de Ligares',
    president: 'Paulo Xavier Pereira',
    address: 'Largo Santa Cruz · 5180-301 Ligares',
    phone: '279 668 058',
    email: 'jf.ligares@sapo.pt',
    hours: 'Dias úteis, 14h00–17h00',
    residents2011: 397,
    residents2021: 332,
    note: 'Terra natal de Guerra Junqueiro',
    text: 'Terra natal de Guerra Junqueiro, servida pela EN325 que liga o concelho ao IP2.',
  },
  {
    slug: 'poiares',
    name: 'Poiares',
    junta: 'Junta de Freguesia de Poiares',
    president: 'Luís Filipe Portela',
    address: 'Largo do Olmo · 5180-346 Poiares',
    phone: '279 653 491',
    email: 'freguesiadepoiares@gmail.com',
    hours: 'Dias úteis, 14h00–19h00',
    residents2011: 411,
    residents2021: 326,
    note: 'Calçada de Alpajares',
    text: 'Aldeia sobre as arribas, perto da Calçada de Alpajares, também conhecida por Calçada dos Mouros.',
  },
];

// Apoios do Município (os regulamentos estão no site atual; os montantes só onde o site os indica)
export const APOIOS = [
  { id: 'habitacao', icon: 'home', title: 'Fundo Social de Apoio à Habitação', text: 'Apoio a obras de recuperação da habitação própria e permanente de famílias com poucos recursos.', amount: 'Até 3 500 €', service: 'apoio-habitacao' },
  { id: 'bebe', icon: 'heart', title: 'Enxoval do Bebé', text: 'Apoio às famílias do concelho que têm um bebé, para os primeiros meses.', service: 'enxoval-bebe' },
  { id: 'medicacao', icon: 'doc', title: 'Apoio às despesas de medicação', text: 'Comparticipação nos medicamentos para quem tem rendimentos baixos.', service: 'apoio-medicacao' },
  { id: 'consultas', icon: 'bus', title: 'Transporte para consultas e exames', text: 'Transporte de munícipes para consultas e exames médicos fora do concelho.', service: 'transporte-consultas' },
  { id: 'estudantes', icon: 'school', title: 'Apoio ao transporte de estudantes', text: 'Para estudantes do ensino secundário e superior que estudam fora do concelho.', service: 'transporte-estudantes' },
  { id: 'agua', icon: 'leaf', title: 'Tarifário social da água', text: 'Fatura da água com preço reduzido para agregados com carência económica.', service: 'tarifario-social' },
  { id: 'cuidador', icon: 'user', title: 'Estatuto de Cuidador Informal', text: 'O Município ajuda a pedir o estatuto e a conhecer os apoios para quem cuida de um familiar.', service: 'cuidador-informal' },
  { id: 'psicologia', icon: 'chat', title: 'Gabinete de Psicologia', text: 'Acompanhamento psicológico gratuito, com marcação no serviço de ação social.', service: 'psicologia' },
];

export const EQUIPAMENTOS = [
  { id: 'biblioteca', type: 'cultura', name: 'Biblioteca Municipal António M. Monteiro Cardoso', place: 'Praça Jorge Álvares, junto à Igreja Matriz', phone: '279 653 445', text: 'Empréstimo gratuito com cartão de leitor (até 3 livros, 15 dias), sala de leitura, audiovisuais, ludoteca e espaço internet com Wi-Fi.' },
  { id: 'museu-seda', type: 'cultura', name: 'Museu da Seda e do Território', place: 'Largo do Outeiro, centro histórico', phone: '279 658 163', text: 'Aberto em 2015 na antiga Casa da Cadeia: etnografia, arqueologia, geologia e a seda feita à mão pelas artesãs, que também se vende aqui.' },
  { id: 'casa-junqueiro', type: 'cultura', name: 'Museu Regional Casa Junqueiro', place: 'Freixo de Espada à Cinta', text: 'Museu dedicado ao poeta Guerra Junqueiro e à memória da região.' },
  { id: 'casa-natal', type: 'cultura', name: 'Casa Natal de Guerra Junqueiro', place: 'Ligares', text: 'A casa onde nasceu o poeta, em 1850.' },
  { id: 'auditorio', type: 'cultura', name: 'Auditório Municipal', place: 'Freixo de Espada à Cinta', phone: '279 658 162', text: 'Espetáculos, cinema, conferências e a programação cultural do Município.' },
  { id: 'arquivo', type: 'cultura', name: 'Arquivo Municipal', place: 'Freixo de Espada à Cinta', phone: '279 652 886', text: 'Documentos históricos e administrativos do concelho, com consulta pública.' },
  { id: 'piscinas', type: 'desporto', name: 'Piscinas Municipais', place: 'Freixo de Espada à Cinta', phone: '279 653 258', text: 'Piscina descoberta para os meses de verão.' },
  { id: 'piscina-coberta', type: 'desporto', name: 'Piscinas Municipais Cobertas', place: 'Freixo de Espada à Cinta', phone: '279 658 164', text: 'Natação livre e aulas durante todo o ano.' },
  { id: 'pavilhao', type: 'desporto', name: 'Pavilhão Gimnodesportivo', place: 'Freixo de Espada à Cinta', phone: '279 653 433', text: 'Desporto escolar, clubes e aluguer para atividades.' },
  { id: 'estadio', type: 'desporto', name: 'Estádio Municipal', place: 'Freixo de Espada à Cinta', text: 'Campo de futebol para os clubes e as escolas.' },
  { id: 'turismo', type: 'servicos', name: 'Posto de Turismo', place: 'Freixo de Espada à Cinta', phone: '279 653 480', text: 'Mapas, percursos, visitas às oficinas de seda e informação sobre o concelho.' },
  { id: 'ecocentro', type: 'servicos', name: 'Ecocentro Municipal', place: 'EN 325, Lameiros dos Freixos', hours: 'Dias úteis 10h00–13h00 e 14h30–18h30 · sábado 8h30–13h30', text: 'Entrega de monos, eletrodomésticos, colchões, móveis e resíduos que não cabem no ecoponto.' },
  { id: 'mercado', type: 'servicos', name: 'Mercado Municipal', place: 'Freixo de Espada à Cinta', text: 'Produtos da terra e a feira mensal.' },
];

export const FESTAS = [
  ['Fevereiro', 'Enterro do Entrudo', 'Terça-feira de Carnaval, às 20h00, no Largo do Outeiro.'],
  ['Fev. e março', 'Feira da Amendoeira em Flor', 'Dois fins de semana de feira, com o Concurso de Ilustração Amendoeira em Flor.'],
  ['Quaresma', 'Procissão dos Sete Passos', 'À meia-noite de cada sexta-feira, ao toque do relógio da torre.'],
  ['Páscoa', 'Feriado municipal', 'Segunda-feira a seguir ao Domingo de Páscoa.'],
  ['Agosto', 'Festas da Vila e romarias', 'Festas da Vila, Festa de Mazouco e Nossa Senhora dos Montes Ermos.'],
  ['Setembro', 'São Miguel', 'Dia do padroeiro, a 29 de setembro.'],
  ['Outubro', 'Fim de Semana Gastronómico', 'Os sabores do concelho nos restaurantes da vila.'],
  ['Dezembro', 'Natal e Fogueira do Galo', 'Concursos de Natal, iluminação e a Fogueira do Galo na noite de 24.'],
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

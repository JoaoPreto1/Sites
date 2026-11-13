import bcrypt from 'bcryptjs';

const photo = (id) => `https://images.unsplash.com/photo-${id}`;
const passwordHash = bcrypt.hashSync('cepa1234', 10);

export const TYPES = [
  { slug: 'espumante', name: 'Espumantes', single: 'Espumante' },
  { slug: 'branco', name: 'Brancos', single: 'Branco' },
  { slug: 'rose', name: 'Rosés', single: 'Rosé' },
  { slug: 'tinto', name: 'Tintos', single: 'Tinto' },
  { slug: 'generoso', name: 'Generosos', single: 'Generoso' },
];

// De norte para sul, pela ordem em que aparecem no mapa
export const REGIONS = [
  { slug: 'vinho-verde', name: 'Vinho Verde', latitude: '41,8° N', soil: 'Granito e chuva atlântica', photo: photo('1693825207674-ae2ef8269be5') },
  { slug: 'douro', name: 'Douro', latitude: '41,2° N', soil: 'Xisto em socalcos', photo: photo('1603657289433-e4983d2114b9') },
  { slug: 'dao', name: 'Dão', latitude: '40,6° N', soil: 'Granito entre serras', photo: photo('1588685784073-6f2526ff8b3c') },
  { slug: 'bairrada', name: 'Bairrada', latitude: '40,4° N', soil: 'Argila e calcário', photo: photo('1537640538966-79f369143f8f') },
  { slug: 'lisboa', name: 'Lisboa', latitude: '38,8° N', soil: 'Areia de Colares e brisa do mar', photo: photo('1693318836072-776a9392b842') },
  { slug: 'alentejo', name: 'Alentejo', latitude: '38,4° N', soil: 'Planície quente e talhas de barro', photo: photo('1677477242420-44217efa1534') },
  { slug: 'madeira', name: 'Madeira', latitude: '32,7° N', soil: 'Basalto vulcânico', photo: photo('1604850849447-6435708cb130') },
];

export const DISHES = [
  { slug: 'marisco', name: 'marisco' },
  { slug: 'peixe', name: 'peixe grelhado' },
  { slug: 'polvo', name: 'polvo à lagareiro' },
  { slug: 'bacalhau', name: 'bacalhau' },
  { slug: 'leitao', name: 'leitão' },
  { slug: 'carne', name: 'carne vermelha' },
  { slug: 'caca', name: 'caça e cozidos' },
  { slug: 'queijos', name: 'uma tábua de queijos' },
  { slug: 'petiscos', name: 'petiscos' },
  { slug: 'doces', name: 'sobremesa' },
];

export const producers = [
  {
    id: 'p-fraga',
    slug: 'quinta-da-fraga-alta',
    name: 'Quinta da Fraga Alta',
    region: 'douro',
    winemaker: 'Teresa Morais',
    photo: photo('1621410163639-87c2e246aaa3'),
    portrait: photo('1669711517916-9c0767aaa08b'),
    quote: 'No Douro não se planta vinha, conquista-se. Cada socalco foi feito à mão por alguém que nunca viu a garrafa.',
    story:
      'Doze hectares de socalcos em Ervedosa do Douro, virados a norte para fugir ao calor de agosto. A Teresa voltou de Bordéus em 2011 para pegar na quinta do avô e mudou pouco: vinhas velhas misturadas, pisa a pé em lagares de granito e nada de madeira nova. Os vinhos saem tensos, mais frescos do que se espera do Douro, e pedem tempo na garrafeira.',
  },
  {
    id: 'p-lameiro',
    slug: 'casa-do-lameiro',
    name: 'Casa do Lameiro',
    region: 'vinho-verde',
    winemaker: 'Nuno e Clara Barros',
    photo: photo('1605673349837-1d83a7740e30'),
    portrait: photo('1698716206713-b2a8c7e50267'),
    quote: 'O Alvarinho de Monção tem sal. Não se explica, prova-se.',
    story:
      'Uma casa de lavoura em Monção com quatro hectares de Alvarinho em ramada e cordão. Os irmãos Barros fazem pouco vinho e guardam-no mais tempo do que manda a tradição: o Lameiro só sai para o mercado ano e meio depois da vindima.',
  },
  {
    id: 'p-penalva',
    slug: 'adega-velha-de-penalva',
    name: 'Adega Velha de Penalva',
    region: 'dao',
    winemaker: 'Joaquim Seixas',
    photo: photo('1588685784073-6f2526ff8b3c'),
    portrait: photo('1658994067420-d0236fe04482'),
    quote: 'O Dão é paciente. Um Encruzado bom só começa a falar aos cinco anos.',
    story:
      'Uma adega cooperativa dos anos 50 recuperada por três famílias de Penalva do Castelo. Vinhas a 500 metros entre a Estrela e o Caramulo, granito por baixo e noites frias, que dão vinhos elegantes, nada pesados.',
  },
  {
    id: 'p-talhas',
    slug: 'herdade-das-talhas',
    name: 'Herdade das Talhas',
    region: 'alentejo',
    winemaker: 'Manuel Carrilho',
    photo: photo('1677477242420-44217efa1534'),
    portrait: photo('1602491399287-a9b28c6ca4ec'),
    quote: 'A talha é a cuba mais antiga que existe. Os romanos já faziam assim e ninguém se queixou.',
    story:
      'Na Vidigueira, a herdade faz vinho de talha como há dois mil anos: o mosto fermenta em potes de barro de mil litros e fica com as películas até ao São Martinho. O resto da produção é clássica alentejana, mas sem excessos de madeira.',
  },
  {
    id: 'p-baga',
    slug: 'vinhas-do-baga',
    name: 'Vinhas do Baga',
    region: 'bairrada',
    winemaker: 'Inês Pato',
    photo: photo('1537640538966-79f369143f8f'),
    portrait: photo('1621409113136-51ae6dcbb7c5'),
    quote: 'A Baga é difícil em nova e generosa em velha. Como algumas pessoas.',
    story:
      'Pequeno produtor de Cantanhede especializado na casta Baga, em tintos de guarda e espumantes de método clássico que repousam três anos em cave antes do degorjamento.',
  },
  {
    id: 'p-colares',
    slug: 'adega-do-chao-de-areia',
    name: 'Adega do Chão de Areia',
    region: 'lisboa',
    winemaker: 'Rita Vaz',
    photo: photo('1693318836072-776a9392b842'),
    portrait: photo('1528823872057-9c018a7a7553'),
    quote: 'Aqui a vinha rasteja na areia por causa do vento. É a única forma de sobreviver ao Atlântico.',
    story:
      'Vinhas de Ramisco em pé franco plantadas em areia, junto à praia das Maçãs. A filoxera nunca cá chegou. Produção mínima, vinhos austeros em novos e únicos com dez anos de garrafa.',
  },
  {
    id: 'p-generosos',
    slug: 'casa-dos-generosos',
    name: 'Casa dos Generosos',
    region: 'douro',
    winemaker: 'Afonso Leal',
    photo: photo('1566467021572-37fbefe8fcb2'),
    portrait: photo('1529877612930-6e7df7e2b02f'),
    quote: 'Um tawny é o tempo engarrafado. Nós só tomamos conta das barricas.',
    story:
      'Armazém em Vila Nova de Gaia com barricas que passam de geração em geração. Engarrafam lotes pequenos de tawny e colheitas, e têm uma ligação antiga a um produtor da Madeira de quem trazem Malvasia e Sercial.',
  },
];

const wine = (data) => ({ stock: 24, featured: false, staffNote: '', ...data });

export const wines = [
  wine({
    id: 'w-01', slug: 'lameiro-alvarinho-2023', name: 'Lameiro Alvarinho', producerId: 'p-lameiro', region: 'vinho-verde', type: 'branco', year: 2023,
    grapes: ['Alvarinho'], price: 16.8, alcohol: 13, temperature: '8–10 °C', keep: 'até 2030', body: 2, acidity: 5,
    notes: 'Toranja, flor de laranjeira e um fundo salino. Boca viva, comprida, quase crocante.',
    pairings: ['marisco', 'peixe', 'polvo', 'petiscos'], shape: 'alsaciana', label: { paper: '#efe9d8', ink: '#2b4a3a' }, featured: true,
    staffNote: 'Abrir com ostras ou um arroz de lingueirão. Ainda melhor daqui a dois anos.',
  }),
  wine({
    id: 'w-02', slug: 'lameiro-loureiro-2024', name: 'Lameiro Loureiro', producerId: 'p-lameiro', region: 'vinho-verde', type: 'branco', year: 2024,
    grapes: ['Loureiro'], price: 9.9, alcohol: 11.5, temperature: '7–9 °C', keep: 'beber já', body: 1, acidity: 4,
    notes: 'Lima, louro e maçã verde. Leve, com uma ponta de agulha.',
    pairings: ['marisco', 'petiscos', 'peixe'], shape: 'alsaciana', label: { paper: '#f3efe2', ink: '#3b6b55' },
    staffNote: 'O vinho de esplanada perfeito.',
  }),
  wine({
    id: 'w-03', slug: 'fraga-alta-tinto-2019', name: 'Fraga Alta Tinto', producerId: 'p-fraga', region: 'douro', type: 'tinto', year: 2019,
    grapes: ['Touriga Nacional', 'Tinta Roriz', 'Touriga Franca'], price: 24.9, alcohol: 14, temperature: '16–18 °C', keep: 'até 2034', body: 4, acidity: 3,
    notes: 'Esteva, amora e grafite. Taninos firmes mas finos, final longo de ameixa preta.',
    pairings: ['carne', 'caca', 'queijos'], shape: 'bordalesa', label: { paper: '#ece4d4', ink: '#5c1a22' }, featured: true,
    staffNote: 'Decantar uma hora antes. Com cabrito assado é covardia.',
  }),
  wine({
    id: 'w-04', slug: 'fraga-alta-vinhas-velhas-2017', name: 'Fraga Alta Vinhas Velhas', producerId: 'p-fraga', region: 'douro', type: 'tinto', year: 2017,
    grapes: ['Mistura de 30 castas'], price: 58, alcohol: 14.5, temperature: '17–18 °C', keep: 'até 2040', body: 5, acidity: 3, stock: 6,
    notes: 'Vinhas com mais de 80 anos. Violeta, tinta da China, cacau. Enorme, mas nunca pesado.',
    pairings: ['caca', 'carne'], shape: 'bordalesa', label: { paper: '#1f1a17', ink: '#d9c39a' },
    staffNote: 'Para uma ocasião. Ou para guardar até aos 18 anos de um filho.',
  }),
  wine({
    id: 'w-05', slug: 'fraga-alta-branco-2022', name: 'Fraga Alta Branco', producerId: 'p-fraga', region: 'douro', type: 'branco', year: 2022,
    grapes: ['Rabigato', 'Viosinho', 'Gouveio'], price: 18.5, alcohol: 12.5, temperature: '10–12 °C', keep: 'até 2029', body: 3, acidity: 4,
    notes: 'Pera, erva-príncipe e pedra molhada. Branco de altitude, tenso e mineral.',
    pairings: ['bacalhau', 'peixe', 'queijos'], shape: 'borgonha', label: { paper: '#ece4d4', ink: '#7a5b2a' },
  }),
  wine({
    id: 'w-06', slug: 'penalva-encruzado-2021', name: 'Penalva Encruzado', producerId: 'p-penalva', region: 'dao', type: 'branco', year: 2021,
    grapes: ['Encruzado'], price: 21, alcohol: 13, temperature: '11–13 °C', keep: 'até 2032', body: 3, acidity: 4,
    notes: 'Casca de limão, avelã e um toque de resina. Textura cremosa e acidez muito fina.',
    pairings: ['bacalhau', 'polvo', 'queijos'], shape: 'borgonha', label: { paper: '#f2ecdf', ink: '#2c3b5a' }, featured: true,
    staffNote: 'O branco que convence quem diz que só bebe tinto.',
  }),
  wine({
    id: 'w-07', slug: 'penalva-touriga-nacional-2020', name: 'Penalva Touriga Nacional', producerId: 'p-penalva', region: 'dao', type: 'tinto', year: 2020,
    grapes: ['Touriga Nacional'], price: 19.5, alcohol: 13.5, temperature: '16–17 °C', keep: 'até 2032', body: 3, acidity: 4,
    notes: 'Violeta, bergamota e cereja. Elegante, taninos de seda, frescura de serra.',
    pairings: ['carne', 'leitao', 'caca'], shape: 'borgonha', label: { paper: '#f2ecdf', ink: '#4a2340' },
  }),
  wine({
    id: 'w-08', slug: 'penalva-jaen-2022', name: 'Penalva Jaen', producerId: 'p-penalva', region: 'dao', type: 'tinto', year: 2022,
    grapes: ['Jaen'], price: 12.5, alcohol: 13, temperature: '14–16 °C', keep: 'até 2027', body: 2, acidity: 3,
    notes: 'Morango silvestre e pimenta branca. Leve, para beber ligeiramente fresco.',
    pairings: ['petiscos', 'polvo', 'leitao'], shape: 'borgonha', label: { paper: '#f6efe3', ink: '#a33a2c' },
    staffNote: 'Tinto para o verão. Meia hora no frigorífico.',
  }),
  wine({
    id: 'w-09', slug: 'talhas-branco-de-talha-2023', name: 'Talhas Branco de Talha', producerId: 'p-talhas', region: 'alentejo', type: 'branco', year: 2023,
    grapes: ['Antão Vaz', 'Roupeiro', 'Perrum'], price: 22, alcohol: 12.5, temperature: '12–14 °C', keep: 'até 2028', body: 3, acidity: 3,
    notes: 'Feito em potes de barro, com as películas. Âmbar claro, casca de laranja, chá e mel seco.',
    pairings: ['petiscos', 'queijos', 'bacalhau'], shape: 'borgonha', label: { paper: '#e9dcc4', ink: '#8a4b1f' }, featured: true,
    staffNote: 'Não é para toda a gente. É para quem já provou tudo.',
  }),
  wine({
    id: 'w-10', slug: 'talhas-tinto-2021', name: 'Talhas Tinto', producerId: 'p-talhas', region: 'alentejo', type: 'tinto', year: 2021,
    grapes: ['Alicante Bouschet', 'Trincadeira', 'Aragonez'], price: 14.9, alcohol: 14, temperature: '16–18 °C', keep: 'até 2028', body: 4, acidity: 2,
    notes: 'Fruta preta madura, alfarroba e especiarias. Redondo, generoso, fácil de gostar.',
    pairings: ['carne', 'caca', 'leitao'], shape: 'bordalesa', label: { paper: '#e9dcc4', ink: '#3e1a1a' },
  }),
  wine({
    id: 'w-11', slug: 'talhas-rose-2024', name: 'Talhas Rosé', producerId: 'p-talhas', region: 'alentejo', type: 'rose', year: 2024,
    grapes: ['Aragonez', 'Touriga Nacional'], price: 10.5, alcohol: 12.5, temperature: '8–10 °C', keep: 'beber já', body: 2, acidity: 3,
    notes: 'Cor de casca de cebola. Groselha, melancia e um final seco, nada doce.',
    pairings: ['petiscos', 'peixe', 'marisco'], shape: 'alsaciana', label: { paper: '#f6e9e2', ink: '#b04a4a' },
  }),
  wine({
    id: 'w-12', slug: 'baga-espumante-bruto-natural-2019', name: 'Baga Bruto Natural', producerId: 'p-baga', region: 'bairrada', type: 'espumante', year: 2019,
    grapes: ['Baga', 'Maria Gomes'], price: 19.9, alcohol: 12, temperature: '6–8 °C', keep: 'até 2028', body: 2, acidity: 5,
    notes: 'Método clássico, 36 meses em cave. Brioche, maçã reineta e bolha fina.',
    pairings: ['leitao', 'marisco', 'petiscos'], shape: 'espumante', label: { paper: '#f4efe6', ink: '#1f1a17' }, featured: true,
    staffNote: 'Leitão da Bairrada com espumante da Bairrada. Há regras que não se quebram.',
  }),
  wine({
    id: 'w-13', slug: 'baga-rose-espumante-2021', name: 'Baga Rosé Espumante', producerId: 'p-baga', region: 'bairrada', type: 'espumante', year: 2021,
    grapes: ['Baga'], price: 16.5, alcohol: 12, temperature: '6–8 °C', keep: 'até 2026', body: 2, acidity: 4,
    notes: 'Morango, framboesa e massa de pão. Seco e alegre.',
    pairings: ['petiscos', 'doces', 'marisco'], shape: 'espumante', label: { paper: '#f6e4e0', ink: '#8c2f3f' },
  }),
  wine({
    id: 'w-14', slug: 'baga-classico-2015', name: 'Baga Clássico', producerId: 'p-baga', region: 'bairrada', type: 'tinto', year: 2015,
    grapes: ['Baga'], price: 32, alcohol: 13, temperature: '16–18 °C', keep: 'até 2035', body: 4, acidity: 5, stock: 9,
    notes: 'Já com dez anos: cereja ácida, couro, chá preto e caruma. Taninos ainda vivos.',
    pairings: ['leitao', 'caca', 'queijos'], shape: 'borgonha', label: { paper: '#efe7d6', ink: '#2a2a2a' },
    staffNote: 'Prova de que a Baga precisa de tempo. Este já o teve.',
  }),
  wine({
    id: 'w-15', slug: 'chao-de-areia-ramisco-2016', name: 'Chão de Areia Ramisco', producerId: 'p-colares', region: 'lisboa', type: 'tinto', year: 2016,
    grapes: ['Ramisco'], price: 42, alcohol: 12, temperature: '15–16 °C', keep: 'até 2045', body: 3, acidity: 5, stock: 8,
    notes: 'Colares em pé franco. Iodo, cereja ácida, terra húmida. Austero e inesquecível.',
    pairings: ['polvo', 'caca', 'bacalhau'], shape: 'borgonha', label: { paper: '#e6e1d3', ink: '#2f4858' },
    staffNote: 'Um dos vinhos mais raros do país. Peça-nos para lho guardarmos.',
  }),
  wine({
    id: 'w-16', slug: 'chao-de-areia-malvasia-2022', name: 'Chão de Areia Malvasia', producerId: 'p-colares', region: 'lisboa', type: 'branco', year: 2022,
    grapes: ['Malvasia de Colares'], price: 26, alcohol: 12, temperature: '10–12 °C', keep: 'até 2032', body: 3, acidity: 4,
    notes: 'Flor de camomila, salmoura e marmelo. Tem o mar dentro.',
    pairings: ['marisco', 'peixe', 'polvo'], shape: 'borgonha', label: { paper: '#e6e1d3', ink: '#476a74' },
  }),
  wine({
    id: 'w-17', slug: 'generosos-tawny-10-anos', name: 'Tawny 10 Anos', producerId: 'p-generosos', region: 'douro', type: 'generoso', year: null,
    grapes: ['Touriga Franca', 'Tinta Roriz', 'Tinta Barroca'], price: 22.5, alcohol: 20, temperature: '12–14 °C', keep: 'meses depois de aberto', body: 4, acidity: 3,
    notes: 'Noz, figo seco, casca de laranja cristalizada. Doce mas nunca enjoativo.',
    pairings: ['doces', 'queijos'], shape: 'porto', label: { paper: '#f0e3c8', ink: '#6b3416' }, featured: true,
    staffNote: 'Ligeiramente fresco, com um pastel de nata. Experimente.',
  }),
  wine({
    id: 'w-18', slug: 'generosos-tawny-20-anos', name: 'Tawny 20 Anos', producerId: 'p-generosos', region: 'douro', type: 'generoso', year: null,
    grapes: ['Vinhas velhas do Cima Corgo'], price: 54, alcohol: 20, temperature: '12–14 °C', keep: 'meses depois de aberto', body: 4, acidity: 4,
    notes: 'Caramelo salgado, avelã torrada, especiarias. Final que não acaba.',
    pairings: ['doces', 'queijos'], shape: 'porto', label: { paper: '#1f1a17', ink: '#d6b77a' },
  }),
  wine({
    id: 'w-19', slug: 'generosos-colheita-2005', name: 'Colheita', producerId: 'p-generosos', region: 'douro', type: 'generoso', year: 2005,
    grapes: ['Lote de casta misturada'], price: 68, alcohol: 20, temperature: '13–14 °C', keep: 'meses depois de aberto', body: 5, acidity: 4, stock: 5,
    notes: 'Vinte anos em barrica de um só ano. Iodo, café, laranja amarga.',
    pairings: ['doces', 'queijos'], shape: 'porto', label: { paper: '#efe2c6', ink: '#3d2414' },
    staffNote: 'Bom presente para quem nasceu em 2005.',
  }),
  wine({
    id: 'w-20', slug: 'generosos-madeira-sercial-10-anos', name: 'Madeira Sercial 10 Anos', producerId: 'p-generosos', region: 'madeira', type: 'generoso', year: null,
    grapes: ['Sercial'], price: 36, alcohol: 19, temperature: '11–13 °C', keep: 'anos depois de aberto', body: 3, acidity: 5,
    notes: 'Seco. Amêndoa, casca de limão, iodo. Acidez elétrica que limpa tudo.',
    pairings: ['petiscos', 'queijos', 'marisco'], shape: 'porto', label: { paper: '#f2ead6', ink: '#24433d' },
    staffNote: 'Como aperitivo, gelado, antes de um jantar comprido.',
  }),
  wine({
    id: 'w-21', slug: 'generosos-madeira-malvasia-15-anos', name: 'Madeira Malvasia 15 Anos', producerId: 'p-generosos', region: 'madeira', type: 'generoso', year: null,
    grapes: ['Malvasia'], price: 48, alcohol: 19, temperature: '14–16 °C', keep: 'anos depois de aberto', body: 5, acidity: 4,
    notes: 'Doce e rico: tâmara, melaço, café. A acidez da Madeira equilibra tudo.',
    pairings: ['doces'], shape: 'porto', label: { paper: '#f2ead6', ink: '#5a2a1a' },
  }),
  wine({
    id: 'w-22', slug: 'fraga-alta-rose-2024', name: 'Fraga Alta Rosé', producerId: 'p-fraga', region: 'douro', type: 'rose', year: 2024,
    grapes: ['Touriga Nacional', 'Tinta Roriz'], price: 13.5, alcohol: 12.5, temperature: '8–10 °C', keep: 'até 2026', body: 2, acidity: 4,
    notes: 'Pétalas de rosa, romã e pimenta-rosa. Seco, com boa estrutura para a mesa.',
    pairings: ['peixe', 'petiscos', 'polvo'], shape: 'bordalesa', label: { paper: '#f6e9e2', ink: '#9a3b4b' },
  }),
  wine({
    id: 'w-23', slug: 'lameiro-espumante-alvarinho-2020', name: 'Lameiro Espumante Alvarinho', producerId: 'p-lameiro', region: 'vinho-verde', type: 'espumante', year: 2020,
    grapes: ['Alvarinho'], price: 21.5, alcohol: 12, temperature: '6–8 °C', keep: 'até 2027', body: 2, acidity: 5,
    notes: 'Tosta, limão confitado e bolha muito fina. Final salino.',
    pairings: ['marisco', 'peixe', 'petiscos'], shape: 'espumante', label: { paper: '#efe9d8', ink: '#2b4a3a' },
  }),
  wine({
    id: 'w-24', slug: 'talhas-reserva-2019', name: 'Talhas Reserva', producerId: 'p-talhas', region: 'alentejo', type: 'tinto', year: 2019,
    grapes: ['Alicante Bouschet', 'Tinta Grossa'], price: 29, alcohol: 14.5, temperature: '17–18 °C', keep: 'até 2033', body: 5, acidity: 3,
    notes: 'Tinta Grossa da Vidigueira, rara. Ameixa, chocolate amargo, esteva. Profundo.',
    pairings: ['carne', 'caca', 'queijos'], shape: 'bordalesa', label: { paper: '#1f1a17', ink: '#c9a46a' },
  }),
];

export const CLUB_PLANS = [
  { slug: 'tres', name: 'Três garrafas', bottles: 3, price: 39, discount: 5, description: 'Três vinhos do dia a dia escolhidos pelo escanção, com notas de prova e sugestões para a mesa.' },
  { slug: 'seis', name: 'Seis garrafas', bottles: 6, price: 74, discount: 10, description: 'Seis vinhos, dois de cada região do mês. Inclui um vinho de guarda por trimestre.' },
  { slug: 'colecao', name: 'Coleção', bottles: 3, price: 119, discount: 15, description: 'Três vinhos de produção mínima ou com idade, que raramente chegam às prateleiras.' },
];

export const clubBoxes = [
  {
    id: 'box-2026-12',
    month: '2026-12',
    title: 'Dezembro: vinhos para a consoada',
    intro: 'Bacalhau, polvo e rabanadas. Escolhemos três vinhos que aguentam a mesa toda de Natal sem cansar.',
    picks: [
      { wineId: 'w-06', note: 'Para o bacalhau cozido com todos. A textura do Encruzado abraça o azeite.' },
      { wineId: 'w-15', note: 'Para o polvo, se a família for corajosa. Se não for, fica mais para si.' },
      { wineId: 'w-17', note: 'Para as rabanadas e para a conversa depois da meia-noite.' },
    ],
  },
  {
    id: 'box-2026-11',
    month: '2026-11',
    title: 'Novembro: o Dão no outono',
    intro: 'Castanhas, cogumelos e a primeira lareira do ano.',
    picks: [
      { wineId: 'w-08', note: 'Para petiscar enquanto as castanhas assam.' },
      { wineId: 'w-07', note: 'Para um arroz de cogumelos ou umas costeletas.' },
      { wineId: 'w-05', note: 'Um branco de altitude para quem ainda não largou o peixe.' },
    ],
  },
  {
    id: 'box-2026-10',
    month: '2026-10',
    title: 'Outubro: depois da vindima',
    intro: 'Três vinhos de produtores que acabámos de visitar no fim da vindima.',
    picks: [
      { wineId: 'w-03', note: 'O tinto da Teresa, a abrir uma hora antes.' },
      { wineId: 'w-01', note: 'O Alvarinho que bebemos na adega, ainda a cheirar a mosto.' },
      { wineId: 'w-12', note: 'Para brindar a mais uma vindima.' },
    ],
  },
];

export const tastings = [
  {
    id: 't-douro', slug: 'douro-em-altitude', title: 'Douro em altitude', date: '2026-11-21', time: '19:00', seats: 12, price: 35,
    host: 'Teresa Morais, Quinta da Fraga Alta', photo: photo('1603657289479-14ada3bb33a3'),
    description: 'Os vinhos do Douro de vinhas acima dos 500 metros, mais frescos do que a fama. A Teresa traz amostras de barrica que ainda não estão à venda.',
    wineIds: ['w-05', 'w-22', 'w-03', 'w-04'],
  },
  {
    id: 't-baga', slug: 'leitao-e-baga', title: 'Leitão e Baga', date: '2026-11-28', time: '20:00', seats: 16, price: 45,
    host: 'Inês Pato, Vinhas do Baga', photo: photo('1764236307312-6ead0505ad3a'),
    description: 'Jantar à mesa comprida com leitão da Mealhada e cinco vinhos da Bairrada, do espumante ao Baga com dez anos.',
    wineIds: ['w-12', 'w-13', 'w-14'],
  },
  {
    id: 't-generosos', slug: 'tawnies-e-colheitas', title: 'Tawnies e colheitas', date: '2026-12-06', time: '17:00', seats: 10, price: 55,
    host: 'Afonso Leal, Casa dos Generosos', photo: photo('1767510533188-719c5f9ab4dd'),
    description: 'Uma tarde a comparar o tempo: do tawny de 10 anos à colheita de 2005, com queijos da Serra e doces conventuais.',
    wineIds: ['w-17', 'w-18', 'w-19', 'w-21'],
  },
  {
    id: 't-mar', slug: 'vinhos-com-mar', title: 'Vinhos com mar', date: '2026-12-12', time: '19:30', seats: 14, price: 38,
    host: 'Equipa da Cepa', photo: photo('1782174177406-d36704027953'),
    description: 'Alvarinho, Malvasia de Colares e Sercial da Madeira, três vinhos atlânticos, com ostras e marisco da lota.',
    wineIds: ['w-01', 'w-16', 'w-20', 'w-23'],
  },
];

export const users = [
  { id: 'u-marta', name: 'Marta Antunes', email: 'cliente@cepa.pt', birthDate: '1988-04-12', phone: '912 345 678', address: 'Rua de Cedofeita 120, 2.º', postalCode: '4050-174', city: 'Porto', role: 'cliente', passwordHash, createdAt: '2025-06-02T10:00:00.000Z' },
  { id: 'u-rui', name: 'Rui Teixeira', email: 'socio@cepa.pt', birthDate: '1979-09-30', phone: '936 222 111', address: 'Av. da Boavista 900, 5.º Esq.', postalCode: '4100-112', city: 'Porto', role: 'cliente', passwordHash, createdAt: '2024-02-20T10:00:00.000Z' },
  { id: 'u-admin', name: 'Helena Cepa', email: 'admin@cepa.pt', birthDate: '1975-01-15', phone: '', address: '', postalCode: '', city: '', role: 'admin', passwordHash, createdAt: '2023-01-01T10:00:00.000Z' },
];

export const subscriptions = [
  { id: 's-rui', userId: 'u-rui', plan: 'seis', preference: 'misto', status: 'ativa', since: '2024-03-01', createdAt: '2024-02-20T10:00:00.000Z' },
];

export const reservations = [
  { id: 'r-1', tastingId: 't-douro', userId: 'u-rui', people: 2, createdAt: '2026-11-02T18:00:00.000Z' },
  { id: 'r-2', tastingId: 't-douro', userId: 'u-marta', people: 1, createdAt: '2026-11-05T12:00:00.000Z' },
  { id: 'r-3', tastingId: 't-baga', userId: 'u-rui', people: 4, createdAt: '2026-11-06T12:00:00.000Z' },
  { id: 'r-4', tastingId: 't-generosos', userId: 'u-marta', people: 2, createdAt: '2026-11-08T12:00:00.000Z' },
];

export const orders = [
  {
    id: 'o-1', code: 'CP-7Q2M', userId: 'u-marta', status: 'entregue', createdAt: '2026-10-14T19:20:00.000Z',
    items: [{ wineId: 'w-01', name: 'Lameiro Alvarinho 2023', price: 16.8, quantity: 2 }, { wineId: 'w-08', name: 'Penalva Jaen 2022', price: 12.5, quantity: 3 }],
    delivery: { method: 'envio', address: 'Rua de Cedofeita 120, 2.º', postalCode: '4050-174', city: 'Porto' },
    subtotal: 71.1, discount: 0, shipping: 0, total: 71.1,
  },
  {
    id: 'o-2', code: 'CP-K4WD', userId: 'u-rui', status: 'em preparação', createdAt: '2026-11-11T09:10:00.000Z',
    items: [{ wineId: 'w-14', name: 'Baga Clássico 2015', price: 32, quantity: 2 }],
    delivery: { method: 'loja' },
    subtotal: 64, discount: 6.4, shipping: 0, total: 57.6,
  },
  {
    id: 'o-3', code: 'CP-3HXA', userId: 'u-marta', status: 'recebida', createdAt: '2026-11-12T16:40:00.000Z',
    items: [{ wineId: 'w-12', name: 'Baga Bruto Natural 2019', price: 19.9, quantity: 1 }, { wineId: 'w-17', name: 'Tawny 10 Anos', price: 22.5, quantity: 1 }],
    delivery: { method: 'envio', address: 'Rua de Cedofeita 120, 2.º', postalCode: '4050-174', city: 'Porto' },
    subtotal: 42.4, discount: 0, shipping: 5.9, total: 48.3,
  },
];

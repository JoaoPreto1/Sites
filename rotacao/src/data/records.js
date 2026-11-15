// Os discos da loja. As capas, as faixas e as pré-escutas vêm do iTunes (ver scripts/catalogo.js);
// o resto é da loja: estado, prensagem, preço, stock e a nota de quem o ouviu.

export const CRATES = [
  { slug: 'jazz', name: 'Jazz' },
  { slug: 'soul', name: 'Soul & Funk' },
  { slug: 'rock', name: 'Rock' },
  { slug: 'portugal', name: 'Fado & Portugal' },
  { slug: 'mundo', name: 'Brasil & Mundo' },
  { slug: 'pop', name: 'Pop & Electrónica' },
];

// Estado da capa e do disco, do melhor para o pior
export const GRADES = [
  { code: 'M', name: 'Selado', note: 'Ainda dentro do plástico.' },
  { code: 'NM', name: 'Como novo', note: 'Parece que nunca saiu da capa.' },
  { code: 'VG+', name: 'Muito bom', note: 'Marcas leves, toca limpo.' },
  { code: 'VG', name: 'Bom', note: 'Estala aqui e ali. Faz parte.' },
  { code: 'G', name: 'Gasto', note: 'Para ouvir, não para mostrar.' },
];

export const RECORDS = [
  {
    id: 'kind-of-blue', itunesId: 268443092, crate: 'jazz', artist: 'Miles Davis', title: 'Kind of Blue', year: 1959, label: 'Columbia',
    pressing: 'Reedição de 180 g', sleeve: 'NM', media: 'NM', price: 32, stock: 3, color: '#1f4e8c', featured: true, arrivedAt: '2026-11-12',
    note: 'O disco que entra em todas as casas e nunca mais sai. Põe o "So What" com o volume a meio e a luz baixa.',
  },
  {
    id: 'a-love-supreme', itunesId: 1440713018, crate: 'jazz', artist: 'John Coltrane', title: 'A Love Supreme', year: 1965, label: 'Impulse!',
    pressing: 'Reedição Impulse! de 2022', sleeve: 'M', media: 'M', price: 29, stock: 2, color: '#e86a1c', arrivedAt: '2026-11-10',
    note: 'Quatro partes, meia hora, uma oração. Não é disco para pôr de fundo, é disco para te sentares.',
  },
  {
    id: 'time-out', itunesId: 193085545, crate: 'jazz', artist: 'The Dave Brubeck Quartet', title: 'Time Out', year: 1959, label: 'Columbia',
    pressing: 'Prensagem europeia de 1975', sleeve: 'VG+', media: 'NM', price: 24, stock: 1, color: '#c43b2d', arrivedAt: '2026-11-03',
    note: 'Compassos esquisitos que soam simples. O "Take Five" está em cinco tempos e ninguém dá por isso.',
  },
  {
    id: 'chet-baker-sings', itunesId: 1440864756, crate: 'jazz', artist: 'Chet Baker', title: 'Chet Baker Sings', year: 1954, label: 'Pacific Jazz',
    pressing: 'Reedição japonesa de 1983, com obi', sleeve: 'VG', media: 'VG+', price: 38, stock: 1, color: '#d9a441', arrivedAt: '2026-11-14',
    note: 'A voz mais calma do jazz, quase a falar. A edição japonesa traz a faixa de papel original na lombada.',
  },
  {
    id: 'little-girl-blue', itunesId: 1436705314, crate: 'jazz', artist: 'Nina Simone', title: 'Little Girl Blue', year: 1959, label: 'Bethlehem',
    pressing: 'Reedição de 2021', sleeve: 'NM', media: 'NM', price: 27, stock: 2, color: '#3d7a5c', arrivedAt: '2026-10-28',
    note: 'O primeiro disco dela, gravado num dia só. Ouve a mão esquerda no piano do "My Baby Just Cares for Me".',
  },
  {
    id: 'whats-going-on', itunesId: 1538081586, crate: 'soul', artist: 'Marvin Gaye', title: "What's Going On", year: 1971, label: 'Tamla',
    pressing: 'Prensagem europeia de 1977', sleeve: 'VG+', media: 'VG+', price: 30, stock: 1, color: '#2a6fb0', featured: true, arrivedAt: '2026-11-13',
    note: 'Um disco inteiro sem pausas entre as faixas, como uma conversa que não se consegue interromper.',
  },
  {
    id: 'songs-in-the-key-of-life', itunesId: 1440788438, crate: 'soul', artist: 'Stevie Wonder', title: 'Songs in the Key of Life', year: 1976, label: 'Tamla',
    pressing: 'Duplo, com o EP de 7" e o livreto', sleeve: 'VG+', media: 'VG', price: 45, stock: 1, color: '#e0b43a', arrivedAt: '2026-11-08',
    note: 'Dois discos e um EP, e não há uma faixa a mais. Se só puderes ter um disco de soul, é este.',
  },
  {
    id: 'back-to-black', itunesId: 1440856219, crate: 'soul', artist: 'Amy Winehouse', title: 'Back to Black', year: 2006, label: 'Island',
    pressing: 'Reedição de 180 g', sleeve: 'M', media: 'M', price: 31, stock: 4, color: '#b3262f', featured: true, arrivedAt: '2026-11-11',
    note: 'Soul dos anos sessenta gravado em 2006, com os Dap-Kings a tocar como se estivessem numa cave em Nova Iorque.',
  },
  {
    id: 'purple-rain', itunesId: 1746833068, crate: 'soul', artist: 'Prince & The Revolution', title: 'Purple Rain', year: 1984, label: 'Warner Bros.',
    pressing: 'Prensagem europeia de 1984, com o poster', sleeve: 'VG+', media: 'NM', price: 34, stock: 1, color: '#6b3fa0', arrivedAt: '2026-10-30',
    note: 'Funk, rock e uma balada de oito minutos ao vivo. O poster vem dobrado, como saiu da fábrica.',
  },
  {
    id: 'wish-you-were-here', itunesId: 1065973975, crate: 'rock', artist: 'Pink Floyd', title: 'Wish You Were Here', year: 1975, label: 'Harvest',
    pressing: 'Prensagem inglesa de 1975', sleeve: 'VG', media: 'VG+', price: 42, stock: 1, color: '#2f2f2f', featured: true, arrivedAt: '2026-11-09',
    note: 'Cinco faixas e uma delas ocupa os dois lados. Disco para ouvir de uma ponta à outra, sem saltar.',
  },
  {
    id: 'rumours', itunesId: 594061854, crate: 'rock', artist: 'Fleetwood Mac', title: 'Rumours', year: 1977, label: 'Warner Bros.',
    pressing: 'Reedição de 2019', sleeve: 'NM', media: 'NM', price: 28, stock: 3, color: '#9b6a3c', arrivedAt: '2026-11-05',
    note: 'Uma banda a separar-se e a gravar as melhores canções que alguma vez fez. Ao mesmo tempo.',
  },
  {
    id: 'abbey-road', itunesId: 1441164426, crate: 'rock', artist: 'The Beatles', title: 'Abbey Road', year: 1969, label: 'Apple',
    pressing: 'Prensagem portuguesa de 1969', sleeve: 'VG+', media: 'VG+', price: 48, stock: 1, color: '#7cae55', arrivedAt: '2026-11-14',
    note: 'O lado B é uma só peça de dezasseis minutos. Esta cópia veio de uma casa em Alvalade e tocou pouco.',
  },
  {
    id: 'a-night-at-the-opera', itunesId: 6781023399, crate: 'rock', artist: 'Queen', title: 'A Night at the Opera', year: 1975, label: 'EMI',
    pressing: 'Capa aberta, prensagem inglesa', sleeve: 'VG', media: 'VG', price: 26, stock: 1, color: '#d4c3a3', arrivedAt: '2026-10-25',
    note: 'O disco do "Bohemian Rhapsody", com ópera, music-hall e hard rock no mesmo lado.',
  },
  {
    id: 'ziggy-stardust', itunesId: 1039796877, crate: 'rock', artist: 'David Bowie', title: 'The Rise and Fall of Ziggy Stardust', year: 1972, label: 'RCA',
    pressing: 'Reedição de 2016', sleeve: 'NM', media: 'NM', price: 29, stock: 2, color: '#d64b2a', arrivedAt: '2026-11-02',
    note: 'Na contracapa diz para tocar no volume máximo. Nós concordamos, mas os vizinhos de cima não.',
  },
  {
    id: 'ok-computer', itunesId: 1097861387, crate: 'rock', artist: 'Radiohead', title: 'OK Computer', year: 1997, label: 'Parlophone',
    pressing: 'Duplo, reedição XL de 2016', sleeve: 'M', media: 'M', price: 36, stock: 2, color: '#8fb6c9', arrivedAt: '2026-11-07',
    note: 'Os anos noventa a perceberem que o futuro ia ser estranho. Continua a soar a amanhã.',
  },
  {
    id: 'thriller', itunesId: 269572838, crate: 'pop', artist: 'Michael Jackson', title: 'Thriller', year: 1982, label: 'Epic',
    pressing: 'Prensagem europeia de 1982, capa aberta', sleeve: 'VG+', media: 'NM', price: 25, stock: 2, color: '#e8e2d4', featured: true, arrivedAt: '2026-11-06',
    note: 'Nove faixas, sete singles. Põe o "Billie Jean" e repara no baixo, que nunca muda.',
  },
  {
    id: 'discovery', itunesId: 697194953, crate: 'pop', artist: 'Daft Punk', title: 'Discovery', year: 2001, label: 'Virgin',
    pressing: 'Duplo, 2.ª prensagem', sleeve: 'NM', media: 'NM', price: 44, stock: 1, color: '#3b74c4', arrivedAt: '2026-11-12',
    note: 'Disco sound filtrado por dois franceses com capacetes. Ninguém fica parado no "One More Time".',
  },
  {
    id: 'random-access-memories', itunesId: 617154241, crate: 'pop', artist: 'Daft Punk', title: 'Random Access Memories', year: 2013, label: 'Columbia',
    pressing: 'Duplo, 180 g', sleeve: 'M', media: 'M', price: 39, stock: 2, color: '#b8a77a', arrivedAt: '2026-10-29',
    note: 'Gravado com músicos a sério e sem samples, como nos anos setenta. Soa lindamente em vinil.',
  },
  {
    id: 'mezzanine', itunesId: 724466069, crate: 'pop', artist: 'Massive Attack', title: 'Mezzanine', year: 1998, label: 'Virgin',
    pressing: 'Duplo, reedição de 2018', sleeve: 'NM', media: 'NM', price: 33, stock: 1, color: '#55606b', arrivedAt: '2026-11-04',
    note: 'Bristol à noite. O baixo do "Angel" pede uma coluna a sério e uma sala às escuras.',
  },
  {
    id: 'com-que-voz', itunesId: 1451641624, crate: 'portugal', artist: 'Amália Rodrigues', title: 'Com Que Voz', year: 1970, label: 'Columbia',
    pressing: 'Prensagem portuguesa de 1970', sleeve: 'VG', media: 'VG+', price: 35, stock: 1, color: '#8c1c2b', featured: true, arrivedAt: '2026-11-13',
    note: 'Poemas de Camões, O\'Neill e Ary dos Santos com música de Alain Oulman. Muita gente diz que é o melhor disco de fado.',
  },
  {
    id: 'cantigas-do-maio', itunesId: 1806613668, crate: 'portugal', artist: 'José Afonso', title: 'Cantigas do Maio', year: 1971, label: 'Orfeu',
    pressing: 'Reedição Orfeu', sleeve: 'VG+', media: 'VG+', price: 28, stock: 2, color: '#c9302c', arrivedAt: '2026-11-01',
    note: 'Gravado em França em 1971, com o "Grândola, Vila Morena" lá no meio. Três anos depois, um país inteiro sabia-o de cor.',
  },
  {
    id: 'existir', itunesId: 696885676, crate: 'portugal', artist: 'Madredeus', title: 'Existir', year: 1990, label: 'EMI-Valentim de Carvalho',
    pressing: 'Prensagem original de 1990', sleeve: 'NM', media: 'NM', price: 26, stock: 1, color: '#6d8fa3', arrivedAt: '2026-10-27',
    note: 'Lisboa vista do rio, com a voz da Teresa Salgueiro por cima de tudo. Música para domingos de manhã.',
  },
  {
    id: 'guitarra-portuguesa', itunesId: 1394667277, crate: 'portugal', artist: 'Carlos Paredes', title: 'Guitarra Portuguesa', year: 1967, label: 'Columbia',
    pressing: 'Reedição', sleeve: 'VG+', media: 'NM', price: 30, stock: 1, color: '#a6772f', arrivedAt: '2026-11-10',
    note: 'Só guitarra portuguesa e viola, e chega para encher a sala. Os "Verdes Anos" ouvidos em vinil são outra coisa.',
  },
  {
    id: 'elis-e-tom', itunesId: 1438430508, crate: 'mundo', artist: 'Elis Regina & Tom Jobim', title: 'Elis & Tom', year: 1974, label: 'Philips',
    pressing: 'Prensagem brasileira de 1974', sleeve: 'VG+', media: 'NM', price: 40, stock: 1, color: '#e2b04a', featured: true, arrivedAt: '2026-11-11',
    note: 'Gravado em Los Angeles, com o Tom ao piano e a Elis a cantar como quem ri. O "Águas de Março" é este.',
  },
  {
    id: 'africa-brasil', itunesId: 1444050820, crate: 'mundo', artist: 'Jorge Ben', title: 'África Brasil', year: 1976, label: 'Philips',
    pressing: 'Reedição de 2015', sleeve: 'NM', media: 'NM', price: 29, stock: 2, color: '#2f8f5b', arrivedAt: '2026-11-03',
    note: 'Samba com guitarra elétrica e funk por baixo. O "Taj Mahal" original, antes de toda a gente o copiar.',
  },
  {
    id: 'buena-vista-social-club', itunesId: 1716598034, crate: 'mundo', artist: 'Buena Vista Social Club', title: 'Buena Vista Social Club', year: 1997, label: 'World Circuit',
    pressing: 'Duplo, reedição', sleeve: 'NM', media: 'NM', price: 34, stock: 2, color: '#c26a3a', arrivedAt: '2026-10-31',
    note: 'Músicos cubanos esquecidos durante décadas, juntos numa sala em Havana durante seis dias.',
  },
  {
    id: 'miss-perfumado', itunesId: 1857941789, crate: 'mundo', artist: 'Cesária Évora', title: 'Miss Perfumado', year: 1992, label: 'Lusafrica',
    pressing: 'Prensagem francesa de 1992', sleeve: 'VG+', media: 'VG+', price: 27, stock: 1, color: '#3a8fb7', arrivedAt: '2026-11-06',
    note: 'Mornas de Cabo Verde cantadas descalça. O "Sodade" vale o disco todo, e o resto também.',
  },
  {
    id: 'exodus', itunesId: 1625213430, crate: 'mundo', artist: 'Bob Marley & The Wailers', title: 'Exodus', year: 1977, label: 'Island',
    pressing: 'Prensagem europeia de 1977', sleeve: 'VG+', media: 'VG', price: 32, stock: 1, color: '#d4a62a', arrivedAt: '2026-11-08',
    note: 'Gravado em Londres, longe da Jamaica. O lado B tem quatro clássicos seguidos.',
  },
];

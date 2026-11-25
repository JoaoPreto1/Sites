import bcrypt from 'bcryptjs';

// Dados de exemplo, todos inventados. As datas são calculadas a partir de hoje
// para que a demonstração pareça sempre atual.
const DAY = 24 * 60 * 60 * 1000;
const at = (days, hour = 10, minute = 0) => {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};
const day = (days) => at(days).slice(0, 10);

const CLIENT_PASS = bcrypt.hashSync('pilha-cliente-2026', 10);
const STUDIO_PASS = bcrypt.hashSync('pilha-estudio-2026', 10);

export const users = [
  { id: 'u-ines', name: 'Inês Barata', email: 'ines@pilha.exemplo', role: 'estudio', active: true, passwordHash: STUDIO_PASS, createdAt: at(-900) },
  { id: 'u-tomas', name: 'Tomás Valente', email: 'tomas@pilha.exemplo', role: 'estudio', active: true, passwordHash: STUDIO_PASS, createdAt: at(-700) },
  { id: 'u-teatro', name: 'Joana Freitas', company: 'Teatro do Largo', email: 'teatro@cliente.exemplo', role: 'cliente', active: true, passwordHash: CLIENT_PASS, createdAt: at(-64) },
  { id: 'u-lota', name: 'Henrique Lobo', company: 'Lota Velha', email: 'lota@cliente.exemplo', role: 'cliente', active: true, passwordHash: CLIENT_PASS, createdAt: at(-300) },
  { id: 'u-sotao', name: 'Marta Cordeiro', company: 'Livraria Sótão', email: 'sotao@cliente.exemplo', role: 'cliente', active: true, passwordHash: CLIENT_PASS, createdAt: at(-9) },
];

const phases = (due) => due.map(([key, days, done]) => ({ key, due: day(days), doneAt: done ? at(days - 1, 17) : null }));

export const projects = [
  {
    id: 'p-teatro',
    title: 'Site e bilheteira do Teatro do Largo',
    clientId: 'u-teatro',
    service: 'sites',
    phase: 'provas',
    lead: 'Inês Barata',
    summary: 'Site novo com a programação da temporada, bilheteira ligada ao sistema que o teatro já usa e uma área para escolas.',
    onTable: 'o site de um teatro de bairro, com bilheteira',
    phases: phases([['briefing', -60, true], ['proposta', -50, true], ['esbocos', -30, true], ['provas', 6], ['artes-finais', 20], ['entregue', 28]]),
    createdAt: at(-62),
  },
  {
    id: 'p-lota',
    title: 'Latas de Natal da Lota Velha',
    clientId: 'u-lota',
    service: 'rotulos',
    phase: 'esbocos',
    lead: 'Rui Paixão',
    summary: 'Edição limitada de três latas para o Natal, com ilustração e uma cinta de papel a juntar as três.',
    onTable: 'rótulos de Natal para uma conserveira de Matosinhos',
    phases: phases([['briefing', -21, true], ['proposta', -15, true], ['esbocos', 3], ['provas', 10], ['artes-finais', 16], ['entregue', 22]]),
    createdAt: at(-22),
  },
  {
    id: 'p-sotao',
    title: 'Marca da Livraria Sótão',
    clientId: 'u-sotao',
    service: 'marcas',
    phase: 'proposta',
    lead: 'Inês Barata',
    summary: 'Nome já decidido; falta tudo o resto. Livraria de usados num primeiro andar, com sessões de leitura ao sábado.',
    onTable: 'a marca de uma livraria de usados num primeiro andar',
    phases: phases([['briefing', -6, true], ['proposta', 2], ['esbocos', 16], ['provas', 30], ['artes-finais', 40], ['entregue', 46]]),
    createdAt: at(-8),
  },
];

export const proofs = [
  { id: 'pr-1', projectId: 'p-teatro', title: 'Página inicial', version: 1, image: '/img/provas/teatro-inicio-1', note: 'Primeira versão da página inicial com o cartaz da temporada em destaque.', status: 'alteracoes', clientComment: 'Gostamos muito, mas o botão de comprar bilhete tem de aparecer sem descer a página no telemóvel.', decidedAt: at(-18, 16, 20), createdAt: at(-21, 11) },
  { id: 'pr-2', projectId: 'p-teatro', title: 'Bilheteira', version: 1, image: '/img/provas/teatro-bilheteira-1', note: 'Escolha de sessão e de lugar, num só ecrã.', status: 'aprovada', clientComment: 'Aprovado. A sala vai adorar.', decidedAt: at(-9, 12, 5), createdAt: at(-12, 15) },
  { id: 'pr-3', projectId: 'p-teatro', title: 'Página inicial', version: 2, image: '/img/provas/teatro-inicio-2', note: 'O botão de bilhetes passou para a barra de cima e fica sempre à vista no telemóvel.', status: 'pendente', clientComment: '', decidedAt: null, createdAt: at(-2, 18, 30) },
  { id: 'pr-4', projectId: 'p-teatro', title: 'Escolas', version: 1, image: '/img/provas/teatro-escolas-1', note: 'Página para professores marcarem visitas de turma.', status: 'pendente', clientComment: '', decidedAt: null, createdAt: at(-1, 10, 15) },
  { id: 'pr-5', projectId: 'p-lota', title: 'Esboços das três latas', version: 1, image: '/img/provas/lota-esbocos-1', note: 'Três caminhos: polvo, sardinha a cantar e bacalhau de gorro.', status: 'pendente', clientComment: '', decidedAt: null, createdAt: at(-1, 9, 40) },
];

export const messages = [
  { id: 'm-1', projectId: 'p-teatro', authorId: 'u-ines', authorName: 'Inês Barata', fromStudio: true, body: 'Joana, já estão na área de cliente a segunda versão da página inicial e a página para escolas. Diga-nos o que acha quando puder.', createdAt: at(-1, 10, 20), readByClient: false, readByStudio: true },
  { id: 'm-2', projectId: 'p-teatro', authorId: 'u-teatro', authorName: 'Joana Freitas', fromStudio: false, body: 'Obrigada! Na página das escolas falta dizer que as visitas são gratuitas às quartas.', createdAt: at(-1, 14, 2), readByClient: true, readByStudio: false },
  { id: 'm-0', projectId: 'p-teatro', authorId: 'u-tomas', authorName: 'Tomás Valente', fromStudio: true, body: 'A bilheteira já está ligada ao sistema de reservas em modo de teste. Podem experimentar com o código de sala que enviámos.', createdAt: at(-8, 16, 45), readByClient: true, readByStudio: true },
  { id: 'm-3', projectId: 'p-lota', authorId: 'u-lota', authorName: 'Henrique Lobo', fromStudio: false, body: 'O polvo é o favorito cá dentro. Conseguem experimentar com o azul das latas antigas?', createdAt: at(0, 9, 5), readByClient: true, readByStudio: false },
  { id: 'm-4', projectId: 'p-lota', authorId: 'u-ines', authorName: 'Inês Barata', fromStudio: true, body: 'Henrique, os esboços das três latas estão na área de cliente. O Rui vai à gráfica na sexta para ver o papel da cinta.', createdAt: at(-1, 9, 45), readByClient: true, readByStudio: true },
  { id: 'm-5', projectId: 'p-sotao', authorId: 'u-ines', authorName: 'Inês Barata', fromStudio: true, body: 'Marta, a proposta segue esta semana. Antes disso, pode mandar-nos fotografias da escada e da montra?', createdAt: at(-3, 11), readByClient: true, readByStudio: true },
];

export const briefs = [
  { id: 'b-1', ref: 'PL-0412', name: 'Daniel Correia', email: 'daniel@exemplo.pt', company: 'Ginásio Bairro Alto', services: ['marcas', 'sites'], budget: '8000-15000', deadline: day(80), message: 'Vamos abrir um segundo espaço e a marca atual já não serve. Precisamos de marca nova e de um site com horários e marcações.', status: 'novo', note: '', createdAt: at(0, 8, 12) },
  { id: 'b-2', ref: 'PL-0411', name: 'Sofia Antunes', email: 'sofia@exemplo.pt', company: 'Quinta do Vale Fundo', services: ['rotulos'], budget: '3000-8000', deadline: day(120), message: 'Três vinhos brancos e um rosé. Queremos rótulos que se destaquem numa garrafeira sem parecer mais um vinho de luxo.', status: 'novo', note: '', createdAt: at(-1, 17, 40) },
  { id: 'b-3', ref: 'PL-0409', name: 'Pedro Lima', email: 'pedro@exemplo.pt', company: 'Podcast Fora de Horas', services: ['movimento'], budget: 'ate-3000', deadline: day(30), message: 'Precisamos de um genérico animado de 8 segundos e de versões para redes.', status: 'em-conversa', note: 'Chamada marcada para quinta. Pode juntar-se ao pacote de redes.', createdAt: at(-5, 12, 3) },
  { id: 'b-4', ref: 'PL-0406', name: 'Ana Rebelo', email: 'ana@exemplo.pt', company: '', services: ['livros'], budget: 'nao-sei', deadline: '', message: 'Escrevi um livro de receitas da minha avó e queria fazer 50 exemplares para a família.', status: 'recusado', note: 'Recomendámos uma gráfica de impressão a pedido e o Rui mandou-lhe um modelo de paginação.', createdAt: at(-12, 19, 30) },
];

// Trabalhos publicados. Cada um tem a capa e dois pormenores gerados em scripts/imagens.
const work = (slug, data) => ({
  id: `w-${slug}`,
  slug,
  cover: `/img/trabalhos/${slug}-1`,
  images: [`/img/trabalhos/${slug}-2`, `/img/trabalhos/${slug}-3`],
  published: true,
  ...data,
});

export const works = [
  work('lota-velha', {
    title: 'Latas que se veem do fundo do corredor',
    client: 'Lota Velha',
    place: 'Matosinhos',
    category: 'rotulos',
    year: 2026,
    featured: true,
    summary: 'Um sistema de rótulos para doze conservas, onde cada peixe tem a sua cor e a sua letra.',
    body: 'A Lota Velha enlata sardinha, cavala e polvo desde que o porto ainda tinha guindastes de madeira. As latas antigas eram bonitas mas iguais entre si, e nas prateleiras dos supermercados ninguém distinguia a cavala da sardinha.\n\nDemos a cada peixe uma cor forte e um número grande, desenhado à mão, que se lê a dois metros. O resto do rótulo ficou calmo: o nome do peixe, o azeite e a data da pesca.\n\nAs doze latas foram impressas em litografia na mesma gráfica de sempre, com só duas cores por lata para manter o preço.',
    publishedAt: at(-40),
  }),
  work('teatro-do-largo', {
    title: 'Um teatro que cabe num carimbo',
    client: 'Teatro do Largo',
    place: 'Lisboa',
    category: 'marcas',
    year: 2026,
    featured: true,
    summary: 'Marca para um teatro de bairro com cem lugares, pensada para carimbos, cartazes de fotocópia e bilhetes de papel.',
    body: 'O Teatro do Largo vive de pouco dinheiro e de muita gente do bairro. A marca tinha de sair bem numa fotocopiadora e num carimbo de borracha, porque é assim que se fazem metade dos cartazes.\n\nO símbolo é o próprio largo visto de cima: um círculo e uma porta. Funciona a três milímetros num bilhete e a três metros na fachada.\n\nEntregámos um kit de cartaz em A3 que a equipa preenche sozinha em dez minutos, e um carimbo para cada sala.',
    publishedAt: at(-75),
  }),
  work('fermento-lento', {
    title: 'Pão que demora, marca que não',
    client: 'Fermento Lento',
    place: 'Porto',
    category: 'marcas',
    year: 2025,
    featured: false,
    summary: 'Identidade para uma padaria de fermentação natural, com sacos de papel, letreiro e cartões de fidelidade.',
    body: 'O pão da Fermento Lento leva dois dias a fazer. Quisemos que a marca dissesse isso sem precisar de frases bonitas: a letra é larga e pesada, como massa a levedar, e o símbolo é uma espiga que cresce de saco para saco.\n\nOs sacos de papel são carimbados na padaria, de manhã, com a data da fornada.',
    publishedAt: at(-210),
  }),
  work('mao-esquerda', {
    title: 'Uma coleção de poesia em seis cores',
    client: 'Mão Esquerda Editora',
    place: 'Coimbra',
    category: 'livros',
    year: 2026,
    featured: true,
    summary: 'Capas e paginação para uma coleção de poesia contemporânea, com uma cor por estação do ano editorial.',
    body: 'A Mão Esquerda publica seis livros de poesia por ano e queria que se reconhecessem lado a lado numa estante.\n\nCada livro tem uma cor sólida e o título em letra condensada a ocupar a capa inteira, de cima a baixo. Lá dentro, a paginação respeita os versos longos: nenhum verso parte a meio por falta de largura.\n\nO papel é o mesmo em toda a coleção, para que as lombadas tenham a mesma textura.',
    publishedAt: at(-55),
  }),
  work('grua', {
    title: 'Cerveja com vista para o porto',
    client: 'Cervejaria Grua',
    place: 'Setúbal',
    category: 'rotulos',
    year: 2025,
    featured: false,
    summary: 'Rótulos para quatro cervejas artesanais, cada uma com a silhueta de uma grua do porto de Setúbal.',
    body: 'A Grua faz cerveja num armazém ao lado do porto. Desenhámos quatro rótulos onde a grua muda de posição consoante a cerveja: levantada na mais leve, carregada na mais forte.\n\nOs rótulos usam papel de etiqueta resistente à água, porque as garrafas passam a noite em gelo nas festas da cidade.',
    publishedAt: at(-160),
  }),
  work('contracorrente', {
    title: 'Um festival que nada contra a corrente',
    client: 'Festival Contracorrente',
    place: 'Abrantes',
    category: 'movimento',
    year: 2026,
    featured: true,
    summary: 'Genérico animado, cartazes que mexem e trinta vídeos curtos para redes de um festival de música junto ao rio.',
    body: 'O Contracorrente acontece num fim de semana de julho, na margem do Tejo. Animámos o logótipo como uma onda que sobe ao contrário e usámos a mesma onda para revelar cada artista nas redes.\n\nTodos os vídeos têm versão sem som e legendas desenhadas, porque a maior parte das pessoas vê-os no autocarro.',
    publishedAt: at(-120),
  }),
  work('oficina-bicla', {
    title: 'Peças de bicicleta sem complicar',
    client: 'Oficina Bicla',
    place: 'Lisboa',
    category: 'sites',
    year: 2026,
    featured: true,
    summary: 'Loja online com 800 peças, marcação de reparações e um site que abre depressa numa rede móvel fraca.',
    body: 'A Oficina Bicla vendia peças por telefone e marcava reparações num caderno. Fizemos uma loja onde se encontra uma peça pela medida da roda, e uma agenda de reparações com os horários reais da oficina.\n\nO site foi feito para abrir depressa no telemóvel, mesmo com rede fraca na rua: as páginas pesam pouco e as fotografias das peças só carregam quando aparecem.',
    publishedAt: at(-30),
  }),
  work('atlas-miudo', {
    title: 'Um atlas para quem ainda não sabe ler mapas',
    client: 'Edições Pé de Meia',
    place: 'Braga',
    category: 'livros',
    year: 2025,
    featured: false,
    summary: 'Atlas ilustrado para crianças dos 5 aos 8 anos, com mapas desenhados como tabuleiros de jogo.',
    body: 'Cada mapa do atlas é um tabuleiro: há um caminho, casas para contar e coisas para encontrar. Desenhámos os mapas com poucas cores e muito branco, para que se possa pintar por cima.\n\nA capa é cartonada e tem cantos redondos, porque vai ser atirada ao chão muitas vezes.',
    publishedAt: at(-240),
  }),
  work('terra-alta', {
    title: 'Azeite com a altitude no rótulo',
    client: 'Cooperativa Terra Alta',
    place: 'Mirandela',
    category: 'rotulos',
    year: 2026,
    featured: false,
    summary: 'Garrafas e latas de azeite onde a linha do horizonte mostra a altitude do olival de onde vem cada lote.',
    body: 'A cooperativa junta quarenta produtores, com olivais entre os 300 e os 700 metros. Cada lote tem agora no rótulo a linha do monte de onde veio e a altitude escrita em grande.\n\nO sistema funciona com uma só cor de impressão por garrafa, o que baixou o custo da gráfica.',
    publishedAt: at(-90),
  }),
  work('radio-quintal', {
    title: 'Vinhetas para uma rádio de garagem',
    client: 'Rádio Quintal',
    place: 'Évora',
    category: 'movimento',
    year: 2025,
    featured: false,
    summary: 'Logótipo animado e doze vinhetas para os programas de uma rádio comunitária que também passa vídeo.',
    body: 'A Rádio Quintal transmite a partir de uma garagem e passou a mostrar os programas em vídeo. Cada programa ganhou uma vinheta de quatro segundos, desenhada à mão e animada quadro a quadro.\n\nO logótipo é uma antena feita de estendal, que balança ao ritmo da música.',
    publishedAt: at(-190),
  }),
  work('bigode', {
    title: 'Marcar consulta para o gato em três toques',
    client: 'Clínica Veterinária Bigode',
    place: 'Aveiro',
    category: 'sites',
    year: 2025,
    featured: false,
    summary: 'Site com marcação de consultas, ficha de cada animal e lembretes de vacinas por email.',
    body: 'A Bigode recebia dezenas de chamadas por dia só para marcar consultas. O site novo deixa marcar em três toques e guarda a ficha de cada animal, com as vacinas e o peso.\n\nOs lembretes de vacinas saem por email uma semana antes, com o link para marcar.',
    publishedAt: at(-140),
  }),
];

const entry = (slug, data) => ({ id: `d-${slug}`, slug, published: true, ...data });

export const journal = [
  entry('tres-linhas-no-orcamento', {
    title: 'Porque é que os nossos orçamentos têm três linhas',
    tag: 'Estúdio',
    author: 'Inês Barata',
    excerpt: 'Um orçamento com quarenta linhas dá a ideia de rigor, mas esconde a única pergunta que interessa: quanto custa e o que recebo.',
    body: 'Durante muito tempo mandámos orçamentos com todas as horas partidas por tarefa. Os clientes liam a última linha e perguntavam o resto ao telefone.\n\nAgora mandamos três linhas: o que fazemos, quando entregamos e quanto custa. O detalhe vai num anexo para quem o quer ler.\n\nNão ficámos menos rigorosos. Ficámos mais fáceis de perceber, e as conversas sobre dinheiro passaram a demorar cinco minutos.',
    publishedAt: at(-4, 9),
  }),
  entry('uma-lata-tem-quatro-faces', {
    title: 'Uma lata de conserva tem quatro faces',
    tag: 'Rótulos',
    author: 'Rui Paixão',
    excerpt: 'Na prateleira, a lata está quase sempre de lado. O que desenhamos para a tampa raramente é o que se vê primeiro.',
    body: 'Quando começámos as latas da Lota Velha fomos a doze supermercados fotografar as prateleiras. Em quase todas, as latas estavam empilhadas de lado ou dentro de caixas abertas.\n\nPor isso o número grande de cada peixe aparece em duas faces, e a cor ocupa a lata inteira.\n\nA tampa, que era onde estava o desenho antigo, ficou para a data da pesca.',
    publishedAt: at(-11, 9),
  }),
  entry('testar-uma-marca-na-rua', {
    title: 'Testar uma marca na rua antes de a entregar',
    tag: 'Marcas',
    author: 'Inês Barata',
    excerpt: 'Imprimimos o logótipo em autocolantes e colamo-los pelo bairro do cliente. Se ninguém o vê, voltamos à mesa.',
    body: 'Um logótipo bonito num ecrã grande diz pouco. Por isso, antes de apresentar uma marca, imprimimos autocolantes e cartazes baratos e pomo-los onde o cliente vai estar.\n\nFotografamos a uma distância normal de quem passa. Se o símbolo se perde no meio dos outros, mudamos antes de o cliente o ver.',
    publishedAt: at(-26, 9),
  }),
  entry('o-que-perguntamos-num-briefing', {
    title: 'O que perguntamos num briefing (e porquê)',
    tag: 'Processo',
    author: 'Tomás Valente',
    excerpt: 'Seis perguntas, nenhuma sobre cores favoritas. A mais importante é sobre o que acontece se não fizermos nada.',
    body: 'O nosso formulário de contacto tem poucas perguntas de propósito. Queremos saber o problema, o prazo, o orçamento aproximado e quem decide.\n\nA pergunta que fazemos sempre na primeira conversa é: o que acontece se este projeto não avançar? A resposta diz-nos quanto o problema dói, e isso orienta tudo o resto.',
    publishedAt: at(-41, 9),
  }),
  entry('letra-condensada', {
    title: 'Letra condensada: quando gritar e quando não',
    tag: 'Tipografia',
    author: 'Carolina Mexia',
    excerpt: 'Usamos letra estreita em títulos enormes e nunca em parágrafos. Explicamos porquê, com exemplos do nosso próprio site.',
    body: 'O título da nossa página inicial usa uma letra muito estreita e muito pesada. Num título curto, isso deixa-nos pôr palavras grandes numa linha só.\n\nNum parágrafo, a mesma letra cansa os olhos ao fim de duas linhas. Por isso os textos corridos do site usam a mesma família, mas na largura normal.\n\nA regra é simples: quanto mais curto o texto, mais estreita pode ser a letra.',
    publishedAt: at(-63, 9),
  }),
];

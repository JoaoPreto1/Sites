import bcrypt from 'bcryptjs';

// Dados de exemplo. As notícias, a agenda, os avisos e os prazos são inventados;
// os factos sobre o concelho (história, património, freguesias) são reais.

const hash = (password) => bcrypt.hashSync(password, 10);
const day = (offset, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const users = [
  { id: 'u-maria', name: 'Maria Lopes', email: 'maria@exemplo.pt', phone: '912 345 678', nif: '213456789', freguesia: 'lagoaca-e-fornos', address: 'Rua da Fonte, 12, Lagoaça', role: 'municipe', passwordHash: hash('freixo2026'), createdAt: day(-400) },
  { id: 'u-camara', name: 'Rui Teixeira', email: 'camara@exemplo.pt', phone: '', role: 'admin', passwordHash: hash('freixo2026'), createdAt: day(-900) },
];

const s = (id, cat, title, sub, online, list, facts, extra = {}) => ({ id, slug: id, cat, title, sub, online, list, facts, ...extra });

export const services = [
  s('leitura-agua', 'agua', 'Comunicar a leitura do contador da água', 'Evite faturas por estimativa', true,
    { title: 'Como fazer', items: ['Leia os números a preto do contador.', 'Comunique-os no Balcão Online entre os dias 20 e 25 de cada mês.', 'Guarde o comprovativo que recebe por email.'] },
    [['Prazo', 'Dias 20 a 25'], ['Custo', 'Gratuito'], ['Onde', 'Balcão Online']], { action: 'leitura' }),
  s('contrato-agua', 'agua', 'Novo contrato de água e saneamento', 'Para casas novas ou mudança de titular', true,
    { title: 'O que precisa', items: ['Documento de identificação e número de contribuinte.', 'Documento que prove a ocupação da casa (escritura, contrato de arrendamento ou declaração do proprietário).', 'IBAN, se quiser pagar por débito direto.'] },
    [['Demora', 'Até 5 dias úteis'], ['Custo', 'Tabela de taxas'], ['Onde', 'Online ou balcão']]),
  s('fatura-agua', 'agua', 'Pagar a fatura da água', 'Multibanco, MB WAY ou débito direto', true,
    { title: 'Formas de pagamento', items: ['Referência Multibanco que vem na fatura.', 'MB WAY no Balcão Online.', 'Débito direto, pedido uma única vez.', 'Na tesouraria dos Paços do Concelho.'] },
    [['Prazo', 'Indicado na fatura'], ['Custo', 'Sem acréscimo']], { action: 'faturas' }),
  s('recolha-monstros', 'agua', 'Recolha de monstros e verdes', 'Móveis, eletrodomésticos e restos de poda', true,
    { title: 'Como funciona', items: ['Marque a recolha indicando o que é e a morada.', 'Deixe os objetos à porta na véspera do dia combinado.', 'A recolha é feita uma vez por semana em cada freguesia.'] },
    [['Demora', 'Até 7 dias'], ['Custo', 'Gratuito']]),
  s('licenca-obras', 'obras', 'Licença de obras', 'Construção, ampliação ou alteração', true,
    { title: 'O que precisa', items: ['Requerimento e certidão da conservatória do registo predial.', 'Projeto de arquitetura assinado por técnico habilitado.', 'Termos de responsabilidade e projetos das especialidades.', 'Levantamento topográfico e fotografias do local.'] },
    [['Demora', 'Prazos do RJUE'], ['Custo', 'Tabela de taxas'], ['Onde', 'Online']]),
  s('comunicacao-previa', 'obras', 'Comunicação prévia', 'Obras em zonas com plano de pormenor ou loteamento', true,
    { title: 'Quando se aplica', items: ['Obras dentro de loteamentos ou planos de pormenor.', 'Pode começar a obra depois de pagar as taxas, sem esperar por licença.'] },
    [['Demora', 'Imediato após taxas'], ['Custo', 'Tabela de taxas']]),
  s('certidoes', 'obras', 'Certidões e plantas de localização', 'Plantas do PDM e certidões de construção', true,
    { title: 'O que pode pedir', items: ['Plantas de localização e extratos do PDM.', 'Certidão de que o prédio é anterior a 1951.', 'Certidão de compropriedade e de destaque.'] },
    [['Demora', 'Até 10 dias úteis'], ['Custo', 'Tabela de taxas']]),
  s('fachadas', 'obras', 'Apoio à recuperação de fachadas', 'Centro histórico manuelino', true,
    { title: 'A quem se destina', items: ['Proprietários de edifícios no centro histórico da vila.', 'Obras em janelas, portas, cantarias e rebocos exteriores.', 'Candidaturas até 31 de janeiro.'] },
    [['Prazo', '31 de janeiro'], ['Onde', 'Online ou balcão']]),
  s('cartao-social', 'social', 'Cartão social municipal', 'Descontos e apoios para quem mais precisa', false,
    { title: 'O que precisa', items: ['Documentos de identificação de todo o agregado.', 'Declaração de IRS ou comprovativo de rendimentos.', 'Comprovativo de morada no concelho.'] },
    [['Demora', 'Até 30 dias'], ['Custo', 'Gratuito'], ['Onde', 'Paços do Concelho']]),
  s('teleassistencia', 'social', 'Teleassistência', 'Botão de alerta para pessoas que vivem sozinhas', false,
    { title: 'Como funciona', items: ['Um aparelho em casa liga a uma central disponível 24 horas.', 'Em caso de queda ou mal-estar, basta carregar no botão.', 'O pedido pode ser feito pela própria pessoa ou por um familiar.'] },
    [['Custo', 'Gratuito'], ['Para', 'Maiores de 65']]),
  s('natalidade', 'social', 'Apoio à natalidade', 'Para famílias com bebés nascidos ou adotados', true,
    { title: 'O que precisa', items: ['Certidão de nascimento ou decisão de adoção.', 'Comprovativo de residência dos pais no concelho.', 'Pedido até seis meses depois do nascimento.'] },
    [['Prazo', '6 meses'], ['Onde', 'Online']]),
  s('transporte-escolar', 'educacao', 'Transporte escolar', 'Das aldeias para as escolas da vila', true,
    { title: 'Como pedir', items: ['O pedido é feito no ato da matrícula ou no Balcão Online.', 'É gratuito para alunos do ensino obrigatório que moram longe da escola.'] },
    [['Prazo', 'Até 31 de julho'], ['Custo', 'Gratuito']]),
  s('refeicoes-escolares', 'educacao', 'Refeições escolares e prolongamento', 'Pré-escolar e 1.º ciclo', true,
    { title: 'O que inclui', items: ['Almoço nas escolas do concelho.', 'Atividades de prolongamento de horário até às 17h30.', 'Escalão de apoio de acordo com o abono de família.'] },
    [['Prazo', 'Até 31 de julho']]),
  s('ocorrencia', 'geral', 'Reportar uma ocorrência na via pública', 'Buracos, iluminação, lixo, sinalização', true,
    { title: 'Como fazer', items: ['Diga onde é e o que se passa.', 'Recebe um número para acompanhar o pedido.', 'Em caso de perigo imediato, ligue 112.'] },
    [['Resposta', 'Até 5 dias úteis'], ['Custo', 'Gratuito']], { action: 'ocorrencia' }),
  s('atendimento', 'geral', 'Marcar atendimento presencial', 'Escolha o serviço e a hora', true,
    { title: 'Porquê marcar', items: ['É atendido à hora marcada, sem esperar.', 'O técnico prepara o seu processo antes de chegar.'] },
    [['Horário', '9h00–17h30']]),
  s('licenca-ruido', 'geral', 'Licença de ruído e ocupação da via pública', 'Festas, esplanadas e eventos', true,
    { title: 'O que precisa', items: ['Datas, horário e local do evento.', 'Planta com a área a ocupar, quando houver estruturas.', 'Pedido com 15 dias úteis de antecedência.'] },
    [['Antecedência', '15 dias úteis'], ['Custo', 'Tabela de taxas']]),
];

export const news = [
  {
    id: 'n-fachadas', slug: 'apoio-fachadas-manuelinas', cat: 'obras', label: 'Centro histórico', photo: 'vila', published: true, date: day(-4),
    title: 'Município apoia a recuperação das fachadas manuelinas da vila',
    summary: 'Os proprietários podem candidatar-se até ao fim de janeiro, com apoio a janelas, portas e cantarias.',
    body: [
      ['lead', 'Os proprietários de edifícios no centro histórico podem candidatar-se, até 31 de janeiro, a um apoio municipal para recuperar janelas, portas, cantarias e rebocos das fachadas.'],
      ['p', 'Freixo de Espada à Cinta tem 101 molduras manuelinas inventariadas no centro histórico, o que levou o historiador Reynaldo dos Santos a chamar-lhe, nos anos 30, “a vila mais manuelina de Portugal”. Muitas dessas molduras estão em casas particulares, e o seu estado depende dos proprietários.'],
      ['h2', 'O que é apoiado'],
      ['ul', ['Limpeza e consolidação de cantarias, molduras e elementos decorativos em granito.', 'Recuperação ou substituição de caixilharias e portas em madeira.', 'Rebocos e pinturas exteriores com materiais e cores tradicionais.', 'Projeto e acompanhamento técnico das obras.']],
      ['quote', 'Cada janela manuelina que se recupera é parte da história da vila que fica para quem vem depois.'],
      ['h2', 'Quem pode candidatar-se'],
      ['p', 'Proprietários, singulares ou empresas, de edifícios dentro da área do centro histórico. As obras têm de ser aprovadas pelos serviços técnicos antes de começar, para garantir que respeitam o património.'],
      ['h2', 'Como se candidatar'],
      ['ol', ['Marque uma visita técnica ao edifício no Balcão Online ou nos Paços do Concelho.', 'Entregue o formulário de candidatura com fotografias da fachada e o orçamento das obras.', 'Depois da aprovação, tem um ano para fazer as obras.']],
    ],
  },
  {
    id: 'n-amendoeiras', slug: 'amendoeiras-em-flor-percursos', cat: 'cultura', label: 'Cultura', photo: 'amendoeiras', published: true, date: day(-8),
    title: 'Amendoeiras em flor: já se conhecem os seis percursos',
    summary: 'Quatro percursos a pé e dois de carro ligam as quatro freguesias entre fevereiro e março.',
    body: [
      ['lead', 'Entre fevereiro e março as encostas do concelho ficam brancas e cor-de-rosa. Este ano há seis percursos sinalizados para ver as amendoeiras em flor.'],
      ['h2', 'Os percursos'],
      ['ul', ['Quatro percursos a pé, entre 5 e 12 km, com partida em cada uma das freguesias.', 'Dois percursos de carro que ligam os miradouros do concelho, incluindo o Penedo Durão.']],
      ['p', 'Os mapas estarão disponíveis no posto de turismo e no site a partir de janeiro, com a indicação da dificuldade e dos pontos de interesse ao longo do caminho.'],
      ['h2', 'Mercado de produtores'],
      ['p', 'Aos fins de semana da floração, a praça da vila recebe um mercado com amêndoa, azeite, mel e seda feita no concelho.'],
    ],
  },
  {
    id: 'n-fixacao', slug: 'apoio-fixacao-familias', cat: 'social', label: 'Apoios', photo: 'douro', published: true, date: day(-10),
    title: 'Abertas as candidaturas ao apoio à fixação de famílias',
    summary: 'Famílias que se mudem para o concelho podem candidatar-se até 31 de dezembro.',
    body: [
      ['lead', 'O concelho tem perdido população desde os anos 60: eram 7 288 residentes em 1960 e 3 216 nos Censos 2021. O apoio à fixação quer inverter essa tendência.'],
      ['h2', 'Quem pode candidatar-se'],
      ['p', 'Famílias que mudem a residência para uma das quatro freguesias do concelho e aqui fiquem a viver, com pelo menos um membro a trabalhar ou a estudar.'],
      ['h2', 'Como se candidatar'],
      ['p', 'A candidatura faz-se no Balcão Online, com o comprovativo de morada e a declaração de IRS do agregado. O gabinete de apoio ao munícipe ajuda quem precisar.'],
    ],
  },
  {
    id: 'n-penedo', slug: 'obras-estrada-penedo-durao', cat: 'obras', label: 'Obras', photo: 'penedo', published: true, date: day(-12),
    title: 'Estrada de acesso ao Penedo Durão: o que muda no trânsito durante as obras',
    summary: 'A circulação faz-se num só sentido, com semáforos, até ao fim de dezembro.',
    body: [
      ['lead', 'A estrada de acesso ao miradouro do Penedo Durão está em obras de repavimentação e de colocação de proteções laterais.'],
      ['p', 'Até ao fim de dezembro a circulação faz-se alternadamente, controlada por semáforos. Aos fins de semana a estrada está aberta nos dois sentidos.'],
      ['p', 'Pedimos a quem visita o miradouro que tenha atenção à sinalização e respeite os limites de velocidade.'],
    ],
  },
  {
    id: 'n-reuniao', slug: 'reuniao-publica-camara', cat: 'municipio', label: 'Município', photo: 'matriz', published: true, date: day(-16),
    title: 'Reunião pública da Câmara Municipal: ordem de trabalhos',
    summary: 'A reunião é aberta ao público, com um período reservado à intervenção dos munícipes.',
    body: [
      ['lead', 'A próxima reunião ordinária da Câmara Municipal é pública e decorre nos Paços do Concelho.'],
      ['p', 'A ordem de trabalhos inclui a proposta das Grandes Opções do Plano e Orçamento, o regulamento de apoio à natalidade e a atribuição de apoios às associações do concelho.'],
      ['p', 'Os munícipes que queiram intervir devem inscrever-se no início da reunião.'],
    ],
  },
  {
    id: 'n-seda', slug: 'oficinas-seda-inverno', cat: 'cultura', label: 'Artesanato', photo: 'seda', published: true, date: day(-22),
    title: 'Oficinas de seda abertas a visitas durante o inverno',
    summary: 'As tecedeiras mostram todo o processo, do casulo ao tecido.',
    body: [
      ['lead', 'A seda é uma tradição antiga do concelho: no século XIX distribuíram-se aqui milhares de pés de amoreira para alimentar o bicho-da-seda.'],
      ['p', 'Durante o inverno, as tecedeiras abrem as oficinas a visitas marcadas e mostram todo o processo, da criação do bicho-da-seda à tecelagem.'],
      ['p', 'As visitas marcam-se no posto de turismo, com pelo menos dois dias de antecedência.'],
    ],
  },
];

export const events = [
  { id: 'e1', date: day(7), title: 'Feira de São André', place: 'Praça da vila · todo o dia' },
  { id: 'e2', date: day(14, 21), title: 'Concerto de Natal', place: 'Igreja Matriz · 21h00 · entrada livre' },
  { id: 'e3', date: day(21), title: 'Mercado de Natal', place: 'Paços do Concelho · seda, amêndoa e azeite' },
  { id: 'e4', date: day(28), title: 'Caminhada pelas arribas', place: '9 km · saída da praça às 9h00' },
];

export const yearly = [
  ['fev', 'mar', 'Amendoeiras em flor', 'Percursos a pé e de carro nas quatro freguesias'],
  ['6.ª', 'quaresma', 'Procissão dos Sete Passos', 'À meia-noite de cada sexta-feira da Quaresma'],
  ['2.ª', 'páscoa', 'Feriado municipal', 'Segunda-feira a seguir ao Domingo de Páscoa'],
  ['29', 'set', 'São Miguel', 'Dia do padroeiro da vila'],
];

export const notices = [
  { id: 'a1', type: 'agua', title: 'Corte de água em Lagoaça', text: 'Para substituição de uma conduta.', when: 'Terça, das 9h00 às 13h00', until: day(3), pinned: true },
  { id: 'a2', type: 'transito', title: 'Obras na estrada do Penedo Durão', text: 'Circulação alternada com semáforos.', when: 'Até ao fim de dezembro', until: day(40) },
  { id: 'a3', type: 'ambiente', title: 'Recolha de monstros', text: 'Em Poiares e Ligares passa para as quintas-feiras.', when: 'Durante dezembro', until: day(40) },
];

export const editais = [
  { id: 'd1', title: 'Edital — consulta pública do regulamento de apoio à natalidade', sub: 'Participação durante 30 dias úteis', date: day(-5), kind: 'PDF' },
  { id: 'd2', title: 'Aviso — interrupção do abastecimento de água em Lagoaça', sub: 'Aviso aos consumidores', date: day(-2), kind: 'PDF' },
  { id: 'd3', title: 'Edital — sessão ordinária da Assembleia Municipal', sub: 'Ordem de trabalhos', date: day(-10), kind: 'PDF' },
  { id: 'd4', title: 'Ata da reunião ordinária da Câmara Municipal', sub: 'Aprovada em minuta', date: day(-15), kind: 'PDF' },
  { id: 'd5', title: 'Concurso para atribuição de habitações a custos controlados', sub: 'Candidaturas abertas', date: day(-19), kind: 'PDF' },
];

export const documents = [
  { title: 'Grandes Opções do Plano e Orçamento', sub: 'Proposta para a Assembleia Municipal', kind: 'PDF' },
  { title: 'Prestação de contas do ano anterior', sub: 'Relatório de gestão e demonstrações financeiras', kind: 'PDF' },
  { title: 'Mapa de pessoal', sub: 'Postos de trabalho por unidade orgânica', kind: 'PDF' },
  { title: 'Regulamento e tabela de taxas municipais', sub: 'Em vigor', kind: 'PDF' },
  { title: 'Contratação pública', sub: 'Contratos do Município no portal BASE', kind: 'WEB' },
];

export const requests = [
  {
    id: 'r1', number: 'P-2026-0412', userId: 'u-maria', service: 'transporte-escolar', status: 'em-analise', createdAt: day(-9),
    text: 'Transporte escolar para o meu filho, que entra no 5.º ano na Escola Básica Santiago Gonçalves.',
    history: [{ at: day(-9), status: 'recebido', note: 'Pedido recebido pelo Balcão Online.' }, { at: day(-6), status: 'em-analise', note: 'A verificar a paragem mais perto de casa.' }],
  },
  {
    id: 'r2', number: 'P-2026-0377', userId: 'u-maria', service: 'licenca-ruido', status: 'concluido', createdAt: day(-40),
    text: 'Licença de ruído para a festa da aldeia em Lagoaça.',
    history: [{ at: day(-40), status: 'recebido', note: 'Pedido recebido.' }, { at: day(-36), status: 'concluido', note: 'Licença emitida. Pode descarregá-la na sua área.' }],
  },
  {
    id: 'r3', number: 'P-2026-0420', userId: null, name: 'António Pires', service: 'cartao-social', status: 'aguarda', createdAt: day(-5),
    text: 'Pedido de cartão social para o agregado.',
    history: [{ at: day(-5), status: 'recebido', note: 'Pedido entregue no balcão.' }, { at: day(-3), status: 'aguarda', note: 'Falta a declaração de IRS.' }],
  },
];

export const issues = [
  { id: 'o1', number: 'O-2026-0088', userId: 'u-maria', type: 'luz', place: 'Rua da Fonte, Lagoaça', text: 'Candeeiro apagado há uma semana, à frente do n.º 12.', status: 'em-analise', createdAt: day(-3) },
  { id: 'o2', number: 'O-2026-0085', userId: null, name: 'Munícipe anónimo', type: 'via', place: 'Estrada de Poiares, junto ao cemitério', text: 'Buraco grande na berma, perigoso à noite.', status: 'recebido', createdAt: day(-1) },
];

const month = (offset) => {
  const d = new Date();
  d.setMonth(d.getMonth() + offset, 1);
  return d.toISOString();
};

export const invoices = [
  { id: 'f4', userId: 'u-maria', number: 'FA 2026/1184', period: month(-1), m3: 7, amount: 18.42, due: day(12), paid: false },
  { id: 'f3', userId: 'u-maria', number: 'FA 2026/1052', period: month(-2), m3: 6, amount: 16.9, due: day(-18), paid: true },
  { id: 'f2', userId: 'u-maria', number: 'FA 2026/0921', period: month(-3), m3: 9, amount: 22.75, due: day(-48), paid: true },
  { id: 'f1', userId: 'u-maria', number: 'FA 2026/0790', period: month(-4), m3: 8, amount: 20.31, due: day(-78), paid: true },
];

export const readings = [
  { id: 'l2', userId: 'u-maria', value: 1462, at: day(-30) },
  { id: 'l1', userId: 'u-maria', value: 1455, at: day(-61) },
];

export const messages = [
  { id: 'm1', name: 'Joana Martins', email: 'joana@exemplo.pt', subject: 'Pedido de informação', freguesia: 'ligares', text: 'Gostava de saber se há casas para arrendar em Ligares. Estamos a pensar mudar-nos com dois filhos.', read: false, createdAt: day(-1) },
  { id: 'm2', name: 'Carlos Sá', email: 'carlos@exemplo.pt', subject: 'Investir', freguesia: 'freixo-e-mazouco', text: 'Tenho um projeto de turismo rural e queria marcar uma conversa com o gabinete.', read: true, createdAt: day(-6) },
];

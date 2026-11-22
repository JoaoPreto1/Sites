import bcrypt from 'bcryptjs';

// Dados de exemplo. As notícias e a agenda seguem os temas reais do site do Município,
// mas as datas, os avisos, os pedidos e as faturas são inventados.

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
    { title: 'Como fazer', items: ['Leia os números a preto do contador.', 'Comunique-os no Balcão Online: a leitura conta para a fatura seguinte.', 'Guarde o comprovativo que recebe por email.'] },
    [['Custo', 'Gratuito'], ['Onde', 'Balcão Online']], { action: 'leitura' }),
  s('contrato-agua', 'agua', 'Novo contrato de água e saneamento', 'Para casas novas ou mudança de titular', true,
    { title: 'O que precisa', items: ['Documento de identificação e número de contribuinte.', 'Documento que prove a ocupação da casa (escritura, contrato de arrendamento ou declaração do proprietário).', 'IBAN, se quiser pagar por débito direto.'] },
    [['Serviço', 'Águas e Saneamento'], ['Atendimento', '9h00–12h30 · 13h30–17h00'], ['Custo', 'Tarifário em vigor']]),
  s('fatura-agua', 'agua', 'Pagar a fatura da água', 'Multibanco, MB WAY ou débito direto', true,
    { title: 'Formas de pagamento', items: ['Referência Multibanco que vem na fatura.', 'MB WAY no Balcão Online.', 'Débito direto, pedido uma única vez.', 'Na tesouraria do Município.'] },
    [['Prazo', 'Indicado na fatura'], ['Custo', 'Sem acréscimo']], { action: 'faturas' }),
  s('tarifario-social', 'agua', 'Tarifário social da água', 'Fatura mais baixa para quem tem poucos recursos', true,
    { title: 'Como pedir', items: ['Comprovativo de rendimentos do agregado.', 'Número do contrato da água.', 'O pedido é analisado pelo serviço de ação social.'] },
    [['Regulamento', 'Tarifário Social da Fatura da Água'], ['Onde', 'Online ou balcão']]),
  s('monos', 'agua', 'Recolha de monos e volumosos', 'Móveis, colchões e eletrodomésticos', true,
    { title: 'Duas formas', items: ['Marque a recolha com o Município, dizendo o que é e a morada.', 'Ou entregue no Ecocentro Municipal, na EN 325 (Lameiros dos Freixos).', 'O Ecocentro abre nos dias úteis 10h00–13h00 e 14h30–18h30, e ao sábado 8h30–13h30.'] },
    [['Custo', 'Gratuito'], ['Resíduos', 'Resíduos do Nordeste']]),
  s('licenca-obras', 'obras', 'Licença de obras', 'Construção, ampliação ou alteração', true,
    { title: 'O que precisa', items: ['Requerimento e certidão da conservatória do registo predial.', 'Projeto de arquitetura assinado por técnico habilitado.', 'Termos de responsabilidade e projetos das especialidades.', 'Planta de localização (pode tirá-la no WebGIS do Município).'] },
    [['Serviço', 'Obras, Urbanismo e Habitação'], ['Custo', 'Tabela de taxas'], ['Regras', 'Regulamento de urbanização e edificação']]),
  s('plantas', 'obras', 'Plantas de localização e PDM', 'No WebGIS do Município, a qualquer hora', true,
    { title: 'O que pode tirar', items: ['Plantas de localização para pedidos de licença.', 'Extratos das plantas do Plano Diretor Municipal.', 'Certidões que precisem de despacho pedem-se no Balcão Online.'] },
    [['Onde', 'WebGIS municipal'], ['Custo', 'Consulta gratuita']]),
  s('queimas', 'obras', 'Comunicação prévia de queimas e queimadas', 'Antes de queimar sobrantes agrícolas', true,
    { title: 'Antes de queimar', items: ['Comunique a queima ao Município antes de a fazer.', 'Confirme o risco de incêndio do dia no IPMA.', 'Em dias de risco elevado, as queimas são proibidas.'] },
    [['Prazo', 'Antes da queima'], ['Regras', 'Regulamento de fogo, queimas e queimadas']]),
  s('bupi', 'obras', 'BUPi · Balcão Único do Prédio', 'Identificar e registar os seus terrenos', false,
    { title: 'Para que serve', items: ['Identificar no mapa os limites dos seus prédios rústicos e mistos.', 'O registo é gratuito durante o programa.', 'Leve a caderneta predial e, se tiver, plantas ou fotografias dos marcos.'] },
    [['Custo', 'Gratuito'], ['Onde', 'Balcão do Município']]),
  s('apoio-habitacao', 'social', 'Fundo Social de Apoio à Habitação', 'Obras na casa própria, até 3 500 €', true,
    { title: 'O que precisa', items: ['Requerimento de candidatura e de admissão.', 'Termo de responsabilidade.', 'Documentos de rendimentos do agregado e da casa.', 'Orçamento das obras de recuperação.'] },
    [['Apoio', 'Até 3 500 €'], ['Regras', 'Regulamento do Fundo Social']]),
  s('enxoval-bebe', 'social', 'Enxoval do Bebé', 'Para as famílias com um bebé', true,
    { title: 'O que precisa', items: ['Certidão de nascimento do bebé.', 'Comprovativo de residência no concelho.', 'Documentos de identificação dos pais.'] },
    [['Regras', 'Regulamento do Enxoval do Bebé'], ['Onde', 'Online ou balcão']]),
  s('apoio-medicacao', 'social', 'Apoio às despesas de medicação', 'Para quem tem rendimentos baixos', false,
    { title: 'Como funciona', items: ['O serviço de ação social avalia a situação do agregado.', 'Leve as receitas e os comprovativos de rendimentos.', 'O apoio comparticipa parte da despesa com medicamentos.'] },
    [['Regras', 'Regulamento de Apoio à Medicação'], ['Onde', 'Ação social']]),
  s('transporte-consultas', 'social', 'Transporte para consultas e exames', 'Para consultas fora do concelho', false,
    { title: 'Como marcar', items: ['Peça o transporte com antecedência, com a data e o local da consulta.', 'Leve o comprovativo da marcação.', 'O transporte segue o regulamento municipal.'] },
    [['Regras', 'Regulamento de transporte para consultas'], ['Onde', 'Ação social']]),
  s('cuidador-informal', 'social', 'Estatuto de Cuidador Informal', 'Para quem cuida de um familiar', false,
    { title: 'O Município ajuda a', items: ['Perceber se tem direito ao estatuto.', 'Preencher o pedido na Segurança Social.', 'Conhecer os apoios ao descanso do cuidador.'] },
    [['Custo', 'Gratuito'], ['Onde', 'Ação social']]),
  s('psicologia', 'social', 'Gabinete de Psicologia', 'Acompanhamento psicológico', false,
    { title: 'Como funciona', items: ['A marcação é feita no serviço de ação social.', 'As consultas são confidenciais.'] },
    [['Custo', 'Gratuito'], ['Onde', 'Ação social']]),
  s('transporte-escolar', 'educacao', 'Transporte escolar', 'Gratuito do pré-escolar ao secundário', true,
    { title: 'Como funciona', items: ['É gratuito para os alunos da rede pública, do pré-escolar ao secundário (Decreto-Lei n.º 21/2019).', 'As rotas e os horários estão no Plano de Transporte Escolar de cada ano letivo.', 'Peça-o no ato da matrícula ou no Balcão Online.'] },
    [['Custo', 'Gratuito'], ['Plano', 'Ano letivo 2026-2027']]),
  s('transporte-estudantes', 'educacao', 'Apoio ao transporte de estudantes', 'Secundário e superior fora do concelho', true,
    { title: 'O que precisa', items: ['Comprovativo de matrícula.', 'Comprovativo de residência no concelho.', 'Comprovativos das despesas de transporte.'] },
    [['Regras', 'Regulamento de apoio ao transporte de estudantes']]),
  s('ocorrencia', 'geral', 'Reportar uma ocorrência na via pública', 'Buracos, iluminação, lixo, sinalização', true,
    { title: 'Como fazer', items: ['Diga onde é e o que se passa.', 'Recebe um número para acompanhar o pedido.', 'Em caso de perigo imediato, ligue 112.'] },
    [['Resposta', 'Até 5 dias úteis'], ['Custo', 'Gratuito']], { action: 'ocorrencia' }),
  s('licenca-ruido', 'geral', 'Licença de ruído e ocupação da via pública', 'Festas, esplanadas e eventos', true,
    { title: 'O que precisa', items: ['Datas, horário e local do evento.', 'Planta com a área a ocupar, quando houver estruturas.', 'Pedido com 15 dias úteis de antecedência.'] },
    [['Antecedência', '15 dias úteis'], ['Custo', 'Tabela de taxas']]),
  s('reclamacoes', 'geral', 'Livro de reclamações e canal de denúncias', 'Reclamar ou denunciar uma irregularidade', true,
    { title: 'Onde', items: ['Livro de Reclamações Eletrónico, no portal livroreclamacoes.pt.', 'Livro físico no atendimento do Município.', 'O Canal de Denúncias garante a confidencialidade de quem denuncia.'] },
    [['Custo', 'Gratuito']]),
];

const xmas = (month, dayOfMonth, hour = 21) => {
  const now = new Date();
  const d = new Date(now.getFullYear(), month, dayOfMonth, hour);
  if (d < now) d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
};

export const news = [
  {
    id: 'n-natal', slug: 'concursos-de-natal', cat: 'cultura', label: 'Natal', photo: 'vila', published: true, date: day(-3),
    title: 'Concursos de Natal: inscrições abertas e participação gratuita',
    summary: 'Montras, presépios e casas iluminadas: há concursos para comerciantes, famílias e escolas de todo o concelho.',
    body: [
      ['lead', 'Estão abertas as inscrições nos Concursos de Natal do Município. A participação é gratuita e aberta a todos os munícipes, comerciantes e escolas.'],
      ['h2', 'As categorias'],
      ['ul', ['Montra de Natal, para o comércio local.', 'Presépio, para famílias, associações e escolas.', 'Casa iluminada, nas quatro freguesias.']],
      ['p', 'Um júri visita os participantes na semana antes do Natal. Os vencedores são anunciados na noite da Fogueira do Galo, a 24 de dezembro.'],
      ['h2', 'Como participar'],
      ['ol', ['Preencha a ficha de inscrição no Balcão Online ou no atendimento do Município.', 'Envie uma fotografia do trabalho terminado até ao dia indicado no regulamento.', 'Deixe a montra, o presépio ou a casa iluminada até ao Dia de Reis.']],
    ],
  },
  {
    id: 'n-habitacao', slug: 'fundo-social-apoio-habitacao', cat: 'social', label: 'Apoios', photo: 'vila', published: true, date: day(-7),
    title: 'Fundo Social de Apoio à Habitação: até 3 500 € para obras na casa própria',
    summary: 'Famílias com poucos recursos podem candidatar-se a um apoio para recuperar a casa onde vivem.',
    body: [
      ['lead', 'O Fundo Social de Apoio à Habitação financia obras de recuperação na habitação própria e permanente, até 3 500 euros por agregado.'],
      ['h2', 'Que obras são apoiadas'],
      ['ul', ['Telhados, paredes e caixilharias em mau estado.', 'Casas de banho e cozinhas sem condições.', 'Obras que melhorem a acessibilidade de pessoas idosas ou com deficiência.']],
      ['h2', 'Como se candidatar'],
      ['p', 'A candidatura faz-se com o requerimento de candidatura e de admissão, o termo de responsabilidade e o orçamento das obras. Os documentos e o regulamento estão disponíveis no Balcão Online e no serviço de ação social.'],
    ],
  },
  {
    id: 'n-amendoeira', slug: 'feira-amendoeira-em-flor-concurso-ilustracao', cat: 'cultura', label: 'Cultura', photo: 'amendoeiras', published: true, date: day(-11),
    title: 'Feira da Amendoeira em Flor prepara o Concurso de Ilustração',
    summary: 'A feira volta no fim de fevereiro e no início de março, com a edição seguinte do concurso de ilustração.',
    body: [
      ['lead', 'Quando as encostas do concelho ficam brancas, Freixo recebe a Feira da Amendoeira em Flor: dois fins de semana de produtos da terra, artesanato, música e passeios.'],
      ['p', 'O Concurso de Ilustração Amendoeira em Flor convida ilustradores de todo o país a desenhar o concelho em flor. Os trabalhos escolhidos são expostos durante a feira.'],
      ['p', 'O regulamento e as datas da próxima edição são publicados na secção de avisos e editais.'],
    ],
  },
  {
    id: 'n-escolar', slug: 'plano-transporte-escolar', cat: 'municipio', label: 'Educação', photo: 'douro', published: true, date: day(-15),
    title: 'Plano de Transporte Escolar para o ano letivo já está disponível',
    summary: 'O transporte é gratuito do pré-escolar ao secundário. O plano tem as rotas e os horários de todas as aldeias.',
    body: [
      ['lead', 'O Plano de Transporte Escolar para o ano letivo foi aprovado e já pode ser consultado.'],
      ['p', 'Como prevê o Decreto-Lei n.º 21/2019, o transporte é gratuito para os alunos da rede pública, do pré-escolar ao ensino secundário.'],
      ['p', 'Os estudantes do secundário e do superior que estudam fora do concelho podem ainda pedir o apoio municipal ao transporte.'],
    ],
  },
  {
    id: 'n-juventude', slug: 'municipio-amigo-da-juventude', cat: 'municipio', label: 'Município', photo: 'penedo', published: true, date: day(-21),
    title: 'Freixo de Espada à Cinta distinguido como Município Amigo da Juventude',
    summary: 'A distinção reconhece as políticas do Município para os jovens do concelho.',
    body: [
      ['lead', 'O Município recebeu a distinção de Município Amigo da Juventude.'],
      ['p', 'A distinção reconhece o trabalho com os jovens: as férias desportivas e culturais de verão, o apoio ao transporte de estudantes e o apoio ao associativismo.'],
    ],
  },
  {
    id: 'n-seda', slug: 'museu-seda-oficinas', cat: 'cultura', label: 'Artesanato', photo: 'seda', published: true, date: day(-26),
    title: 'Museu da Seda e do Território mostra a seda feita à mão no concelho',
    summary: 'As peças das artesãs estão expostas e à venda no museu, no Largo do Outeiro.',
    body: [
      ['lead', 'A seda é uma tradição antiga do concelho: no século XIX distribuíram-se aqui milhares de pés de amoreira para alimentar o bicho-da-seda.'],
      ['p', 'O Museu da Seda e do Território, aberto em 2015 na antiga Casa da Cadeia, mostra todo o processo, do casulo ao tecido, e tem uma sala com peças feitas pelas artesãs, que se podem comprar.'],
      ['p', 'Para visitas de grupo, contacte o museu pelo 279 658 163.'],
    ],
  },
];

export const events = [
  { id: 'e1', date: day(9), title: 'Iluminação de Natal', place: 'Centro histórico · 18h00' },
  { id: 'e2', date: day(16, 21), title: 'Concerto de Natal', place: 'Igreja Matriz · 21h00 · entrada livre' },
  { id: 'e3', date: day(23), title: 'Mercado de Natal', place: 'Largo do Outeiro · seda, amêndoa e azeite' },
  { id: 'e4', date: xmas(11, 24, 22), title: 'Fogueira do Galo', place: 'Praça da vila · 22h00' },
];

export const notices = [
  { id: 'a1', type: 'agua', title: 'Corte de água em Lagoaça', text: 'Para substituição de uma conduta.', when: 'Terça, das 9h00 às 13h00', until: day(3), pinned: true },
  { id: 'a2', type: 'transito', title: 'Obras na estrada do Penedo Durão', text: 'Circulação alternada com semáforos.', when: 'Até ao fim de dezembro', until: day(40) },
  { id: 'a3', type: 'ambiente', title: 'Recolha de monstros', text: 'Em Poiares e Ligares passa para as quintas-feiras.', when: 'Durante dezembro', until: day(40) },
];

export const editais = [
  { id: 'd1', title: 'Edital — sessão ordinária da Assembleia Municipal', sub: 'Ordem de trabalhos e convocatória', date: day(-2), kind: 'PDF' },
  { id: 'd2', title: 'Concursos de Natal — regulamento e ficha de inscrição', sub: 'Montras, presépios e casas iluminadas', date: day(-3), kind: 'PDF' },
  { id: 'd3', title: 'Aviso — interrupção do abastecimento de água em Lagoaça', sub: 'Aviso aos consumidores', date: day(-4), kind: 'PDF' },
  { id: 'd4', title: 'Plano de Transporte Escolar — ano letivo 2026-2027', sub: 'Rotas e horários', date: day(-15), kind: 'PDF' },
  { id: 'd5', title: 'Regulamento de transmissão em direto das reuniões da Câmara', sub: 'Em vigor', date: day(-40), kind: 'PDF' },
  { id: 'd6', title: 'Regimento da Câmara Municipal — alteração', sub: 'Aprovada em reunião de Câmara', date: day(-60), kind: 'PDF' },
];

export const documents = [
  { title: 'Tabela de taxas e tarifas do Município', sub: 'Valores em vigor para licenças e serviços', kind: 'PDF' },
  { title: 'Plano Diretor Municipal', sub: 'Regulamento e plantas', kind: 'PDF' },
  { title: 'Código de Ética e de Conduta', sub: 'Trabalhadores e eleitos', kind: 'PDF' },
  { title: 'Plano de prevenção de riscos de corrupção', sub: 'E norma de controlo interno', kind: 'PDF' },
  { title: 'Mapa de pessoal e organograma', sub: 'Organização dos serviços', kind: 'PDF' },
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
    id: 'r3', number: 'P-2026-0420', userId: null, name: 'António Pires', service: 'apoio-medicacao', status: 'aguarda', createdAt: day(-5),
    text: 'Pedido de apoio às despesas de medicação.',
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

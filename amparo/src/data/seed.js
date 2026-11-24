import bcrypt from 'bcryptjs';
import { DEFAULT_COSTS, DEFAULT_FEES, LAUNCH_ITEMS } from '../config/platform.js';

// Tudo o que está aqui é fictício e aparece marcado como exemplo no site.
// Os montantes "recebidos" vêm de doações simuladas: nenhum dinheiro foi movimentado.

const DAY = 24 * 60 * 60 * 1000;
const ago = (days, hours = 10) => new Date(Date.now() - days * DAY + (hours - 12) * 60 * 60 * 1000).toISOString();
const ymd = (daysAhead) => new Date(Date.now() + daysAhead * DAY).toISOString().slice(0, 10);
const month = (offset = 0) => {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + offset);
  return d.toISOString().slice(0, 7);
};

const userHash = bcrypt.hashSync('amparo2026', 10);
const staffHash = bcrypt.hashSync('amparo-equipa-2026', 10);

const person = (id, name, email, days) => ({ id, name, email, passwordHash: userHash, createdAt: ago(days), example: true });

export const users = [
  person('u-ana', 'Ana Exemplo', 'ana@exemplo.pt', 40),
  person('u-rui', 'Rui Exemplo', 'rui@exemplo.pt', 35),
  person('u-marta', 'Marta Exemplo', 'marta@exemplo.pt', 30),
  person('u-joao', 'João Exemplo', 'joao@exemplo.pt', 28),
  person('u-ines', 'Inês Exemplo', 'ines@exemplo.pt', 25),
  person('u-carlos', 'Carlos Exemplo', 'carlos@exemplo.pt', 22),
  person('u-luisa', 'Luísa Exemplo', 'luisa@exemplo.pt', 20),
  person('u-pedro', 'Pedro Exemplo', 'pedro@exemplo.pt', 18),
  person('u-sara', 'Sara Exemplo', 'sara@exemplo.pt', 12),
];

// O dono é criado no arranque a partir do .env; estes são os dois funcionários de exemplo
export const staff = [
  {
    id: 's-sofia',
    name: 'Sofia (moderação)',
    email: 'moderacao@amparo.exemplo',
    passwordHash: staffHash,
    role: 'funcionario',
    permissions: ['moderar', 'documentos', 'denuncias'],
    active: true,
    failedLogins: 0,
    lockedUntil: null,
    createdAt: ago(60),
  },
  {
    id: 's-tiago',
    name: 'Tiago (contas)',
    email: 'contas@amparo.exemplo',
    passwordHash: staffHash,
    role: 'funcionario',
    permissions: ['fundos', 'plataforma', 'registos'],
    active: true,
    failedLogins: 0,
    lockedUntil: null,
    createdAt: ago(60),
  },
];

const VIS = { alias: true, district: true, deadline: true, proofs: true, donors: true };

const ad = (data) => ({
  updates: [],
  reviews: [],
  privateNote: '',
  example: true,
  closedAt: null,
  ...data,
  visibility: { ...VIS, ...data.visibility },
});

export const ads = [
  ad({
    id: 'a-renda-setubal',
    slug: 'renda-de-dezembro-depois-de-ficar-sem-trabalho',
    ownerId: 'u-ana',
    status: 'ativo',
    category: 'renda',
    title: 'Renda de dezembro depois de ficar sem trabalho',
    story:
      'Trabalhei seis anos na mesma loja, que fechou em outubro. Já pedi o subsídio de desemprego, mas o primeiro pagamento só chega em janeiro. Vivo com a minha filha de nove anos e a renda é de 450 €. Tenho uma parte guardada e falta-me o resto para não me atrasar com o senhorio, que tem sido compreensivo mas também precisa do dinheiro.',
    amountCents: 32000,
    deadline: ymd(9),
    alias: 'Ana',
    district: 'Setúbal',
    privateNote: 'Posso enviar o contrato de arrendamento e a carta da loja se a moderação precisar.',
    updates: [{ at: ago(3), text: 'Obrigada a quem já ajudou. Entreguei hoje a parte que tinha guardada.' }],
    createdAt: ago(8),
    publishedAt: ago(7),
  }),
  ad({
    id: 'a-luz-braga',
    slug: 'fatura-da-luz-com-o-aquecedor-do-meu-pai',
    ownerId: 'u-joao',
    status: 'ativo',
    category: 'eletricidade',
    title: 'Fatura da luz com o aquecedor do meu pai',
    story:
      'O meu pai tem 81 anos e vive comigo. Com o frio, o aquecedor ficou ligado quase todo o dia e a fatura de novembro veio muito mais alta do que costuma. Já pedi a tarifa social, que ainda está em análise. Preciso de ajuda só com esta fatura.',
    amountCents: 11840,
    deadline: ymd(12),
    alias: 'João',
    district: 'Braga',
    createdAt: ago(6),
    publishedAt: ago(5),
  }),
  ad({
    id: 'a-oculos-porto',
    slug: 'oculos-para-o-meu-filho-ver-o-quadro',
    ownerId: 'u-marta',
    status: 'ativo',
    category: 'saude',
    title: 'Óculos para o meu filho ver o quadro',
    story:
      'O professor reparou que o meu filho, de sete anos, não conseguia ler o que estava no quadro. A consulta no centro de saúde já foi feita e a receita diz que precisa de óculos com graduação alta. O orçamento mais barato que encontrei foi de 145 €.',
    amountCents: 14500,
    deadline: null,
    alias: 'Marta',
    district: 'Porto',
    visibility: { deadline: false },
    createdAt: ago(5),
    publishedAt: ago(4),
  }),
  ad({
    id: 'a-passe-lisboa',
    slug: 'passe-para-chegar-ao-novo-emprego',
    ownerId: 'u-ines',
    status: 'ativo',
    category: 'transportes',
    title: 'Passe para chegar ao novo emprego',
    story:
      'Comecei a trabalhar num armazém em Alverca na semana passada. O primeiro ordenado só cai no fim do mês e até lá preciso do passe para ir e vir todos os dias. Depois disso fico bem.',
    amountCents: 4000,
    deadline: ymd(4),
    alias: '',
    district: 'Lisboa',
    visibility: { alias: false },
    createdAt: ago(4),
    publishedAt: ago(3),
  }),
  ad({
    id: 'a-agua-evora',
    slug: 'agua-depois-de-uma-fuga-no-contador',
    ownerId: 'u-carlos',
    status: 'ativo',
    category: 'agua',
    title: 'Água depois de uma fuga no contador',
    story:
      'Houve uma fuga antes do contador que só descobrimos com a fatura. A Câmara reconheceu parte do valor mas o resto continua a ser nosso. Somos um casal reformado e a pensão deste mês já está toda comprometida.',
    amountCents: 9620,
    deadline: ymd(15),
    alias: 'Carlos',
    district: 'Évora',
    createdAt: ago(3),
    publishedAt: ago(2),
  }),
  ad({
    id: 'a-compras-coimbra',
    slug: 'compras-do-mes-para-tres-pessoas',
    ownerId: 'u-luisa',
    status: 'ativo',
    category: 'alimentacao',
    title: 'Compras do mês para três pessoas',
    story:
      'Sou mãe sozinha de dois rapazes e trabalho a meio tempo. Já recebemos um cabaz da junta, mas não chega para o mês inteiro. Gostava de conseguir fazer uma compra grande com leite, fruta e o que eles levam para a escola.',
    amountCents: 18000,
    deadline: ymd(10),
    alias: 'Luísa',
    district: 'Coimbra',
    visibility: { donors: false },
    createdAt: ago(2),
    publishedAt: ago(2),
  }),
  ad({
    id: 'a-livros-viseu',
    slug: 'material-para-o-curso-profissional',
    ownerId: 'u-pedro',
    status: 'ativo',
    category: 'educacao',
    title: 'Material para o curso profissional',
    story:
      'Entrei num curso profissional de eletricidade. Os livros estão pagos pela escola, mas o kit de ferramentas e as botas de segurança são por nossa conta. Os meus pais não conseguem pagar tudo este mês.',
    amountCents: 8500,
    deadline: ymd(20),
    alias: 'Pedro',
    district: 'Viseu',
    createdAt: ago(1),
    publishedAt: ago(1),
  }),
  ad({
    id: 'a-medicamentos-faro',
    slug: 'medicamentos-para-tres-meses',
    ownerId: 'u-sara',
    status: 'em_analise',
    category: 'saude',
    title: 'Medicamentos para três meses',
    story: 'Tenho uma doença crónica e os medicamentos custam cerca de 60 € por mês depois da comparticipação.',
    amountCents: 18000,
    deadline: null,
    alias: 'Sara',
    district: 'Faro',
    visibility: { deadline: false },
    privateNote: 'Tenho a receita e as faturas da farmácia dos últimos meses.',
    createdAt: ago(0, 9),
    publishedAt: null,
  }),
  ad({
    id: 'a-renda-aveiro',
    slug: 'renda-de-outubro-em-atraso',
    ownerId: 'u-rui',
    status: 'concluido',
    category: 'renda',
    title: 'Renda de outubro em atraso',
    story: 'Fiquei duas semanas de baixa sem receber e atrasei a renda de outubro. Com a ajuda de várias pessoas ficou paga.',
    amountCents: 35000,
    deadline: null,
    alias: 'Rui',
    district: 'Aveiro',
    visibility: { deadline: false },
    updates: [{ at: ago(18), text: 'Já está tudo pago. Muito obrigado.' }],
    createdAt: ago(34),
    publishedAt: ago(33),
    closedAt: ago(19),
  }),
];

// Provas de exemplo. Os ficheiros são imagens geradas com a palavra EXEMPLO, copiadas para a pasta privada no arranque.
export const documents = [
  { id: 'd-ana-contrato', ownerId: 'u-ana', adId: 'a-renda-setubal', description: 'Recibo de renda de novembro', file: 'recibo-renda.png', mime: 'image/png', shareRequested: true, publicStatus: 'aprovado', verified: true, metadataRemoved: true, createdAt: ago(8) },
  { id: 'd-ana-carta', ownerId: 'u-ana', adId: 'a-renda-setubal', description: 'Declaração de fim de contrato da loja', file: 'declaracao.png', mime: 'image/png', shareRequested: false, publicStatus: 'privado', verified: true, metadataRemoved: true, createdAt: ago(8) },
  { id: 'd-joao-fatura', ownerId: 'u-joao', adId: 'a-luz-braga', description: 'Fatura de eletricidade de novembro', file: 'fatura-luz.png', mime: 'image/png', shareRequested: true, publicStatus: 'aprovado', verified: true, metadataRemoved: true, createdAt: ago(6) },
  { id: 'd-marta-orcamento', ownerId: 'u-marta', adId: 'a-oculos-porto', description: 'Orçamento da ótica', file: 'orcamento.png', mime: 'image/png', shareRequested: false, publicStatus: 'privado', verified: true, metadataRemoved: true, createdAt: ago(5) },
  { id: 'd-sara-receita', ownerId: 'u-sara', adId: 'a-medicamentos-faro', description: 'Receita médica', file: 'declaracao.png', mime: 'image/png', shareRequested: false, publicStatus: 'privado', verified: false, metadataRemoved: true, createdAt: ago(0, 9) },
];

// Valores de cada doação simulada por anúncio [cêntimos, dias atrás, nome público ou null]
const DONATIONS = {
  'a-renda-setubal': [[5000, 7, 'Teresa'], [2000, 6, null], [10000, 5, null], [1500, 4, 'Miguel'], [2500, 3, null], [5000, 2, null], [2000, 1, 'Rui']],
  'a-luz-braga': [[2000, 5, null], [3000, 4, 'Helena'], [1000, 3, null], [2500, 2, null]],
  'a-oculos-porto': [[2500, 4, null], [5000, 3, 'Paulo'], [2000, 1, null]],
  'a-passe-lisboa': [[1000, 3, null], [1500, 2, 'Rita'], [1000, 1, null]],
  'a-agua-evora': [[2000, 2, null], [1500, 1, null]],
  'a-compras-coimbra': [[5000, 2, null], [2500, 1, null]],
  'a-livros-viseu': [[1000, 1, 'Nuno']],
  'a-renda-aveiro': [[10000, 32, null], [5000, 30, 'Clara'], [7500, 27, null], [5000, 25, null], [2500, 22, null], [5000, 20, 'Ana'], [1100, 19, null]],
};

const donors = ['u-rui', 'u-ana', 'u-marta', 'u-joao', 'u-ines', 'u-carlos'];
const fee = (c) => Math.round(c * DEFAULT_FEES.providerPercent / 100) + DEFAULT_FEES.providerFixedCents;

export const donations = Object.entries(DONATIONS).flatMap(([adId, list]) =>
  list.map(([cents, days, name], i) => {
    const owner = ads.find((a) => a.id === adId).ownerId;
    const donorId = donors.filter((d) => d !== owner)[i % 5];
    return {
      id: `dn-${adId}-${i}`,
      adId,
      donorId,
      amountCents: cents - fee(cents),
      feeCents: fee(cents),
      chargedCents: cents,
      coverFee: false,
      showName: Boolean(name),
      publicName: name ?? '',
      status: 'simulado',
      provider: 'demo',
      createdAt: ago(days, 9 + (i % 8)),
      confirmedAt: ago(days, 9 + (i % 8)),
      example: true,
    };
  }),
);

export const payouts = [
  { id: 'p-aveiro', adId: 'a-renda-aveiro', cents: 35000, method: 'Pagamento direto ao senhorio (simulado)', note: 'Entrega de exemplo', staffId: 's-tiago', createdAt: ago(18), example: true },
];

export const conversations = [
  { id: 'c-ana-rui', adId: 'a-renda-setubal', askerId: 'u-rui', ownerId: 'u-ana', status: 'aberta', createdAt: ago(4), updatedAt: ago(3) },
  { id: 'c-joao-ines', adId: 'a-luz-braga', askerId: 'u-ines', ownerId: 'u-joao', status: 'pendente', createdAt: ago(1), updatedAt: ago(1) },
];

export const messages = [
  { id: 'm1', conversationId: 'c-ana-rui', authorId: 'u-rui', text: 'Olá Ana. O valor que pede já tem em conta a parte que tinha guardada?', masked: false, createdAt: ago(4) },
  { id: 'm2', conversationId: 'c-ana-rui', authorId: 'u-ana', text: 'Olá Rui, sim. A renda é de 450 € e eu tenho 130 €, por isso faltam 320 €. Partilho consigo o recibo da renda.', masked: false, createdAt: ago(3) },
  { id: 'm3', conversationId: 'c-ana-rui', authorId: 'u-ana', text: '', documentId: 'd-ana-contrato', masked: false, createdAt: ago(3) },
  { id: 'm4', conversationId: 'c-joao-ines', authorId: 'u-ines', text: 'Olá João, a fatura é só do mês de novembro ou inclui meses anteriores?', masked: false, createdAt: ago(1) },
];

export const reports = [
  { id: 'r1', adId: 'a-compras-coimbra', reporterId: 'u-pedro', reason: 'dados_pessoais', details: 'Na primeira versão do texto aparecia o nome da escola dos filhos.', status: 'pendente', priority: 'alta', createdAt: ago(1) },
];

export const contributions = [
  { id: 'k1', donorId: 'u-rui', amountCents: 2000, showName: true, publicName: 'Rui', status: 'simulado', provider: 'demo', createdAt: ago(50), example: true },
  { id: 'k2', donorId: null, amountCents: 5000, showName: false, publicName: '', status: 'simulado', provider: 'demo', createdAt: ago(44), example: true },
  { id: 'k3', donorId: 'u-marta', amountCents: 1000, showName: false, publicName: '', status: 'simulado', provider: 'demo', createdAt: ago(31), example: true },
  { id: 'k4', donorId: 'u-joao', amountCents: 2500, showName: true, publicName: 'João', status: 'simulado', provider: 'demo', createdAt: ago(27), example: true },
  { id: 'k5', donorId: null, amountCents: 1500, showName: false, publicName: '', status: 'simulado', provider: 'demo', createdAt: ago(6), example: true },
  { id: 'k6', donorId: 'u-carlos', amountCents: 1000, showName: true, publicName: 'Carlos', status: 'simulado', provider: 'demo', createdAt: ago(2), example: true },
];
contributions.forEach((c) => (c.confirmedAt = c.createdAt));

export const expenses = [
  { id: 'e1', month: month(-2), label: 'Custos de exemplo de ' + month(-2), cents: 4000, note: 'Despesa de exemplo', staffId: 's-tiago', createdAt: ago(40), example: true },
  { id: 'e2', month: month(-1), label: 'Custos de exemplo de ' + month(-1), cents: 4000, note: 'Despesa de exemplo', staffId: 's-tiago', createdAt: ago(10), example: true },
];

export const settings = [
  {
    id: 'plataforma',
    fees: { ...DEFAULT_FEES },
    costs: DEFAULT_COSTS.map((c) => ({ ...c })),
    launch: Object.fromEntries(LAUNCH_ITEMS.map(([id]) => [id, { done: false, note: '' }])),
  },
];

export const auditLog = [
  { id: 'l1', staffId: 's-sofia', staffName: 'Sofia (moderação)', action: 'anuncio.aprovar', target: 'a-livros-viseu', details: 'Aprovado', ip: '127.0.0.1', createdAt: ago(1) },
  { id: 'l2', staffId: 's-sofia', staffName: 'Sofia (moderação)', action: 'documento.ver', target: 'd-marta-orcamento', details: 'Orçamento da ótica', ip: '127.0.0.1', createdAt: ago(4) },
  { id: 'l3', staffId: 's-tiago', staffName: 'Tiago (contas)', action: 'despesa.registar', target: 'e2', details: '40,00 €', ip: '127.0.0.1', createdAt: ago(10) },
];

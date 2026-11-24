export const SITE = {
  name: 'Amparo',
  tagline: 'Ajuda entre pessoas para pagar as contas do mês',
  email: 'ajuda@amparo.exemplo',
};

export const CATEGORIES = [
  ['renda', 'Renda', 'Renda ou prestação da casa'],
  ['eletricidade', 'Eletricidade', 'Fatura da luz ou do gás'],
  ['agua', 'Água', 'Fatura da água'],
  ['alimentacao', 'Alimentação', 'Compras de supermercado'],
  ['saude', 'Saúde', 'Medicamentos, consultas, óculos'],
  ['transportes', 'Transportes', 'Passe ou combustível para ir trabalhar'],
  ['educacao', 'Educação', 'Material escolar, propinas, explicações'],
];
export const CATEGORY_IDS = CATEGORIES.map(([id]) => id);
export const categoryLabel = (id) => CATEGORIES.find(([v]) => v === id)?.[1] ?? 'Outra';

export const DISTRICTS = [
  'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria',
  'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu',
  'Açores', 'Madeira',
];

export const AD_STATUS = {
  em_analise: 'Em análise',
  alteracoes: 'Alterações pedidas',
  ativo: 'Ativo',
  recusado: 'Recusado',
  suspenso: 'Suspenso',
  concluido: 'Concluído',
};

export const REPORT_REASONS = [
  ['suspeito', 'Parece falso ou enganador'],
  ['abusivo', 'Conteúdo abusivo ou ofensivo'],
  ['dados_pessoais', 'Expõe dados pessoais (meus ou de outra pessoa)'],
  ['outro', 'Outro motivo'],
];

// Permissões que o dono pode dar a cada funcionário. O dono tem todas, mais "equipa" e "lancamento".
export const PERMISSIONS = [
  ['moderar', 'Moderar anúncios', 'Aprovar, pedir alterações ou recusar anúncios'],
  ['documentos', 'Ver provas privadas', 'Abrir os documentos enviados com os anúncios (cada abertura fica registada)'],
  ['denuncias', 'Tratar denúncias', 'Ver denúncias e suspender anúncios'],
  ['fundos', 'Doações e entregas', 'Ver doações e registar entregas de dinheiro'],
  ['plataforma', 'Custos da plataforma', 'Registar despesas de alojamento, domínio e manutenção'],
  ['utilizadores', 'Contas e dados', 'Tratar pedidos de eliminação de dados'],
  ['registos', 'Registo de ações', 'Ver o que cada pessoa da equipa fez'],
];
export const OWNER_ONLY = [
  ['equipa', 'Equipa', 'Criar credenciais e definir permissões'],
  ['lancamento', 'Lançamento', 'Comissões, custos mensais e lista antes do lançamento'],
];
export const STAFF_PERMISSIONS = PERMISSIONS.map(([p]) => p);
export const ALL_PERMISSIONS = [...STAFF_PERMISSIONS, ...OWNER_ONLY.map(([p]) => p)];

// Valores de exemplo. O dono confirma-os na gestão antes do lançamento.
export const DEFAULT_FEES = {
  platformPercent: 0,
  providerPercent: 1.4,
  providerFixedCents: 25,
  confirmed: false,
};

export const DEFAULT_COSTS = [
  { id: 'alojamento', label: 'Alojamento do servidor e base de dados', cents: 2200 },
  { id: 'dominio', label: 'Domínio e email', cents: 300 },
  { id: 'seguranca', label: 'Cópias de segurança e certificados', cents: 600 },
  { id: 'manutencao', label: 'Manutenção e atualizações de segurança', cents: 900 },
];

// O que tem de estar decidido antes de a plataforma aceitar dinheiro real.
// Enquanto um ponto estiver por definir, só funciona o prestador "demo".
export const LAUNCH_ITEMS = [
  ['entidade', 'Quem gere os fundos', 'Entidade responsável (associação, empresa ou instituição de pagamento) e o seu enquadramento legal.'],
  ['prestador', 'Prestador de pagamentos', 'Contrato com um prestador autorizado a operar em Portugal. A plataforma nunca guarda dados de cartões.'],
  ['entrega', 'Como o dinheiro chega a quem pede', 'Por exemplo, pagamento direto da fatura ao senhorio ou ao fornecedor, ou transferência para a pessoa, e em que prazo.'],
  ['comissoes', 'Comissões confirmadas', 'Comissões reais do prestador e da plataforma, mostradas antes de cada doação.'],
  ['reembolsos', 'Reembolsos', 'Em que casos uma doação é devolvida (anúncio recusado depois de receber, fraude) e em quanto tempo.'],
  ['reclamacoes', 'Reclamações', 'Como e onde reclamar, incluindo o Livro de Reclamações quando se aplicar, e prazos de resposta.'],
  ['fiscal', 'Enquadramento fiscal', 'Confirmado com um contabilista certificado. Até lá não se diz que as doações são dedutíveis.'],
  ['dados', 'Responsável pelo tratamento de dados', 'Quem responde perante o RGPD, contacto para pedidos e prazos de conservação confirmados.'],
  ['termos', 'Termos e privacidade revistos', 'Revistos por um jurista antes de abrir ao público.'],
  ['identidade', 'Verificação de identidade', 'Se e como se confirma quem pede ajuda. Ainda não existe: os anúncios são moderados mas não verificados.'],
  ['seguranca', 'Revisão de segurança', 'Testes de intrusão, cópias de segurança cifradas e autenticação em dois passos para a equipa.'],
];

export const RETENTION = {
  documentsAfterCloseDays: 90,
  messagesAfterCloseDays: 365,
  deletedAccountDays: 30,
};

export const LIMITS = {
  adMinCents: 500,
  adMaxCents: 300000,
  donationMinCents: 100,
  donationMaxCents: 100000,
  contributionMinCents: 100,
  contributionMaxCents: 50000,
  uploadBytes: 5 * 1024 * 1024,
  documentsPerAd: 4,
};

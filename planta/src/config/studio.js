// Dados do atelier (a arquiteta e os contactos são fictícios)
export const STUDIO = {
  name: 'Leonor Castelo',
  brand: 'Leonor Castelo Arquitetura',
  short: 'LC',
  since: 2016,
  email: 'ola@leonorcastelo.pt',
  phone: '+351 220 000 000',
  school: 'DARQ',
  offices: [
    {
      key: 'matosinhos',
      label: 'Sede',
      city: 'Matosinhos',
      street: 'Rua do Farol, 42 – 1.º andar',
      postalCode: '4450-000',
      hours: 'Segunda a sexta, 9h30 às 18h30',
      geo: { latitude: 41.1844, longitude: -8.6963 },
    },
    {
      key: 'viseu',
      label: 'Escritório Beiras',
      city: 'Viseu',
      street: 'Largo das Oliveiras, 7 – loja B',
      postalCode: '3500-000',
      hours: 'Terças e quintas, com marcação',
      geo: { latitude: 40.6566, longitude: -7.9125 },
    },
  ],
  social: [
    ['Instagram', 'https://www.instagram.com/'],
    ['LinkedIn', 'https://www.linkedin.com/'],
    ['Pinterest', 'https://www.pinterest.pt/'],
  ],
};

// O que a pessoa tem quando pede uma reunião
export const SITUATIONS = [
  ['terreno', 'Um terreno'],
  ['reabilitar', 'Uma casa para reabilitar'],
  ['apartamento', 'Um apartamento'],
  ['ideia', 'Só uma ideia'],
];

export const BUDGETS = [
  ['ate-150', 'Até 150 mil €'],
  ['150-300', '150 a 300 mil €'],
  ['300-mais', 'Mais de 300 mil €'],
  ['nao-sei', 'Ainda não sei'],
];

// As fases de um projeto de arquitetura, como folhas de um caderno de desenhos
export const PHASES = [
  { key: 'programa', code: 'A-100', label: 'Programa e levantamento', detail: 'Conversa, visita ao terreno e levantamento do que existe.' },
  { key: 'estudo', code: 'A-200', label: 'Estudo prévio', detail: 'Primeiras plantas, maqueta e as decisões grandes da casa.' },
  { key: 'licenciamento', code: 'A-300', label: 'Licenciamento', detail: 'Projeto entregue na câmara e respostas aos pareceres.' },
  { key: 'execucao', code: 'A-400', label: 'Projeto de execução', detail: 'Pormenores, mapa de acabamentos e consulta aos empreiteiros.' },
  { key: 'obra', code: 'A-500', label: 'Acompanhamento de obra', detail: 'Visitas semanais à obra até à entrega das chaves.' },
];

export const REQUEST_STATUS = [
  ['novo', 'Novo'],
  ['conversa', 'Em conversa'],
  ['proposta', 'Proposta enviada'],
  ['arquivado', 'Arquivado'],
];

export const STUDIO = {
  name: 'Bairro',
  tagline: 'Estúdio de design no Porto',
  street: 'Rua do Almada 212, 2.º',
  postalCode: '4050-032',
  city: 'Porto',
  email: 'ola@bairro.studio',
  phone: '+351 222 000 212',
  phoneLabel: '222 000 212',
  hours: 'Segunda a sexta, 9h30 às 18h30',
  geo: { latitude: 41.1495, longitude: -8.6118 },
  instagram: 'https://www.instagram.com/',
};

export const CATEGORIES = [
  { slug: 'marcas', name: 'Marcas' },
  { slug: 'embalagem', name: 'Embalagem' },
  { slug: 'sites', name: 'Sites' },
  { slug: 'cartazes', name: 'Cartazes' },
];

export const PHASES = ['Conversa inicial', 'Pesquisa', 'Esboços', 'Proposta final', 'Afinação', 'Entrega'];

export const REQUEST_STATUS = [
  { id: 'novo', name: 'Novo' },
  { id: 'em-analise', name: 'Em análise' },
  { id: 'aceite', name: 'Aceite' },
  { id: 'recusado', name: 'Recusado' },
];

export const PROOF_STATUS = {
  pendente: 'À espera da sua opinião',
  aprovado: 'Aprovado',
  alteracoes: 'Pediu alterações',
};

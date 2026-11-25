// Tudo o que aqui está é fictício: o estúdio, as pessoas e os clientes foram inventados para a demonstração
export const SITE = {
  name: 'Pilha',
  tagline: 'Estúdio de marcas e sites',
  city: 'Lisboa',
  area: 'Marvila, Lisboa',
  email: 'ola@pilha.exemplo',
  hours: 'Segunda a sexta, das 10h às 18h',
};

// Os cinco serviços são os blocos da pilha. A forma e a cor de cada bloco vivem aqui
// para que a página inicial, os serviços e o painel usem sempre as mesmas.
export const SERVICES = [
  {
    slug: 'marcas',
    name: 'Marcas',
    sub: 'identidade',
    shape: 'pill',
    color: 'red',
    lead: 'Nome, símbolo, cor, letra e a maneira de falar. Uma marca que aguenta ser posta à prova num letreiro, numa fatura e num autocolante.',
    includes: ['Conversa e pesquisa sobre o negócio', 'Nome (quando é preciso)', 'Logótipo e símbolo', 'Cores e tipos de letra', 'Tom de voz com exemplos', 'Guia de marca em PDF e ficheiros prontos a usar'],
    duration: '6 a 10 semanas',
    from: 'desde 4 800 €',
  },
  {
    slug: 'sites',
    name: 'Sites',
    sub: 'e lojas',
    shape: 'square',
    color: 'blue',
    lead: 'Sites rápidos, que se leem bem no telemóvel e que o cliente consegue atualizar sozinho. Lojas pequenas sem mensalidades escondidas.',
    includes: ['Estrutura e textos com o cliente', 'Design de cada página', 'Programação à medida', 'Painel para editar conteúdos', 'SEO técnico e medições de velocidade', 'Formação de uma hora no fim'],
    duration: '8 a 14 semanas',
    from: 'desde 6 500 €',
  },
  {
    slug: 'movimento',
    name: 'Movimento',
    sub: 'vídeo',
    shape: 'circle',
    color: 'ink',
    lead: 'Logótipos que mexem, genéricos, vídeos curtos para redes e animação para ecrãs de loja. Sempre com versão sem som.',
    includes: ['Guião e quadros-chave', 'Animação 2D', 'Sonoplastia com parceiros', 'Versões para cada rede', 'Ficheiros leves para a web'],
    duration: '3 a 6 semanas',
    from: 'desde 2 200 €',
  },
  {
    slug: 'rotulos',
    name: 'Rótulos',
    sub: 'embalagem',
    shape: 'arch',
    color: 'yellow',
    lead: 'Latas, garrafas, caixas e sacos. Desenhamos a pensar na prateleira, nas regras de rotulagem e na gráfica que vai imprimir.',
    includes: ['Estudo da prateleira', 'Sistema para várias referências', 'Ilustração quando faz sentido', 'Textos legais revistos com o cliente', 'Artes finais e acompanhamento na gráfica'],
    duration: '5 a 9 semanas',
    from: 'desde 3 200 €',
  },
  {
    slug: 'livros',
    name: 'Livros',
    sub: 'edição',
    shape: 'tall',
    color: 'pink',
    lead: 'Capas, coleções e paginação para editoras pequenas e para quem quer fazer um livro só uma vez na vida.',
    includes: ['Capa e lombada', 'Sistema de coleção', 'Paginação do miolo', 'Escolha de papel com a gráfica', 'Provas de cor e acompanhamento'],
    duration: '4 a 8 semanas',
    from: 'desde 1 900 €',
  },
];

export const serviceBySlug = (slug) => SERVICES.find((s) => s.slug === slug);
export const serviceName = (slug) => serviceBySlug(slug)?.name ?? slug;
export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

// As fases de um projeto, pela ordem em que acontecem
export const PHASES = [
  { key: 'briefing', label: 'Briefing' },
  { key: 'proposta', label: 'Proposta' },
  { key: 'esbocos', label: 'Esboços' },
  { key: 'provas', label: 'Provas' },
  { key: 'artes-finais', label: 'Artes finais' },
  { key: 'entregue', label: 'Entregue' },
];
export const PHASE_KEYS = PHASES.map((p) => p.key);
export const phaseLabel = (key) => PHASES.find((p) => p.key === key)?.label ?? key;

export const BUDGETS = [
  ['ate-3000', 'Até 3 000 €'],
  ['3000-8000', '3 000 a 8 000 €'],
  ['8000-15000', '8 000 a 15 000 €'],
  ['mais-15000', 'Mais de 15 000 €'],
  ['nao-sei', 'Ainda não sei'],
];
export const BUDGET_KEYS = BUDGETS.map(([k]) => k);
export const budgetLabel = (key) => BUDGETS.find(([k]) => k === key)?.[1] ?? key;

export const BRIEF_STATUS = [
  ['novo', 'Novo'],
  ['em-conversa', 'Em conversa'],
  ['aceite', 'Aceite'],
  ['recusado', 'Recusado'],
];
export const BRIEF_STATUS_KEYS = BRIEF_STATUS.map(([k]) => k);

// Imagens geradas em scripts/imagens (cada caminho tem as versões -480, -800 e -1200 em webp)
const WORK_SLUGS = [
  ['lota-velha', 'Lota Velha'],
  ['teatro-do-largo', 'Teatro do Largo'],
  ['fermento-lento', 'Fermento Lento'],
  ['mao-esquerda', 'Mão Esquerda'],
  ['grua', 'Grua'],
  ['contracorrente', 'Contracorrente'],
  ['oficina-bicla', 'Oficina Bicla'],
  ['atlas-miudo', 'Atlas Miúdo'],
  ['terra-alta', 'Terra Alta'],
  ['radio-quintal', 'Rádio Quintal'],
  ['bigode', 'Bigode'],
];
export const WORK_IMAGES = WORK_SLUGS.map(([slug, label]) => ({
  path: `/img/trabalhos/${slug}-1`,
  label,
  details: [`/img/trabalhos/${slug}-2`, `/img/trabalhos/${slug}-3`],
}));

export const PROOF_IMAGES = [
  ['teatro-inicio-1', 'Teatro · página inicial v1'],
  ['teatro-inicio-2', 'Teatro · página inicial v2'],
  ['teatro-bilheteira-1', 'Teatro · bilheteira'],
  ['teatro-escolas-1', 'Teatro · escolas'],
  ['teatro-programacao-1', 'Teatro · programação'],
  ['lota-esbocos-1', 'Lota Velha · esboços'],
  ['lota-polvo-1', 'Lota Velha · lata do polvo'],
  ['sotao-simbolo-1', 'Sótão · caminhos para o símbolo'],
].map(([name, label]) => ({ path: `/img/provas/${name}`, label }));

export const PEOPLE = [
  { name: 'Inês Barata', role: 'Direção criativa e marcas', shape: 'pill', color: 'red', note: 'Desenha marcas e não deixa sair nada sem ser testado à escala de um selo.' },
  { name: 'Tomás Valente', role: 'Sites e código', shape: 'square', color: 'blue', note: 'Escreve o código dos sites e mede a velocidade de tudo, até do café.' },
  { name: 'Carolina Mexia', role: 'Movimento e ilustração', shape: 'circle', color: 'ink', note: 'Anima logótipos e desenha à mão o que o computador não sabe fazer.' },
  { name: 'Rui Paixão', role: 'Edição, embalagem e gráficas', shape: 'tall', color: 'pink', note: 'Conhece as gráficas pelo nome e sabe de cor as regras dos rótulos.' },
];

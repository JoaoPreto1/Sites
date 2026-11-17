import { esc, icon, win } from '../components.js';

export const STEPS = [
  {
    name: 'Conversa inicial',
    time: '1 dia',
    text: 'Passamos uma manhã no seu negócio, ou uma hora numa videochamada. Queremos perceber quem são os clientes, o que vende melhor e o que o incomoda na imagem que tem hoje.',
    get: 'Um resumo da conversa por escrito e o orçamento fechado.',
  },
  {
    name: 'Pesquisa',
    time: '1 semana',
    text: 'Olhamos para a rua, para a concorrência e para o que os seus clientes já conhecem. Juntamos fotografias, letras, cores e materiais num painel de referências.',
    get: 'O painel de referências, para confirmar que vamos no caminho certo.',
  },
  {
    name: 'Esboços',
    time: '1 a 2 semanas',
    text: 'Desenhamos duas ou três ideias diferentes, já aplicadas a coisas reais: um saco, uma montra, a página inicial. Nada de logótipos soltos num fundo branco.',
    get: 'As provas na sua área de cliente, para aprovar ou comentar.',
  },
  {
    name: 'Proposta final',
    time: '1 a 2 semanas',
    text: 'Desenvolvemos a ideia escolhida em todas as peças combinadas. Imprimimos tudo em tamanho real e levamos ao seu espaço para ver com a luz de lá.',
    get: 'A proposta completa, impressa e no ecrã.',
  },
  {
    name: 'Afinação',
    time: '1 semana',
    text: 'Afinamos o que for preciso. As alterações nesta fase estão incluídas no preço, sem contas a fazer a cada pedido.',
    get: 'Os ficheiros finais para gráfica e para o site.',
  },
  {
    name: 'Entrega',
    time: '1 dia',
    text: 'Entregamos uma pasta com tudo arrumado e um manual curto de como usar a marca. Nos 30 dias seguintes, pequenas mudanças são por nossa conta.',
    get: 'A pasta final, o manual e 30 dias de apoio.',
  },
];

export function processWindows() {
  const body = `<div class="wizard" data-wizard>
    <aside class="wizard__side" aria-hidden="true">
      <span class="wizard__logo">✦</span>
      <ol class="wizard__list">${STEPS.map((s, i) => `<li data-dot="${i}">${esc(s.name)}</li>`).join('')}</ol>
    </aside>
    <div class="wizard__main">
      <header class="wizard__head">
        <h1 class="wizard__title">Como trabalhamos</h1>
        <p class="mute">Bem-vindo ao assistente de instalação de um projeto Bairro. São seis passos, entre seis e dez semanas no total.</p>
      </header>
      <ol class="wizard__steps">
        ${STEPS.map(
          (s, i) => `<li class="wizard__step" data-step="${i}">
          <p class="wizard__n">Passo ${i + 1} de ${STEPS.length} · ${esc(s.time)}</p>
          <h2 class="wizard__name">${esc(s.name)}</h2>
          <p>${esc(s.text)}</p>
          <p class="wizard__get">${icon('doc')}<span><b>O que recebe:</b> ${esc(s.get)}</span></p>
        </li>`,
        ).join('')}
      </ol>
      <div class="wizard__progress progress" aria-hidden="true"><span style="--value:${100 / STEPS.length}%" data-progress></span></div>
      <div class="wizard__nav">
        <button class="btn" type="button" data-prev disabled>‹ Anterior</button>
        <button class="btn btn--primary" type="button" data-next>Seguinte ›</button>
        <a class="btn btn--primary" href="/orcamento" data-finish hidden>Começar o meu projeto</a>
        <a class="link small" href="/precos">Ver preços</a>
      </div>
    </div>
  </div>`;

  return [
    {
      id: 'processo',
      label: 'Como trabalhamos',
      ico: 'app',
      html: win({
        id: 'processo',
        url: '/processo',
        title: 'instalar_projeto.exe',
        label: 'Como trabalhamos',
        primary: true,
        x: 100,
        y: 40,
        w: 900,
        cls: 'wizard-win',
        script: 'process',
        flush: true,
        body,
        status: '<span>Espaço necessário: um café e boa vontade</span><span>6 a 10 semanas</span>',
      }),
    },
  ];
}

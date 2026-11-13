export const notFoundView = () => `
  <section class="lost wrap--narrow">
    <p class="mono lost__code">Erro 404 · garrafa partida</p>
    <svg class="lost__bottle" viewBox="0 0 160 120" aria-hidden="true">
      <path d="M8 104 L60 92 L66 70 L74 66 L80 82 L118 74 L126 88 L152 84" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <path d="M20 108 C40 98 70 112 100 104 C120 99 140 110 156 106" fill="none" stroke="#7b1e2c" stroke-width="2"/>
    </svg>
    <h1 class="title-xl">Esta página <em>não existe.</em></h1>
    <p>Pode ter sido um vinho que esgotou, ou um link mal copiado. A carta, essa, continua cheia.</p>
    <div class="lost__links"><a class="btn" href="/carta">Abrir a carta</a><a class="link" href="/">Voltar ao início</a></div>
  </section>`;

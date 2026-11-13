const NAV = [
  ['/carta', 'A carta'],
  ['/produtores', 'Produtores'],
  ['/provas', 'Provas'],
  ['/clube', 'Clube'],
];

const current = (path, href) => (path === href || path.startsWith(`${href}/`) ? ' aria-current="page"' : '');

export function header(path) {
  const links = NAV.map(([href, label]) => `<a href="${href}"${current(path, href)}>${label}</a>`).join('');

  return `
  <header class="masthead">
    <div class="masthead__top mono">
      <span>Garrafeira no Porto</span>
      <span class="masthead__hours">Rua de Cedofeita 212 · terça a sábado, 11h–20h</span>
      <span>Envio grátis a partir de 60 €</span>
    </div>
    <div class="masthead__main">
      <nav class="masthead__nav" aria-label="Principal">${links}</nav>
      <a class="wordmark" href="/" aria-label="Cepa, página inicial"><span>Cepa</span><small class="mono">garrafeira</small></a>
      <div class="masthead__tools">
        <a class="masthead__account" href="/entrar" data-account>Entrar</a>
        <a class="masthead__cart" href="/cesto">Cesto <span class="count" data-cart-count>0</span></a>
        <button class="masthead__menu" type="button" aria-expanded="false" aria-controls="menu" data-menu-open>Menu</button>
      </div>
    </div>
  </header>
  <div class="menu" id="menu" data-menu hidden>
    <div class="menu__head">
      <a class="wordmark" href="/"><span>Cepa</span></a>
      <button class="menu__close" type="button" data-menu-close>Fechar</button>
    </div>
    <nav class="menu__nav" aria-label="Menu">
      <a href="/">Início</a>
      ${links}
      <a href="/cesto">Cesto</a>
      <a href="/entrar" data-account>Entrar</a>
    </nav>
    <p class="menu__foot mono">Rua de Cedofeita 212, Porto<br>terça a sábado, 11h–20h</p>
  </div>`;
}

export function footer() {
  const year = new Date().getFullYear();
  return `
  <footer class="colophon">
    <div class="colophon__news">
      <h2>A carta muda às quintas.</h2>
      <p>Uma vez por semana, os vinhos que entraram, os que estão a acabar e a prova seguinte. Nada mais.</p>
      <form class="news-form" data-newsletter novalidate>
        <label class="sr-only" for="news-email">Email</label>
        <input id="news-email" name="email" type="email" placeholder="o seu email" autocomplete="email" required>
        <button type="submit">Receber</button>
        <p class="news-form__msg" role="status" data-newsletter-msg></p>
      </form>
    </div>
    <div class="colophon__cols">
      <div>
        <h3 class="mono">Loja</h3>
        <p>Rua de Cedofeita 212<br>4050-174 Porto</p>
        <p>terça a sábado, 11h–20h</p>
      </div>
      <div>
        <h3 class="mono">Contacto</h3>
        <p><a href="mailto:ola@cepa.pt">ola@cepa.pt</a><br><a href="tel:+351222000212">222 000 212</a></p>
      </div>
      <div>
        <h3 class="mono">Garrafeira</h3>
        <p><a href="/carta">A carta</a><br><a href="/produtores">Produtores</a><br><a href="/provas">Provas</a><br><a href="/clube">Clube</a></p>
      </div>
      <div>
        <h3 class="mono">Conta</h3>
        <p><a href="/conta">A minha conta</a><br><a href="/cesto">Cesto</a><br><a href="/entrar">Entrar</a></p>
      </div>
    </div>
    <div class="colophon__end mono">
      <span>Cepa, garrafeira · ${year}</span>
      <span>Venda proibida a menores de 18 anos. Seja responsável, beba com moderação.</span>
    </div>
  </footer>`;
}

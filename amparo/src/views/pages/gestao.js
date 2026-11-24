import { brand } from '../document.js';
import { icon } from '../html.js';

export const staffLoginBody = () => `<div class="wrap auth gest-auth">
  <div class="paper-shadow auth__wrap"><div class="receipt auth__paper">
    <header class="receipt__head">${brand('span')}<h1>Gestão</h1><p class="mono">Acesso só com credenciais da equipa</p></header>
    <p class="hint">As contas normais não entram aqui. Cada pessoa da equipa tem credenciais próprias, criadas pelo dono da plataforma. Depois de 5 tentativas falhadas, as credenciais bloqueiam durante 15 minutos.</p>
    <form id="staff-login" novalidate>
      <div class="field"><label for="s-email">Email</label><input id="s-email" name="email" type="email" autocomplete="username" required></div>
      <div class="field"><label for="s-pass">Palavra-passe</label><input id="s-pass" name="password" type="password" autocomplete="current-password" required></div>
      <button class="btn btn--ink btn--block btn--lg" type="submit">Entrar na gestão${icon.arrow}</button>
    </form>
    <details class="auth__demo"><summary>Credenciais de demonstração</summary><p>Dono: <code>dono@exemplo.pt</code> / <code>amparo-dono-2026</code>. Moderação: <code>moderacao@amparo.exemplo</code> e contas: <code>contas@amparo.exemplo</code>, ambas com <code>amparo-equipa-2026</code>. Em produção o dono vem do ficheiro .env.</p></details>
  </div></div>
</div>`;

export const staffPanelBody = () => `<div class="gest">
  <aside class="gest__side">
    ${brand('span')}
    <p class="gest__who" data-who></p>
    <nav class="gest__nav" data-nav aria-label="Funções"></nav>
    <button class="btn btn--sm btn--ghost" type="button" data-logout>Terminar sessão</button>
  </aside>
  <section class="gest__main" aria-live="polite">
    <p class="notice notice--demo" data-demo hidden><b>Demonstração:</b> prestador de pagamentos simulado. Nenhum dinheiro real passa pela plataforma.</p>
    <div data-view><p class="empty">A carregar…</p></div>
  </section>
</div>`;

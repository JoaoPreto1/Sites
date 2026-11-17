import { esc, win } from '../components.js';

export function notFoundWindows(path) {
  return [
    {
      id: 'erro',
      label: 'Erro',
      ico: 'app',
      html: win({
        id: 'erro',
        url: path,
        title: 'Erro',
        label: 'Erro',
        primary: true,
        x: 260,
        y: 120,
        w: 520,
        cls: 'dialog',
        body: `<div class="dialog__row"><span class="dialog__icon" aria-hidden="true">!</span>
        <div><h1 class="dialog__title">Ficheiro não encontrado</h1>
        <p>O sistema não encontrou <code>${esc(path)}</code>. Pode ter mudado de pasta ou ido parar ao lixo.</p></div></div>
        <div class="dialog__actions"><a class="btn" href="/projetos">Ver projetos</a><a class="btn btn--primary" href="/">OK</a></div>`,
      }),
    },
  ];
}

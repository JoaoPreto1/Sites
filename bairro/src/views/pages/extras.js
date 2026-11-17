import { esc, icon, win } from '../components.js';

export const MANIFESTO = [
  ['Desenhamos para quem vende.', 'Uma marca bonita que ninguém reconhece ao balcão não serve. Antes de desenhar, passamos uma manhã no seu negócio a ver quem entra, o que pergunta e o que leva.'],
  ['Pouco, mas bem.', 'Três projetos novos por mês, no máximo. Preferimos dizer que não a fazer depressa.'],
  ['Quem desenha é quem fala consigo.', 'Não há gestores de conta. Fala diretamente com a pessoa que está a fazer o trabalho.'],
  ['Tudo tem de se imprimir.', 'Se fica bem no ecrã mas sai mal da impressora da loja, está errado. Testamos tudo em papel, em tamanho real.'],
  ['Sites rápidos e vossos.', 'Fazemos sites que abrem num segundo num telemóvel antigo e que vocês conseguem atualizar sem nos ligar.'],
  ['Preços às claras.', 'Os preços de referência estão no site. O orçamento final não traz surpresas e as alterações têm preço antes de começarem.'],
  ['O Porto primeiro.', 'Imprimimos em gráficas da cidade, fotografamos com fotógrafos da cidade e pagamos a horas.'],
  ['O gato tem sempre razão.', 'Se o Pixel se deita em cima de uma prova impressa, é porque está boa.'],
];

export function manifestoWindows() {
  const words = MANIFESTO.flat().join(' ').split(/\s+/).length;
  const body = `<div class="editor">
    <ol class="editor__gutter" aria-hidden="true">${Array.from({ length: MANIFESTO.length * 3 + 3 }, (_, i) => `<li>${i + 1}</li>`).join('')}</ol>
    <div class="editor__text">
      <h1 class="editor__title">Manifesto do estúdio</h1>
      <p class="mute">Escrito em 2022 numa tarde de chuva. Revisto todos os anos em janeiro.</p>
      <ol class="manifesto">
        ${MANIFESTO.map(([title, text]) => `<li><h2>${esc(title)}</h2><p>${esc(text)}</p></li>`).join('')}
      </ol>
      <p class="editor__sign">— Hugo, Leonor, Marta (e Pixel)<span class="cursor" aria-hidden="true"></span></p>
    </div>
  </div>`;

  return [
    {
      id: 'manifesto',
      label: 'Manifesto',
      ico: 'doc',
      html: win({
        id: 'manifesto',
        url: '/manifesto',
        title: 'manifesto.txt',
        label: 'Manifesto',
        ico: 'doc',
        primary: true,
        x: 120,
        y: 30,
        w: 820,
        cls: 'editor-win',
        flush: true,
        body,
        status: `<span>${words} palavras</span><span>UTF-8 · só leitura</span>`,
      }),
    },
  ];
}

const TRASH = [
  ['logotipo_comic_sans_v3.ai', 'Era para ser irónico. Não resultou.', '12 mar 2025'],
  ['site_com_musica_de_fundo.html', 'Um cliente pediu. Convencemo-lo a não fazer.', '4 jun 2025'],
  ['embalagem_que_nao_fecha.pdf', 'Linda no ecrã. Na gráfica, abria sozinha.', '19 set 2025'],
  ['paleta_17_cores.ase', 'Quando tudo é destaque, nada é destaque.', '2 fev 2026'],
  ['slogan_inovacao_disruptiva.txt', 'Escrito às 2h da manhã. Apagado às 9h.', '27 abr 2026'],
  ['cartaz_em_gradiente_arco_iris.png', 'O Pixel deitou-se em cima e não quis sair. Tomámos como um não.', '8 out 2026'],
];

export function trashWindows() {
  const body = `<div class="trash">
    <h1 class="trash__title">Ideias más</h1>
    <p class="mute">Também se aprende com o que vai para o lixo. Aqui ficam as ideias que não passaram da primeira reunião.</p>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th scope="col">Nome</th><th scope="col">Porque foi para o lixo</th><th scope="col">Apagado</th><th scope="col"><span class="sr-only">Ações</span></th></tr></thead>
        <tbody>
          ${TRASH.map(
            ([file, reason, date]) => `<tr><td class="trash__file">${icon('doc')}${esc(file)}</td><td>${esc(reason)}</td><td class="num">${date}</td><td><button class="btn btn--small" type="button" data-restore>Restaurar</button></td></tr>`,
          ).join('')}
        </tbody>
      </table>
    </div>
    <p class="trash__actions"><button class="btn" type="button" data-empty-trash>Esvaziar o lixo</button></p>
    <div class="trash__dialog" data-trash-dialog hidden role="alertdialog" aria-labelledby="trash-dialog-title">
      <span class="dialog__icon" aria-hidden="true">?</span>
      <div><p id="trash-dialog-title"><b>Não é possível esvaziar o lixo.</b></p><p class="small" data-trash-text>O Hugo ainda gosta do logótipo em Comic Sans.</p></div>
      <button class="btn btn--small" type="button" data-trash-ok>OK</button>
    </div>
  </div>`;

  return [
    {
      id: 'lixo',
      label: 'Ideias más',
      ico: 'trash',
      html: win({
        id: 'lixo',
        url: '/lixo',
        title: 'ideias más',
        label: 'Ideias más',
        ico: 'trash',
        primary: true,
        x: 160,
        y: 50,
        w: 860,
        script: 'trash',
        body,
        status: `<span>${TRASH.length} objetos</span><span>Recuperar é por sua conta e risco</span>`,
      }),
    },
  ];
}

export const WALLPAPERS = [
  ['#3b6e8f', 'Azul Porto'],
  ['#2f6b4f', 'Verde garrafa'],
  ['#8a3b2f', 'Telha'],
  ['#4b4a6b', 'Ardósia'],
  ['#1e1e1e', 'Noite'],
];

export function settingsWindows() {
  const body = `<h1 class="settings__title">Definições</h1>
  <p class="mute">Ficam guardadas só neste browser.</p>
  <form class="settings" data-settings>
    <fieldset>
      <legend class="legend">Cor do fundo</legend>
      <div class="swatches">
        ${WALLPAPERS.map(
          ([color, name], i) =>
            `<label class="swatch"><input type="radio" name="color" value="${color}"${i === 0 ? ' checked' : ''}><span class="swatch__color" style="background:${color}"></span><span class="small">${name}</span></label>`,
        ).join('')}
      </div>
    </fieldset>
    <fieldset>
      <legend class="legend">Padrão</legend>
      <div class="patterns">
        ${[
          ['pontos', 'Pontos'],
          ['grelha', 'Grelha'],
          ['liso', 'Liso'],
        ]
          .map(([value, label], i) => `<label class="check"><input type="radio" name="pattern" value="${value}"${i === 0 ? ' checked' : ''}><span>${label}</span></label>`)
          .join('')}
      </div>
    </fieldset>
    <p class="settings__actions"><button class="btn" type="button" data-reset>Repor</button></p>
  </form>`;

  return [
    {
      id: 'definicoes',
      label: 'Definições',
      ico: 'gear',
      html: win({
        id: 'definicoes',
        url: '/definicoes',
        title: 'definições',
        label: 'Definições',
        ico: 'gear',
        primary: true,
        x: 300,
        y: 60,
        w: 520,
        script: 'settings',
        body,
      }),
    },
  ];
}

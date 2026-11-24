import { CATEGORIES, RETENTION } from '../../config/platform.js';
import { esc, euros, glyph, icon, num, pageHead } from '../html.js';

const toc = (items) => `<nav class="toc" aria-label="Nesta página"><p class="mono">Nesta página</p><ol>${items.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join('')}</ol></nav>`;

export const FAQ = [
  ['Preciso de duas contas, uma para pedir e outra para doar?', 'Não. A mesma conta serve para criar pedidos de ajuda e para doar a pedidos de outras pessoas.'],
  ['Quem vê os meus dados pessoais?', 'Só a equipa de moderação com permissão para isso, e cada vez que alguém da equipa abre uma prova privada fica registado. Os outros utilizadores veem apenas o que escolheu mostrar e que a moderação aprovou.'],
  ['O dinheiro é entregue diretamente à pessoa?', 'Ainda não está definido. Antes de aceitar dinheiro real, a plataforma tem de decidir quem gere os fundos e como o dinheiro chega à despesa (por exemplo, pagando a fatura diretamente). Até lá não afirmamos que é entregue à pessoa.'],
  ['As doações são dedutíveis no IRS?', 'Não afirmamos que sejam. O enquadramento fiscal ainda vai ser confirmado com um contabilista.'],
  ['Posso doar sem que saibam quem sou?', 'Sim. As doações são anónimas por defeito. O seu nome só aparece se escolher mostrá-lo.'],
];

export function comoFuncionaBody({ fees }) {
  return `${pageHead({
    crumbs: [['Como funciona']],
    kicker: 'Pedir, doar, perguntar e denunciar',
    title: 'Como funciona a Amparo',
    lead: 'Uma plataforma onde pessoas em Portugal pedem ajuda para despesas concretas e outras pessoas ajudam a pagá-las, com moderação antes de tudo e os dados pessoais fora da vista.',
  })}
<div class="wrap prose-grid">
  ${toc([['pedir', 'Pedir ajuda'], ['moderacao', 'Moderação'], ['doar', 'Doar'], ['comissoes', 'Comissões'], ['informacao', 'Pedir mais informação'], ['denunciar', 'Denunciar'], ['perguntas', 'Perguntas frequentes']])}
  <div class="prose">
    <section id="pedir">
      <h2>Pedir ajuda</h2>
      <p>Qualquer pessoa com conta pode criar um pedido para uma despesa concreta:</p>
      <ul class="cat-list">${CATEGORIES.map(([id, l, h]) => `<li>${glyph(id, 26)}<span><b>${l}</b> · ${h}</span></li>`).join('')}</ul>
      <p>Indica o motivo, o montante de que precisa e, se quiser, um prazo. Também pode juntar <b>provas</b> (fatura, recibo, orçamento). As provas são opcionais e ficam privadas: só a moderação as vê, a não ser que autorize explicitamente que uma imagem seja mostrada no pedido.</p>
      <p>É quem pede que escolhe o que fica visível: o primeiro nome (ou nenhum), o distrito, o prazo, a lista de provas verificadas e a lista de quem doou. Morada, contactos, dados bancários, números de identificação e documentos completos nunca são públicos.</p>
      <p><a class="btn btn--ink" href="/conta/novo-pedido">Criar um pedido${icon.arrow}</a></p>
    </section>
    <section id="moderacao">
      <h2>Moderação</h2>
      <p>Nenhum pedido aparece sem ser revisto. A moderação confirma três coisas antes de aprovar: que o texto não expõe dados pessoais, que o pedido é coerente com as provas (quando existem) e que a categoria está certa. Pode aprovar, pedir alterações ou recusar, e explica sempre o motivo.</p>
      <p>Se alterar um pedido já publicado, ele volta à moderação e sai do ar até ser aprovado de novo. As decisões ficam registadas e associadas à pessoa da equipa que as tomou.</p>
      <p class="notice"><b>Importante:</b> moderar não é verificar identidade. A plataforma ainda não confirma quem é quem pede. Isso está na <a href="/transparencia#lancamento">lista do lançamento</a>.</p>
    </section>
    <section id="doar">
      <h2>Doar</h2>
      <p>Pode doar para qualquer pedido ativo, com o valor que quiser até ao que falta. Antes de confirmar vê sempre o montante, para onde vai, as comissões e as condições. Por defeito a doação é anónima.</p>
      <p>Os pagamentos serão processados por um prestador de pagamentos autorizado. A plataforma não recebe nem guarda dados de cartões. Depois de cada pagamento confirmado, o valor recebido do pedido é atualizado e, quando chega ao montante pedido, o pedido fecha.</p>
      <p class="notice notice--demo">Nesta demonstração não há prestador de pagamentos: o passo de pagamento é uma simulação claramente identificada, sem cartão e sem dinheiro.</p>
    </section>
    <section id="comissoes">
      <h2>Comissões</h2>
      <div class="table-wrap"><table class="data"><thead><tr><th>Comissão</th><th>Valor</th><th>Estado</th></tr></thead><tbody>
        <tr><td>Prestador de pagamentos</td><td class="mono">${num(fees.providerPercent)}% + ${euros(fees.providerFixedCents)}</td><td>${fees.confirmed ? 'Confirmada' : 'Valor de exemplo, por confirmar'}</td></tr>
        <tr><td>Plataforma, sobre doações a pedidos</td><td class="mono">${num(fees.platformPercent)}%</td><td>${fees.confirmed ? 'Confirmada' : 'Valor de exemplo, por confirmar'}</td></tr>
      </tbody></table></div>
      <p>Pode escolher acrescentar a comissão à sua doação para que o pedido receba o valor inteiro. Os custos da plataforma são pagos à parte, por quem quiser <a href="/manter">contribuir para mantê-la</a>.</p>
    </section>
    <section id="informacao">
      <h2>Pedir mais informação</h2>
      <p>Quem doa pode fazer perguntas sobre um pedido. A conversa acontece dentro da plataforma: ninguém vê o email ou o telefone do outro, e contactos escritos nas mensagens são retirados automaticamente.</p>
      <p>Quem criou o pedido decide: responder, partilhar uma prova só com essa pessoa, ou recusar. Recusar não tem consequências para o pedido.</p>
    </section>
    <section id="denunciar">
      <h2>Denunciar</h2>
      <p>Em cada pedido há um botão “Denunciar este pedido”, mesmo sem conta. Use-o se o pedido parecer falso, tiver conteúdo abusivo ou expuser dados pessoais (seus ou de outra pessoa). Denúncias de dados pessoais expostos são tratadas primeiro. Quem criou o pedido não sabe quem denunciou.</p>
    </section>
    <section id="perguntas">
      <h2>Perguntas frequentes</h2>
      ${FAQ.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
    </section>
  </div>
</div>`;
}

const DATA_ROWS = [
  ['Nome e email', 'Criar a conta, entrar e receber avisos', 'Só a equipa com permissão “Contas e dados”', `Enquanto a conta existir; apagados até ${RETENTION.deletedAccountDays} dias depois de pedir a eliminação`],
  ['Palavra-passe', 'Proteger a conta', 'Ninguém: guardamos só um resumo cifrado (bcrypt)', 'Enquanto a conta existir'],
  ['Texto do pedido, montante, distrito, primeiro nome', 'Publicar o pedido', 'O público, só o que escolheu mostrar e depois de moderado', 'Enquanto o pedido estiver publicado'],
  ['Nota privada para a moderação', 'Ajudar a moderação a decidir', 'Só a moderação', 'Enquanto o pedido existir'],
  ['Provas (faturas, recibos)', 'Verificar o pedido', 'Só a moderação com permissão, e cada abertura fica registada. Imagens públicas só com a sua autorização', `Apagadas ${RETENTION.documentsAfterCloseDays} dias depois de o pedido fechar`],
  ['Mensagens', 'Pedidos de informação entre pessoas', 'As duas pessoas da conversa', `Apagadas ${RETENTION.messagesAfterCloseDays} dias depois de a conversa fechar`],
  ['Doações e contribuições', 'Atualizar os pedidos e prestar contas', 'A equipa de fundos, sem nome de quem doa', 'Pelo prazo legal aplicável aos registos de pagamento (a confirmar); sem dados pessoais depois de apagar a conta'],
  ['Endereço IP', 'Limitar tentativas repetidas e abusos', 'Ninguém o consulta, salvo investigação de abuso', 'Minutos, na memória do servidor; nos registos da equipa, enquanto existirem'],
];

export function privacidadeBody() {
  return `${pageHead({
    crumbs: [['Privacidade e segurança']],
    kicker: 'Recolhemos só o necessário',
    title: 'Os seus dados, para que servem e quem os vê',
    lead: 'Pedir ajuda já é difícil. Por isso os dados pessoais ficam separados do que é público, e explicamos aqui cada um.',
  })}
<div class="wrap prose-grid">
  ${toc([['dados', 'Que dados guardamos'], ['publico', 'O que é público'], ['direitos', 'Os seus direitos'], ['seguranca', 'Segurança'], ['equipa', 'Acesso da equipa'], ['falta', 'Ainda por confirmar']])}
  <div class="prose">
    <section id="dados">
      <h2>Que dados guardamos</h2>
      <div class="table-wrap"><table class="data data--wide"><thead><tr><th>Dado</th><th>Para quê</th><th>Quem pode ver</th><th>Durante quanto tempo</th></tr></thead><tbody>
        ${DATA_ROWS.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<td><b>${esc(c)}</b></td>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}
      </tbody></table></div>
      <p class="hint">Não pedimos morada, telefone, NIF, número de cartão de cidadão nem dados bancários para criar conta ou publicar um pedido. Os prazos acima são a proposta atual e serão confirmados pelo responsável pelo tratamento antes do lançamento.</p>
    </section>
    <section id="publico">
      <h2>O que é público</h2>
      <p>Num pedido, os outros utilizadores veem o motivo, o montante pedido, o valor já recebido e o que falta. Só veem o primeiro nome, o distrito, o prazo, as provas verificadas e a lista de quem doou se quem pede escolher mostrá-los. Uma imagem de uma prova só aparece com autorização explícita e depois de a moderação confirmar que não mostra dados pessoais.</p>
      <p>Os metadados das fotografias enviadas (como a localização GPS, o modelo do telemóvel ou a data) são retirados quando a fotografia chega. Nos PDF isso nem sempre é possível, por isso avisamos e recomendamos fotografias.</p>
    </section>
    <section id="direitos">
      <h2>Os seus direitos</h2>
      <ul>
        <li><b>Ver e descarregar</b> tudo o que guardamos sobre si, na <a href="/conta#dados">sua conta</a>, num ficheiro.</li>
        <li><b>Corrigir</b> o nome e o email, e editar os seus pedidos.</li>
        <li><b>Apagar</b> provas a qualquer momento, e retirar a autorização para mostrar uma imagem, com efeito imediato.</li>
        <li><b>Pedir a eliminação da conta.</b> Apagamos provas, mensagens e pedidos, e retiramos o nome das doações. Os registos de pagamento podem ter de ser guardados sem dados pessoais, se a lei o exigir.</li>
        <li><b>Reclamar</b> junto da Comissão Nacional de Proteção de Dados (CNPD), se achar que os seus dados não foram bem tratados.</li>
      </ul>
    </section>
    <section id="seguranca">
      <h2>Segurança</h2>
      <p>Protegemos a plataforma com medidas adequadas ao que guarda. Nenhum sistema é totalmente invulnerável e a segurança exige manutenção contínua, por isso esta lista é revista com regularidade.</p>
      <ul class="sec-list">
        <li>${icon.lock}<span><b>Ligações cifradas (HTTPS)</b> em todo o site, com HSTS em produção.</span></li>
        <li>${icon.shield}<span><b>Palavras-passe com bcrypt</b> e sessões curtas que se renovam; ao mudar a palavra-passe, as outras sessões terminam.</span></li>
        <li>${icon.clock}<span><b>Limite de tentativas</b> no início de sessão, no registo, nas denúncias e nas mensagens. As credenciais da equipa bloqueiam 15 minutos depois de cinco falhas.</span></li>
        <li>${icon.doc}<span><b>Provas em armazenamento privado</b>, fora da pasta pública, sem metadados, servidas só a quem tem permissão.</span></li>
        <li>${icon.eye}<span><b>Proteção contra ataques comuns</b>: validação de todos os campos, texto sempre escapado, política de segurança de conteúdos, cookies httpOnly e SameSite, verificação do tipo real de cada ficheiro.</span></li>
        <li>${icon.flag}<span><b>Contra abuso automatizado</b>: campos-armadilha e tempo mínimo nos formulários de registo, sem CAPTCHAs que dificultem a vida a quem tem pouca prática.</span></li>
      </ul>
    </section>
    <section id="equipa">
      <h2>Acesso da equipa</h2>
      <p>A gestão é separada das contas normais e não é possível chegar a ela pelo registo. O dono da plataforma cria credenciais individuais para cada pessoa da equipa e escolhe que funções cada uma pode usar: moderar, ver provas privadas, tratar denúncias, registar entregas, gerir custos ou tratar pedidos de dados. Cada ação fica registada com o nome de quem a fez.</p>
    </section>
    <section id="falta">
      <h2>Ainda por confirmar</h2>
      <p>O responsável pelo tratamento de dados, o contacto para pedidos sobre dados e os prazos finais de conservação ainda vão ser definidos antes do lançamento. Veja a <a href="/transparencia#lancamento">lista do lançamento</a>.</p>
    </section>
  </div>
</div>`;
}

export function condicoesBody({ launch }) {
  const item = (id) => launch.items.find((i) => i.id === id);
  const state = (id) => (item(id).done ? esc(item(id).note) : '<span class="tbd">A definir antes do lançamento.</span>');
  return `${pageHead({
    crumbs: [['Condições de utilização']],
    kicker: 'Rascunho · ainda não revisto por um jurista',
    title: 'Condições de utilização',
    lead: 'As regras de quem pede e de quem doa. Os pontos marcados “a definir” ainda não estão decididos e não devem ser lidos como uma garantia.',
  })}
<div class="wrap prose-grid">
  ${toc([['quem', 'Quem pode usar'], ['pedidos', 'Regras dos pedidos'], ['doacoes', 'Doações'], ['fundos', 'Gestão dos fundos'], ['reembolsos', 'Reembolsos'], ['reclamacoes', 'Reclamações'], ['impostos', 'Impostos']])}
  <div class="prose">
    <section id="quem"><h2>Quem pode usar</h2><p>Pessoas maiores de idade com uma conta. A mesma conta serve para pedir ajuda e para doar. A equipa da plataforma usa credenciais separadas.</p></section>
    <section id="pedidos"><h2>Regras dos pedidos</h2><ul><li>Cada pedido é para uma despesa concreta e para quem o cria ou para o seu agregado.</li><li>A informação tem de ser verdadeira. Pedidos falsos são recusados ou suspensos.</li><li>O texto não pode conter dados pessoais: moradas, contactos, números de identificação ou dados bancários.</li><li>A moderação pode pedir alterações, recusar ou suspender um pedido, e explica o motivo.</li></ul></section>
    <section id="doacoes"><h2>Doações</h2><p>Antes de confirmar, vê o montante, o destino, as comissões e estas condições. Uma doação não dá direito a contrapartidas nem a dados de quem pediu.</p></section>
    <section id="fundos"><h2>Gestão dos fundos</h2><p><b>Quem gere:</b> ${state('entidade')}</p><p><b>Como o dinheiro chega à despesa:</b> ${state('entrega')}</p></section>
    <section id="reembolsos"><h2>Reembolsos</h2><p>${state('reembolsos')}</p></section>
    <section id="reclamacoes"><h2>Reclamações</h2><p>${state('reclamacoes')}</p></section>
    <section id="impostos"><h2>Impostos</h2><p>Não afirmamos que as doações sejam dedutíveis. ${state('fiscal')}</p></section>
  </div>
</div>`;
}

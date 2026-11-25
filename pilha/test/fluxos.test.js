// Testes dos fluxos principais, contra a aplicação a correr numa porta livre.
// Correr com: npm test
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

async function call(path, { method = 'GET', body, token, cookie } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data, cookie: res.headers.get('set-cookie')?.split(';')[0], headers: res.headers };
}

const login = (email, password) => call('/api/auth/login', { method: 'POST', body: { email, password } });

test('páginas públicas respondem com HTML, SEO e cabeçalhos de segurança', async () => {
  for (const path of ['/', '/trabalhos', '/trabalhos?tipo=rotulos', '/trabalhos/lota-velha', '/servicos', '/servicos/marcas', '/estudio', '/diario', '/diario/uma-lata-tem-quatro-faces', '/contacto']) {
    const r = await call(path);
    assert.equal(r.status, 200, path);
    assert.match(r.data, /<link rel="canonical"/, path);
    assert.match(r.data, /application\/ld\+json/, path);
    assert.match(r.headers.get('content-security-policy'), /script-src 'self'/);
  }
  assert.equal((await call('/trabalhos/nao-existe')).status, 404);
  assert.equal((await call('/trabalhos?tipo=batatas')).status, 404);
  assert.equal((await call('/trabalhos/ao-calhas')).status, 302);
  assert.match((await call('/sitemap.xml')).data, /<loc>.*\/trabalhos\/grua<\/loc>/);
  assert.match((await call('/robots.txt')).data, /Disallow: \/painel/);
  assert.equal((await call('/cliente')).headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('login, refresh com rotação e logout', async () => {
  assert.equal((await login('teatro@cliente.exemplo', 'errada-123456')).status, 401);
  const ok = await login('teatro@cliente.exemplo', 'pilha-cliente-2026');
  assert.equal(ok.status, 200);
  assert.ok(ok.data.accessToken);
  assert.match(ok.cookie, /^pilha_refresh=/);

  const r1 = await call('/api/auth/refresh', { method: 'POST', cookie: ok.cookie });
  assert.equal(r1.status, 200);
  assert.notEqual(r1.cookie, ok.cookie);
  // O refresh antigo já não serve e, por ter sido reutilizado, termina todas as sessões
  assert.equal((await call('/api/auth/refresh', { method: 'POST', cookie: ok.cookie })).status, 401);
  assert.equal((await call('/api/auth/refresh', { method: 'POST', cookie: r1.cookie })).status, 401);
});

test('cliente vê só os seus projetos, aprova provas e escreve ao estúdio', async () => {
  const { data } = await login('teatro@cliente.exemplo', 'pilha-cliente-2026');
  const token = data.accessToken;
  const { data: list } = await call('/api/cliente/projetos', { token });
  assert.equal(list.projects.length, 1);
  assert.equal(list.projects[0].id, 'p-teatro');

  // Pedir alterações sem comentário falha; com comentário passa; responder outra vez dá conflito
  assert.equal((await call('/api/cliente/provas/pr-3/decisao', { method: 'POST', token, body: { decision: 'alteracoes' } })).status, 400);
  assert.equal((await call('/api/cliente/provas/pr-3/decisao', { method: 'POST', token, body: { decision: 'alteracoes', comment: 'O botão podia ser maior.' } })).status, 200);
  assert.equal((await call('/api/cliente/provas/pr-3/decisao', { method: 'POST', token, body: { decision: 'aprovada' } })).status, 409);
  assert.equal((await call('/api/cliente/provas/pr-4/decisao', { method: 'POST', token, body: { decision: 'aprovada' } })).status, 200);

  // Prova e projeto de outro cliente: não existem para este
  assert.equal((await call('/api/cliente/provas/pr-5/decisao', { method: 'POST', token, body: { decision: 'aprovada' } })).status, 404);
  assert.equal((await call('/api/cliente/projetos/p-lota/mensagens', { method: 'POST', token, body: { body: 'olá' } })).status, 404);

  const msg = await call('/api/cliente/projetos/p-teatro/mensagens', { method: 'POST', token, body: { body: 'Vamos ver amanhã com a direção.' } });
  assert.equal(msg.status, 201);
  assert.equal(msg.data.message.fromStudio, false);

  // Cliente não entra no painel
  assert.equal((await call('/api/estudio/pedidos', { token })).status, 403);
  assert.equal((await call('/api/cliente/projetos')).status, 401);
});

test('briefing pelo formulário de contacto, com anti-robô e validação', async () => {
  const good = { name: 'Rita Teste', email: 'rita@exemplo.pt', services: ['rotulos'], budget: '3000-8000', message: 'Precisamos de rótulos para uma linha nova de compotas.', consent: 'true', startedAt: Date.now() - 5000 };
  assert.equal((await call('/api/briefing', { method: 'POST', body: { ...good, startedAt: Date.now() } })).status, 400);
  assert.equal((await call('/api/briefing', { method: 'POST', body: { ...good, website: 'spam' } })).status, 400);
  const bad = await call('/api/briefing', { method: 'POST', body: { ...good, services: [], message: 'curto' } });
  assert.equal(bad.status, 400);
  assert.ok(bad.data.details.some((d) => d.field === 'message'));
  const ok = await call('/api/briefing', { method: 'POST', body: good });
  assert.equal(ok.status, 201);
  assert.match(ok.data.ref, /^PL-\d{4}$/);
  const unsure = await call('/api/briefing', { method: 'POST', body: { ...good, email: 'sem.blocos@exemplo.pt', services: [], unsure: true } });
  assert.equal(unsure.status, 201);
});

test('estúdio aceita um pedido, envia prova, muda fase e o cliente novo consegue entrar', async () => {
  const { data } = await login('ines@pilha.exemplo', 'pilha-estudio-2026');
  const token = data.accessToken;
  const { data: b } = await call('/api/estudio/pedidos', { token });
  const brief = b.briefs.find((x) => x.email === 'rita@exemplo.pt');
  assert.ok(brief);

  const acc = await call(`/api/estudio/pedidos/${brief.id}/aceitar`, { method: 'POST', token, body: { title: 'Compotas: rótulos', service: 'rotulos', lead: 'Rui Paixão' } });
  assert.equal(acc.status, 201);
  assert.ok(acc.data.temporaryPassword);
  assert.equal((await call(`/api/estudio/pedidos/${brief.id}/aceitar`, { method: 'POST', token, body: { title: 'Outra vez', service: 'rotulos', lead: 'Rui Paixão' } })).status, 409);

  const projectId = acc.data.project.id;
  assert.equal((await call(`/api/estudio/projetos/${projectId}/fase`, { method: 'PATCH', token, body: { phase: 'esbocos' } })).status, 200);
  assert.equal((await call(`/api/estudio/projetos/${projectId}/provas`, { method: 'POST', token, body: { title: 'Esboços', image: '/img/provas/lota-esbocos-1' } })).status, 201);
  assert.equal((await call(`/api/estudio/projetos/${projectId}/provas`, { method: 'POST', token, body: { title: 'Esboços', image: '/img/qualquer' } })).status, 400);

  const client = await login('rita@exemplo.pt', acc.data.temporaryPassword);
  assert.equal(client.status, 200);
  const { data: mine } = await call('/api/cliente/projetos', { token: client.data.accessToken });
  assert.equal(mine.projects[0].phase, 'esbocos');
  assert.equal(mine.projects[0].pendingProofs, 1);
  assert.deepEqual(mine.projects[0].phases.slice(0, 3).map((p) => p.state), ['feita', 'feita', 'agora']);
});

test('estúdio publica e apaga trabalhos e entradas do diário', async () => {
  const { data } = await login('tomas@pilha.exemplo', 'pilha-estudio-2026');
  const token = data.accessToken;
  const work = { title: 'Um trabalho de teste', client: 'Cliente Teste', place: 'Lisboa', category: 'sites', year: 2026, summary: 'Resumo do trabalho de teste.', body: 'Texto do trabalho de teste com mais de vinte caracteres.', cover: '/img/trabalhos/grua-1', published: true };
  const created = await call('/api/estudio/trabalhos', { method: 'POST', token, body: work });
  assert.equal(created.status, 201);
  assert.equal((await call(`/trabalhos/${created.data.work.slug}`)).status, 200);
  assert.equal((await call(`/api/estudio/trabalhos/${created.data.work.id}`, { method: 'PUT', token, body: { ...work, published: false } })).status, 200);
  assert.equal((await call(`/trabalhos/${created.data.work.slug}`)).status, 404);
  assert.equal((await call(`/api/estudio/trabalhos/${created.data.work.id}`, { method: 'DELETE', token })).status, 204);

  const entry = { title: 'Entrada de teste', tag: 'Teste', author: 'Tomás Valente', excerpt: 'Um resumo com tamanho suficiente.', body: 'O texto da entrada de teste, com mais de vinte caracteres.', published: true };
  const e = await call('/api/estudio/diario', { method: 'POST', token, body: entry });
  assert.equal(e.status, 201);
  assert.equal((await call(`/diario/${e.data.entry.slug}`)).status, 200);
  assert.equal((await call('/api/estudio/diario', { method: 'POST', token, body: { ...entry, author: 'Alguém de fora' } })).status, 400);
  assert.equal((await call(`/api/estudio/diario/${e.data.entry.id}`, { method: 'DELETE', token })).status, 204);
});

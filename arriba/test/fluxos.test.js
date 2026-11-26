// Testes dos fluxos principais, contra a aplicação a correr numa porta livre.
// Correr com: npm test
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { addDays, nextWeekend, today } from '../src/utils/dates.js';

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
const guestToken = async () => (await login('hospede@arriba.exemplo', 'arriba-hospede-2026')).data.accessToken;
const deskToken = async () => (await login('rececao@arriba.exemplo', 'arriba-rececao-2026')).data.accessToken;
const { checkIn: F, checkOut: F2 } = nextWeekend();

test('páginas públicas com SEO, JSON-LD do hotel e cabeçalhos de segurança', async () => {
  for (const path of ['/', '/quartos', '/quartos/suite-farol', '/quartos/falesia', '/quartos/patio', '/quartos/duna', '/a-casa', '/sagres', '/como-chegar', '/restaurante']) {
    const r = await call(path);
    assert.equal(r.status, 200, path);
    assert.match(r.data, /<link rel="canonical"/, path);
    assert.match(r.data, /application\/ld\+json/, path);
    assert.match(r.headers.get('content-security-policy'), /script-src 'self'/);
  }
  assert.match((await call('/')).data, /"@type":"Hotel"/);
  assert.match((await call('/quartos/duna')).data, /"@type":"HotelRoom"/);
  assert.match((await call('/restaurante')).data, /"@type":"Restaurant"/);
  assert.equal((await call('/quartos/nao-existe')).status, 404);
  assert.match((await call('/sitemap.xml')).data, /<loc>.*\/quartos\/suite-farol<\/loc>/);
  assert.match((await call('/robots.txt')).data, /Disallow: \/rececao/);
  assert.equal((await call('/hospede')).headers.get('x-robots-tag'), 'noindex, nofollow');
  // Datas inválidas no endereço não partem a página: mostra o próximo fim de semana com um aviso
  assert.match((await call('/?chegada=2020-01-01&saida=2020-01-03')).data, /não são válidas/);
});

test('o quadro mostra as chaves livres para as datas', async () => {
  const r = await call('/api/disponibilidade');
  assert.equal(r.status, 200);
  assert.equal(r.data.checkIn, F);
  assert.deepEqual(r.data.free, ['01', '02', '03', '04', '07', '09', '11', '13']);
  // Três pessoas só cabem na Suite Farol e no Pátio
  const tres = await call(`/api/disponibilidade?chegada=${F}&saida=${F2}&hospedes=3`);
  assert.deepEqual(tres.data.free, ['03', '04', '07', '09']);
  assert.equal((await call(`/api/disponibilidade?chegada=${F2}&saida=${F}`)).status, 400);
  // Calendário de noites: chaves livres e preço mais baixo por noite
  const cal = await call(`/api/calendario?desde=${F}&dias=2`);
  assert.equal(cal.status, 200);
  assert.deepEqual(cal.data.nights.map((n) => n.free), [8, 8]);
  assert.equal(cal.data.nights[0].from, 130);
  assert.equal((await call(`/api/calendario?desde=${F}&dias=1&tipo=suite-farol&hospedes=3`)).data.nights[0].free, 2);
  assert.equal((await call('/api/calendario?dias=500')).status, 400);
  assert.equal((await call('/api/disponibilidade?chegada=ontem')).status, 400);
  assert.equal((await call(`/api/disponibilidade?chegada=${today()}&saida=${addDays(today(), 20)}`)).status, 400);
});

test('login, refresh com rotação e logout', async () => {
  assert.equal((await login('hospede@arriba.exemplo', 'errada-123456')).status, 401);
  const ok = await login('hospede@arriba.exemplo', 'arriba-hospede-2026');
  assert.equal(ok.status, 200);
  assert.match(ok.cookie, /^arriba_refresh=/);
  const r1 = await call('/api/auth/refresh', { method: 'POST', cookie: ok.cookie });
  assert.equal(r1.status, 200);
  assert.notEqual(r1.cookie, ok.cookie);
  // O refresh antigo já não serve e, por ter sido reutilizado, termina todas as sessões
  assert.equal((await call('/api/auth/refresh', { method: 'POST', cookie: ok.cookie })).status, 401);
  assert.equal((await call('/api/auth/refresh', { method: 'POST', cookie: r1.cookie })).status, 401);
  const out = await call('/api/auth/logout', { method: 'POST', cookie: ok.cookie });
  assert.equal(out.status, 204);
});

test('criar conta valida os campos e trava robôs', async () => {
  const startedAt = Date.now() - 5000;
  const bad = await call('/api/auth/registar', { method: 'POST', body: { name: 'A', email: 'x', password: 'curta', startedAt } });
  assert.equal(bad.status, 400);
  assert.deepEqual(bad.data.details.map((d) => d.field).sort(), ['email', 'name', 'password']);
  assert.equal((await call('/api/auth/registar', { method: 'POST', body: { name: 'Robô', email: 'robo@exemplo.pt', password: 'palavra-passe-longa', website: 'spam', startedAt } })).status, 400);
  assert.equal((await call('/api/auth/registar', { method: 'POST', body: { name: 'Rápido', email: 'rapido@exemplo.pt', password: 'palavra-passe-longa', startedAt: Date.now() } })).status, 400);
  const ok = await call('/api/auth/registar', { method: 'POST', body: { name: 'Marta Teste', email: 'marta@exemplo.pt', password: 'palavra-passe-longa', startedAt } });
  assert.equal(ok.status, 201);
  assert.equal(ok.data.user.role, 'hospede');
  assert.equal((await call('/api/auth/registar', { method: 'POST', body: { name: 'Marta Teste', email: 'MARTA@exemplo.pt', password: 'palavra-passe-longa', startedAt } })).status, 409);
});

test('hóspede reserva uma chave livre; a mesma chave não sai duas vezes', async () => {
  const token = await guestToken();
  const body = { room: '02', checkIn: F, checkOut: F2, guests: 2, arrivalTime: '18:00', notes: 'Chegamos de comboio.' };
  assert.equal((await call('/api/hospede/reservas', { method: 'POST', body })).status, 401);
  const r = await call('/api/hospede/reservas', { method: 'POST', token, body });
  assert.equal(r.status, 201);
  assert.equal(r.data.reservation.total, 260);
  assert.equal((await call('/api/hospede/reservas', { method: 'POST', token, body })).status, 409);
  // Quarto ocupado, gente a mais e datas ao contrário
  assert.equal((await call('/api/hospede/reservas', { method: 'POST', token, body: { ...body, room: '05' } })).status, 409);
  assert.equal((await call('/api/hospede/reservas', { method: 'POST', token, body: { ...body, room: '11', guests: 3 } })).status, 400);
  assert.equal((await call('/api/hospede/reservas', { method: 'POST', token, body: { ...body, room: '11', checkIn: F2, checkOut: F } })).status, 400);
  assert.equal((await call('/api/hospede/reservas', { method: 'POST', token, body: { ...body, room: '11', arrivalTime: '03:00' } })).status, 400);
  // A chave saiu do quadro
  assert.ok(!(await call('/api/disponibilidade')).data.free.includes('02'));
});

test('hóspede muda a hora, faz pedidos e cancela dentro do prazo', async () => {
  const token = await guestToken();
  const { data } = await call('/api/hospede/reservas', { token });
  const futura = data.reservations.find((r) => r.room === '03');
  assert.ok(futura.canCancel);
  assert.equal((await call(`/api/hospede/reservas/${futura.id}`, { method: 'PATCH', token, body: { arrivalTime: '20:00' } })).data.reservation.arrivalTime, '20:00');
  assert.equal((await call(`/api/hospede/reservas/${futura.id}/pedidos`, { method: 'POST', token, body: { kind: 'massagem', date: futura.checkIn } })).status, 201);
  assert.equal((await call(`/api/hospede/reservas/${futura.id}/pedidos`, { method: 'POST', token, body: { kind: 'massagem', date: addDays(futura.checkOut, 3) } })).status, 400);
  assert.equal((await call(`/api/hospede/reservas/${futura.id}/pedidos`, { method: 'POST', token, body: { kind: 'helicoptero', date: futura.checkIn } })).status, 400);
  // Reservas de outra pessoa não existem para esta conta
  const desk = await deskToken();
  const outra = (await call('/api/rececao/reservas', { token: desk })).data.reservations.find((r) => r.guestName !== 'Inês Correia');
  assert.equal((await call(`/api/hospede/reservas/${outra.id}/cancelar`, { method: 'POST', token })).status, 404);
  // Cancela a futura; a passada não se cancela
  assert.equal((await call(`/api/hospede/reservas/${futura.id}/cancelar`, { method: 'POST', token })).data.reservation.status, 'cancelada');
  const passada = data.reservations.find((r) => r.status === 'terminada');
  assert.equal((await call(`/api/hospede/reservas/${passada.id}/cancelar`, { method: 'POST', token })).status, 409);
  // A receção não entra na área do hóspede e o hóspede não entra na receção
  assert.equal((await call('/api/hospede/reservas', { token: desk })).status, 403);
  assert.equal((await call('/api/rececao/hoje', { token })).status, 403);
});

test('receção: dia de hoje, entradas e saídas, pedidos, ementa e preços', async () => {
  const token = await deskToken();
  const hoje = (await call('/api/rececao/hoje', { token })).data;
  assert.equal(hoje.board.length, 14);
  const chegada = hoje.arrivals.find((r) => r.room === '13');
  assert.ok(chegada);
  assert.equal((await call(`/api/rececao/reservas/${chegada.id}/estado`, { method: 'PATCH', token, body: { status: 'em-casa' } })).data.reservation.status, 'em-casa');
  // Não se volta atrás nem se salta passos
  assert.equal((await call(`/api/rececao/reservas/${chegada.id}/estado`, { method: 'PATCH', token, body: { status: 'confirmada' } })).status, 409);
  const saida = hoje.departures[0];
  assert.equal((await call(`/api/rececao/reservas/${saida.id}/estado`, { method: 'PATCH', token, body: { status: 'terminada' } })).status, 200);

  const pedido = hoje.requests[0];
  assert.equal((await call(`/api/rececao/pedidos/${pedido.id}`, { method: 'PATCH', token, body: { status: 'feito' } })).data.request.status, 'feito');

  assert.equal((await call('/api/rececao/ementa', { method: 'PUT', token, body: { items: [] } })).status, 400);
  const nova = await call('/api/rececao/ementa', { method: 'PUT', token, body: { items: [{ name: 'Sopa de peixe', detail: 'Com hortelã', price: 9 }] } });
  assert.equal(nova.status, 200);
  assert.match((await call('/restaurante')).data, /Sopa de peixe/);

  assert.equal((await call('/api/rececao/precos/duna', { method: 'PATCH', token, body: { price: 10 } })).status, 400);
  assert.equal((await call('/api/rececao/precos/duna', { method: 'PATCH', token, body: { price: 140 } })).status, 200);
  assert.equal((await call('/api/disponibilidade')).data.types.find((t) => t.slug === 'duna').price, 140);
});

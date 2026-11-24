import { ads, conversations, documents, messages, users } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { maskSensitive } from '../utils/sensitive.js';

// Pedidos de informação: a conversa fica dentro da plataforma.
// Contactos escritos nas mensagens (telefone, email, IBAN, moradas) são retirados automaticamente.

const firstName = (name = '') => name.split(' ')[0];

export async function ask(userId, adId, question) {
  const ad = await ads.findById(adId);
  if (!ad || ad.status !== 'ativo') throw new HttpError(400, 'Este anúncio não está a receber pedidos de informação');
  if (ad.ownerId === userId) throw new HttpError(400, 'Este anúncio é seu');

  const open = await conversations.findOne((c) => c.adId === adId && c.askerId === userId && ['pendente', 'aberta'].includes(c.status));
  if (open) throw new HttpError(409, 'Já tem um pedido aberto para este anúncio. Continue nessa conversa na sua conta.');

  const conversation = await conversations.create({ adId, askerId: userId, ownerId: ad.ownerId, status: 'pendente', updatedAt: new Date().toISOString() });
  const masked = await post(conversation, userId, question);
  return { id: conversation.id, masked };
}

async function post(conversation, authorId, text, documentId) {
  const m = maskSensitive(text ?? '');
  await messages.create({ conversationId: conversation.id, authorId, text: m.text, masked: m.changed, documentId: documentId ?? null });
  await conversations.update(conversation.id, { updatedAt: new Date().toISOString() });
  return m.changed;
}

async function participant(userId, id) {
  const c = await conversations.findById(id);
  if (!c || (c.askerId !== userId && c.ownerId !== userId)) throw notFound('Conversa');
  return c;
}

async function view(c, userId) {
  const [ad, asker, list] = await Promise.all([ads.findById(c.adId), users.findById(c.askerId), messages.findAll((m) => m.conversationId === c.id)]);
  const docs = await Promise.all(list.filter((m) => m.documentId).map((m) => documents.findById(m.documentId)));
  const docById = new Map(docs.filter(Boolean).map((d) => [d.id, d]));
  const role = c.ownerId === userId ? 'dono' : 'doador';

  return {
    id: c.id,
    status: c.status,
    role,
    ad: { id: ad.id, title: ad.title, slug: ad.slug },
    // Quem pergunta vê só o nome que o anúncio mostra; quem criou o anúncio vê só o primeiro nome de quem pergunta
    other: role === 'dono' ? firstName(asker?.name) || 'Pessoa' : ad.visibility.alias && ad.alias ? ad.alias : 'Quem criou o anúncio',
    messages: list
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((m) => ({
        id: m.id,
        mine: m.authorId === userId,
        text: m.text,
        masked: m.masked,
        system: m.system ?? false,
        document: m.documentId && docById.get(m.documentId) ? { id: m.documentId, description: docById.get(m.documentId).description, mime: docById.get(m.documentId).mime } : null,
        createdAt: m.createdAt,
      })),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export async function listFor(userId) {
  const list = await conversations.findAll((c) => c.askerId === userId || c.ownerId === userId);
  const views = await Promise.all(list.map((c) => view(c, userId)));
  return views.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function get(userId, id) {
  return view(await participant(userId, id), userId);
}

export async function reply(userId, id, text) {
  const c = await participant(userId, id);
  if (c.status === 'recusada' || c.status === 'fechada') throw new HttpError(400, 'Esta conversa está fechada');
  if (c.status === 'pendente' && c.ownerId !== userId) throw new HttpError(400, 'Aguarde que quem criou o anúncio aceite responder');
  if (c.status === 'pendente') await conversations.update(id, { status: 'aberta' });
  return { masked: await post(c, userId, text) };
}

// Quem criou o anúncio decide: recusar (com ou sem mensagem), fechar, ou partilhar uma prova sua só com esta pessoa
export async function decline(userId, id, text) {
  const c = await participant(userId, id);
  if (c.ownerId !== userId) throw new HttpError(403, 'Só quem criou o anúncio pode recusar');
  if (text) await post(c, userId, text);
  await messages.create({ conversationId: id, authorId: userId, text: 'Pedido recusado. Nenhum dado privado foi partilhado.', system: true, masked: false });
  await conversations.update(id, { status: 'recusada', updatedAt: new Date().toISOString() });
}

export async function close(userId, id) {
  const c = await participant(userId, id);
  await messages.create({ conversationId: id, authorId: userId, text: 'Conversa fechada.', system: true, masked: false });
  await conversations.update(c.id, { status: 'fechada', updatedAt: new Date().toISOString() });
}

export async function shareDocument(userId, id, documentId) {
  const c = await participant(userId, id);
  if (c.ownerId !== userId) throw new HttpError(403, 'Só quem criou o anúncio pode partilhar provas');
  if (c.status === 'recusada' || c.status === 'fechada') throw new HttpError(400, 'Esta conversa está fechada');
  const doc = await documents.findById(documentId);
  if (!doc || doc.ownerId !== userId || doc.adId !== c.adId) throw notFound('Prova');
  if (c.status === 'pendente') await conversations.update(id, { status: 'aberta' });
  await post(c, userId, '', documentId);
}

// Uma prova só se abre numa conversa se tiver sido partilhada nessa conversa
export async function sharedDocument(userId, id, documentId) {
  const c = await participant(userId, id);
  const shared = await messages.findOne((m) => m.conversationId === c.id && m.documentId === documentId);
  if (!shared) throw notFound('Prova');
  const doc = await documents.findById(documentId);
  if (!doc) throw notFound('Prova');
  return doc;
}

export async function unreadCount(userId) {
  const list = await conversations.findAll((c) => c.ownerId === userId && c.status === 'pendente');
  return list.length;
}

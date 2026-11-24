export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const feminine = new Set(['Conta', 'Conversa', 'Denúncia', 'Doação', 'Contribuição', 'Prova', 'Despesa', 'Entrega']);

export const notFound = (what = 'Recurso') => new HttpError(404, `${what} não ${feminine.has(what) ? 'encontrada' : 'encontrado'}`);

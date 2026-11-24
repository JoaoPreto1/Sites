// Deteta contactos e números de identificação em texto livre (anúncios e mensagens)
const PATTERNS = [
  ['email', /[\w.+-]+@[\w-]+\.[\w.-]+/g],
  ['iban', /\bPT\s?50(?:[\s.]?\d){21}\b/gi],
  ['telefone', /(?:\+|00)?(?:351[\s.-]?)?\b(?:9[1236]|2\d)\d(?:[\s.-]?\d){6}\b/g],
  ['identificacao', /\b(?:NIF|NISS|contribuinte|CC|cart[aã]o de cidad[aã]o)\D{0,12}\d(?:[\s.]?\d){7,10}\b/gi],
  ['morada', /\b(?:rua|avenida|av\.|travessa|largo|praceta|estrada)\s+[^\n,.]{2,40},?\s*(?:n\.?º|nº|n\.|número)?\s*\d+/gi],
  ['codigo_postal', /\b\d{4}-\d{3}\b/g],
];

const LABELS = {
  email: 'um email',
  iban: 'um IBAN',
  telefone: 'um número de telefone',
  identificacao: 'um número de identificação',
  morada: 'uma morada',
  codigo_postal: 'um código postal',
};

const fresh = (re) => new RegExp(re.source, re.flags);

export function findSensitive(text = '') {
  return PATTERNS.filter(([, re]) => fresh(re).test(text)).map(([kind]) => kind);
}

export const describeSensitive = (kinds) => kinds.map((k) => LABELS[k]).join(', ');

export function maskSensitive(text = '') {
  const masked = PATTERNS.reduce((acc, [, re]) => acc.replace(fresh(re), '[removido]'), text);
  return { text: masked, changed: masked !== text };
}

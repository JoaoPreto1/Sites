// Formatação no browser, com os nomes dos meses escritos à mão (iguais aos do servidor)
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export const esc = (value = '') =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const shortDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
};

export const longDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
};

export const monthYear = (iso) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const euro = (value) => `${value.toFixed(2).replace('.', ',')} €`;

export const dateTime = (iso) => {
  const d = new Date(iso);
  return `${shortDate(iso)}, ${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`;
};

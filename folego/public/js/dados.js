// Dados de exemplo do estúdio (fictício). O horário é igual todas as semanas
// e as datas são sempre calculadas a partir de hoje.
export const AULAS = {
  hatha: { nome: 'Hatha', resumo: 'Posturas lentas, seguradas com tempo. Boa para começar.', ritmo: 1 },
  vinyasa: { nome: 'Vinyasa', resumo: 'O movimento segue a respiração, sem paragens. Aquece.', ritmo: 3 },
  yin: { nome: 'Yin', resumo: 'Poucas posturas, longas e no chão. Para soltar o que ficou preso.', ritmo: 0 },
  respiracao: { nome: 'Respiração', resumo: 'Sentados, só a respirar. Técnicas para dormir melhor e acalmar.', ritmo: 0 },
  prenatal: { nome: 'Pré-natal', resumo: 'Para grávidas a partir das 14 semanas, com almofadas e pausas.', ritmo: 1 },
  costas: { nome: 'Costas', resumo: 'Para quem passa o dia sentado: anca, ombros e coluna.', ritmo: 2 },
};

export const PROFESSORAS = {
  ines: { nome: 'Inês Couto', faz: 'Hatha e Respiração' },
  marta: { nome: 'Marta Leal', faz: 'Vinyasa e Costas' },
  rita: { nome: 'Rita Sales', faz: 'Yin e Pré-natal' },
};

// dia da semana (0 = domingo), hora, aula, professora, sala, nível, lugares
export const HORARIO = [
  [1, '07:30', 'respiracao', 'ines', 'Sala Mar', 'todos', 14], [1, '12:30', 'costas', 'marta', 'Sala Mar', 'todos', 12], [1, '18:30', 'hatha', 'ines', 'Sala Pinhal', 'iniciação', 16],
  [2, '07:30', 'vinyasa', 'marta', 'Sala Mar', 'intermédio', 14], [2, '18:30', 'hatha', 'ines', 'Sala Mar', 'iniciação', 16], [2, '20:00', 'yin', 'rita', 'Sala Pinhal', 'todos', 12],
  [3, '07:30', 'respiracao', 'ines', 'Sala Pinhal', 'todos', 14], [3, '10:00', 'prenatal', 'rita', 'Sala Mar', 'todos', 8], [3, '19:00', 'vinyasa', 'marta', 'Sala Mar', 'intermédio', 14],
  [4, '12:30', 'costas', 'marta', 'Sala Mar', 'todos', 12], [4, '18:30', 'hatha', 'ines', 'Sala Pinhal', 'iniciação', 16], [4, '20:00', 'yin', 'rita', 'Sala Mar', 'todos', 12],
  [5, '07:30', 'vinyasa', 'marta', 'Sala Mar', 'intermédio', 14], [5, '18:00', 'respiracao', 'ines', 'Sala Pinhal', 'todos', 14],
  [6, '10:00', 'prenatal', 'rita', 'Sala Mar', 'todos', 8], [6, '11:30', 'hatha', 'ines', 'Sala Mar', 'iniciação', 16],
  [0, '10:00', 'yin', 'rita', 'Sala Mar', 'todos', 12],
];

const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// lugares já ocupados: um número fixo por aula e dia, para não mudar a cada visita
const ocupados = (data, i) => (data.getDate() * 7 + i * 13) % 9;

/** As aulas dos próximos `dias` dias, por ordem, a partir de agora. */
export function proximas(dias = 7, agora = new Date()) {
  const lista = [];
  for (let d = 0; d < dias; d++) {
    const dia = new Date(agora); dia.setDate(agora.getDate() + d); dia.setHours(0, 0, 0, 0);
    HORARIO.forEach(([sem, hora, aula, prof, sala, nivel, lugares], i) => {
      if (sem !== dia.getDay()) return;
      const [h, m] = hora.split(':').map(Number);
      const quando = new Date(dia); quando.setHours(h, m);
      if (quando <= agora) return;
      lista.push({ id: `${quando.toISOString().slice(0, 10)}-${hora.replace(':', '')}-${aula}`, quando, hora, aula, prof, sala, nivel, livres: Math.max(0, lugares - 3 - ocupados(dia, i)) });
    });
  }
  return lista.sort((a, b) => a.quando - b.quando);
}

/** "hoje", "amanhã" ou o dia da semana. */
export function diaCurto(data, agora = new Date()) {
  const a = new Date(agora); a.setHours(0, 0, 0, 0);
  const b = new Date(data); b.setHours(0, 0, 0, 0);
  const dif = Math.round((b - a) / 864e5);
  return dif === 0 ? 'hoje' : dif === 1 ? 'amanhã' : DIAS[data.getDay()];
}

export const dataLonga = (d) => `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}`;
export const dataCurta = (d) => `${d.getDate()} ${MESES[d.getMonth()]}`;

/** Os retiros acontecem sempre no segundo fim de semana dos próximos meses. */
export function retiros(agora = new Date()) {
  const base = [
    { id: 'sintra', nome: 'Serra adentro', onde: 'Quinta fictícia na Serra de Sintra', dias: 3, preco: 390, lugares: 14, tom: 'Caminhadas no nevoeiro, yin ao fim do dia, comida vegetariana da horta.' },
    { id: 'alentejo', nome: 'Planície e silêncio', onde: 'Monte fictício perto de Évora', dias: 4, preco: 480, lugares: 12, tom: 'Quatro dias sem relógio: respiração ao nascer do sol e piscina de água salgada.' },
    { id: 'geres', nome: 'Água fria, cabeça leve', onde: 'Casa de pedra fictícia no Gerês', dias: 3, preco: 420, lugares: 10, tom: 'Banhos de rio, vinyasa na eira e noites de lareira.' },
  ];
  return base.map((r, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth() + 1 + i * 2, 1);
    while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
    d.setDate(d.getDate() + 7);
    const fim = new Date(d); fim.setDate(d.getDate() + r.dias - 1);
    return { ...r, inicio: d, fim };
  });
}

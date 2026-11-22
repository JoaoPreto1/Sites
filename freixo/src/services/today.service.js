import { MUNICIPIO } from '../config/municipio.js';

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const minutes = (hhmm) => {
  const [h, m] = hhmm.split('h').map(Number);
  return h * 60 + (m || 0);
};

// Estado do atendimento nos Paços do Concelho, à hora de Portugal
export function deskStatus(now = new Date()) {
  const lisbon = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Lisbon' }));
  const day = lisbon.getDay();
  const t = lisbon.getHours() * 60 + lisbon.getMinutes();
  const spans = MUNICIPIO.hours.map(([, s]) => s.split('–').map(minutes));
  const weekday = day >= 1 && day <= 5;
  const openSpan = weekday && spans.find(([a, b]) => t >= a && t < b);

  if (openSpan) {
    const close = MUNICIPIO.hours[spans.indexOf(openSpan)][1].split('–')[1];
    return { open: true, text: `Abertos até às ${close}` };
  }
  if (weekday && t < spans[1][0]) {
    const next = t < spans[0][0] ? MUNICIPIO.hours[0][1] : MUNICIPIO.hours[1][1];
    return { open: false, text: `Fechados · abrem hoje às ${next.split('–')[0]}` };
  }
  const nextDay = day === 5 || day === 6 ? 1 : day === 0 ? 1 : day + 1;
  return { open: false, text: `Fechados · abrem ${WEEKDAYS[nextDay]} às ${MUNICIPIO.hours[0][1].split('–')[0]}` };
}

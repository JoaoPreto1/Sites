const DAY = 24 * 60 * 60 * 1000;

export const toDate = (iso) => new Date(`${iso}T00:00:00Z`);
export const toIso = (date) => date.toISOString().slice(0, 10);
export const today = () => toIso(new Date());

export const addDays = (iso, days) => toIso(new Date(toDate(iso).getTime() + days * DAY));

export const nightsBetween = (from, to) => Math.round((toDate(to) - toDate(from)) / DAY);

export function eachNight(from, to) {
  const nights = [];
  for (let day = from; day < to; day = addDays(day, 1)) nights.push(day);
  return nights;
}

export const overlaps = (startA, endA, startB, endB) => startA < endB && startB < endA;

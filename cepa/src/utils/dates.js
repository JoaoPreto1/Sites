export const today = () => new Date().toISOString().slice(0, 10);

export function ageOn(birthDate, on = today()) {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [y, m, d] = on.split('-').map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

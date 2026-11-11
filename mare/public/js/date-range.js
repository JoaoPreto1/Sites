import { addDays, todayIso } from './utils.js';

// Liga dois <input type="date"> para que a saída seja sempre depois da entrada
export function linkDateInputs(checkIn, checkOut, { minNights = 1 } = {}) {
  const today = todayIso();
  checkIn.min = today;
  checkOut.min = addDays(today, minNights);

  checkIn.addEventListener('change', () => {
    if (!checkIn.value) return;
    const earliestOut = addDays(checkIn.value, minNights);
    checkOut.min = earliestOut;
    if (!checkOut.value || checkOut.value < earliestOut) checkOut.value = earliestOut;
  });
}

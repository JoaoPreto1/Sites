import { addDays, todayIso } from './utils.js';

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEK = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

const pad = (n) => String(n).padStart(2, '0');

// Calendário de disponibilidade: o primeiro clique marca a entrada, o segundo a saída
export function createCalendar(root, { nights, months = 2, onSelect }) {
  const info = new Map(nights.map((night) => [night.date, night]));
  const today = todayIso();
  let view = new Date();
  view.setDate(1);
  let checkIn = '';
  let checkOut = '';

  const isFree = (date) => info.get(date)?.available ?? false;

  function rangeIsFree(from, to) {
    for (let day = from; day < to; day = addDays(day, 1)) if (!isFree(day)) return false;
    return true;
  }

  function dayCell(date) {
    const night = info.get(date);
    const classes = ['cal__day'];
    let disabled = date < today;

    if (checkIn && !checkOut) {
      disabled ||= date !== checkIn && (date < checkIn ? !isFree(date) : !rangeIsFree(checkIn, date));
    } else {
      disabled ||= !isFree(date);
    }

    if (!isFree(date) && date >= today) classes.push('is-busy');
    if (date === checkIn || date === checkOut) classes.push('is-edge');
    if (checkIn && checkOut && date > checkIn && date < checkOut) classes.push('is-between');

    return `
      <button type="button" class="${classes.join(' ')}" data-date="${date}" ${disabled ? 'disabled' : ''}>
        <span>${Number(date.slice(8))}</span>
        ${night && night.available && date >= today ? `<small>${night.price}€</small>` : ''}
      </button>`;
  }

  function monthMarkup(year, month) {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: offset }, () => '<span></span>');

    for (let day = 1; day <= days; day++) cells.push(dayCell(`${year}-${pad(month + 1)}-${pad(day)}`));

    return `
      <div class="cal__month">
        <h4>${MONTH_NAMES[month]} ${year}</h4>
        <div class="cal__grid">
          ${WEEK.map((d) => `<span class="cal__weekday">${d}</span>`).join('')}
          ${cells.join('')}
        </div>
      </div>`;
  }

  function render() {
    const blocks = [];
    for (let i = 0; i < months; i++) {
      const date = new Date(view.getFullYear(), view.getMonth() + i, 1);
      blocks.push(monthMarkup(date.getFullYear(), date.getMonth()));
    }

    const atStart = view.getFullYear() === new Date().getFullYear() && view.getMonth() === new Date().getMonth();
    root.innerHTML = `
      <div class="cal__nav">
        <button type="button" data-move="-1" aria-label="Mês anterior" ${atStart ? 'disabled' : ''}>←</button>
        <button type="button" data-move="1" aria-label="Mês seguinte">→</button>
      </div>
      <div class="cal__months">${blocks.join('')}</div>
      <div class="cal__legend">
        <span><i class="cal__dot is-edge"></i>A sua estadia</span>
        <span><i class="cal__dot is-busy"></i>Ocupado</span>
        ${checkIn ? '<button type="button" class="link" data-reset>Limpar datas</button>' : ''}
      </div>`;
  }

  root.addEventListener('click', (event) => {
    const move = event.target.closest('[data-move]');
    if (move) {
      view = new Date(view.getFullYear(), view.getMonth() + Number(move.dataset.move), 1);
      return render();
    }

    if (event.target.closest('[data-reset]')) {
      checkIn = checkOut = '';
      render();
      return onSelect('', '');
    }

    const day = event.target.closest('[data-date]');
    if (!day || day.disabled) return;
    const date = day.dataset.date;

    if (!checkIn || checkOut || date <= checkIn) {
      checkIn = date;
      checkOut = '';
    } else {
      checkOut = date;
      onSelect(checkIn, checkOut);
    }
    render();
  });

  render();

  return {
    setRange(from, to) {
      checkIn = from || '';
      checkOut = to || '';
      if (checkIn) {
        const target = new Date(`${checkIn}T12:00:00`);
        view = new Date(target.getFullYear(), target.getMonth(), 1);
      }
      render();
    },
  };
}

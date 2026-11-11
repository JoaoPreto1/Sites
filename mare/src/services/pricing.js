import { eachNight, nightsBetween } from '../utils/dates.js';

const TOURIST_TAX = 1.5;
const TOURIST_TAX_MAX_NIGHTS = 7;

const round = (value) => Math.round(value * 100) / 100;

export function priceForNight(property, date) {
  const monthDay = date.slice(5);
  const season = property.seasons?.find(({ from, to }) => monthDay >= from && monthDay <= to);
  return season ? season.price : property.pricePerNight;
}

export function quoteStay(property, { checkIn, checkOut, adults = 1, children = 0, extras = [] }) {
  const nights = nightsBetween(checkIn, checkOut);
  const nightly = eachNight(checkIn, checkOut).map((date) => ({ date, price: priceForNight(property, date) }));
  const accommodation = nightly.reduce((sum, night) => sum + night.price, 0);

  const extrasLines = extras.map(({ experience, people }) => ({
    experienceId: experience.id,
    name: experience.name,
    people,
    unitPrice: experience.price,
    total: experience.price * people,
  }));
  const extrasTotal = extrasLines.reduce((sum, line) => sum + line.total, 0);

  const touristTax = TOURIST_TAX * adults * Math.min(nights, TOURIST_TAX_MAX_NIGHTS);
  const total = accommodation + property.cleaningFee + extrasTotal + touristTax;

  return {
    nights,
    adults,
    children,
    nightly,
    accommodation: round(accommodation),
    cleaningFee: property.cleaningFee,
    extras: extrasLines,
    extrasTotal: round(extrasTotal),
    touristTax: round(touristTax),
    total: round(total),
  };
}

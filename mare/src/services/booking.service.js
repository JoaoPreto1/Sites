import { properties, experiences } from '../repositories/index.js';
import { isAvailable } from './availability.js';
import { quoteStay } from './pricing.js';
import { nightsBetween, today } from '../utils/dates.js';
import { HttpError, notFound } from '../utils/httpError.js';

export async function buildQuote({ propertyId, checkIn, checkOut, adults, children = 0, extras = [] }) {
  const property = await properties.findById(propertyId);
  if (!property?.active) throw notFound('Alojamento');

  if (checkIn < today()) throw new HttpError(400, 'A data de entrada já passou');

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < property.minNights) {
    throw new HttpError(400, `Esta casa tem uma estadia mínima de ${property.minNights} noites`);
  }

  if (adults + children > property.guests) {
    throw new HttpError(400, `Esta casa recebe no máximo ${property.guests} hóspedes`);
  }

  const extraItems = await Promise.all(
    extras.map(async ({ experienceId, people }) => {
      const experience = await experiences.findById(experienceId);
      if (!experience) throw new HttpError(400, 'Uma das experiências escolhidas já não existe');
      return { experience, people };
    }),
  );

  const available = await isAvailable(property.id, checkIn, checkOut);
  const quote = quoteStay(property, { checkIn, checkOut, adults, children, extras: extraItems });

  return { property, available, quote };
}

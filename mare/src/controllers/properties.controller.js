import { properties } from '../repositories/index.js';
import { isAvailable, unavailableNights } from '../services/availability.js';
import { priceForNight, quoteStay } from '../services/pricing.js';
import { eachNight, nightsBetween } from '../utils/dates.js';
import { notFound } from '../utils/httpError.js';

const summary = (property) => ({
  id: property.id,
  slug: property.slug,
  name: property.name,
  tagline: property.tagline,
  area: property.area,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  guests: property.guests,
  size: property.size,
  pricePerNight: property.pricePerNight,
  minNights: property.minNights,
  tags: property.tags,
  images: property.images,
  rating: property.rating,
  reviewsCount: property.reviews.length,
});

export async function findActiveBySlug(slug) {
  const property = await properties.findOne((p) => p.slug === slug && p.active);
  if (!property) throw notFound('Alojamento');
  return property;
}

export async function list(req, res) {
  const { checkIn, checkOut, guests, tag } = req.valid.query;

  const matches = await properties.findAll(
    (p) => p.active && (!guests || p.guests >= guests) && (!tag || p.tags.includes(tag)),
  );

  const results = await Promise.all(
    matches.map(async (property) => {
      const item = summary(property);
      if (!checkIn || !checkOut) return item;

      const nights = nightsBetween(checkIn, checkOut);
      const free = await isAvailable(property.id, checkIn, checkOut);
      const longEnough = nights >= property.minNights;

      return {
        ...item,
        available: free && longEnough,
        unavailableReason: !free ? 'ocupada' : !longEnough ? `mínimo ${property.minNights} noites` : null,
        stay: { nights, total: quoteStay(property, { checkIn, checkOut }).accommodation },
      };
    }),
  );

  results.sort((a, b) => Number(b.available ?? true) - Number(a.available ?? true));
  res.json({ properties: results });
}

export async function show(req, res) {
  const { ownerId, active, ...property } = await findActiveBySlug(req.params.slug);
  res.json({ property: { ...property, reviewsCount: property.reviews.length } });
}

export async function calendar(req, res) {
  const property = await findActiveBySlug(req.params.slug);
  const { from, to } = req.valid.query;
  const busy = await unavailableNights(property.id, from, to);

  const nights = eachNight(from, to).map((date) => ({
    date,
    price: priceForNight(property, date),
    available: !busy.has(date),
  }));

  res.json({ minNights: property.minNights, nights });
}

import { bookings, blocks } from '../repositories/index.js';
import { eachNight, overlaps } from '../utils/dates.js';

const ACTIVE_STATUSES = ['pendente', 'confirmada'];

async function busyRanges(propertyId, { ignoreBookingId } = {}) {
  const [propertyBookings, propertyBlocks] = await Promise.all([
    bookings.findAll((b) => b.propertyId === propertyId && ACTIVE_STATUSES.includes(b.status) && b.id !== ignoreBookingId),
    blocks.findAll((k) => k.propertyId === propertyId),
  ]);

  return [
    ...propertyBookings.map((b) => ({ from: b.checkIn, to: b.checkOut })),
    ...propertyBlocks.map((k) => ({ from: k.from, to: k.to })),
  ];
}

export async function isAvailable(propertyId, checkIn, checkOut, options) {
  const ranges = await busyRanges(propertyId, options);
  return !ranges.some((range) => overlaps(checkIn, checkOut, range.from, range.to));
}

export async function unavailableNights(propertyId, from, to) {
  const ranges = await busyRanges(propertyId);
  const busy = new Set();

  for (const range of ranges) {
    if (!overlaps(from, to, range.from, range.to)) continue;
    for (const night of eachNight(range.from, range.to)) busy.add(night);
  }

  return busy;
}

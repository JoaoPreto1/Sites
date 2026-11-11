import { bookings } from '../repositories/index.js';
import * as service from '../services/booking.service.js';

const present = async (booking) => {
  const full = await service.withProperty(booking);
  return { ...full, ...service.cancellationInfo(booking) };
};

export async function quote(req, res) {
  const { available, quote } = await service.buildQuote(req.valid.body);
  res.json({ available, quote });
}

export async function create(req, res) {
  const booking = await service.createBooking(req.user.id, req.valid.body);
  res.status(201).json({ booking: await present(booking) });
}

export async function mine(req, res) {
  const list = await bookings.findAll((b) => b.userId === req.user.id);
  list.sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  res.json({ bookings: await Promise.all(list.map(present)) });
}

export async function show(req, res) {
  const booking = await service.findForUser(req.params.code, req.user);
  res.json({ booking: await present(booking) });
}

export async function cancel(req, res) {
  const booking = await service.cancelBooking(req.params.code, req.user.id);
  res.json({ booking: await present(booking) });
}

export async function checkin(req, res) {
  const booking = await service.saveOnlineCheckin(req.params.code, req.user.id, req.valid.body);
  res.json({ booking: await present(booking) });
}

export async function addExtra(req, res) {
  const booking = await service.addExtra(req.params.code, req.user.id, req.valid.body);
  res.json({ booking: await present(booking) });
}

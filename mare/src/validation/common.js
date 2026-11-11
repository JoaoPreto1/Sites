import { z } from 'zod';

export const isoDate = z.iso.date();

export const stayDates = {
  checkIn: isoDate,
  checkOut: isoDate,
};

export const checkOutAfterCheckIn = (data) => !data.checkIn || !data.checkOut || data.checkOut > data.checkIn;

export const datesMessage = { message: 'A data de saída tem de ser depois da entrada', path: ['checkOut'] };

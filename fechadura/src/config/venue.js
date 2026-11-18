export const VENUE = {
  name: 'Fechadura',
  street: 'Rua de Cedofeita 196',
  door: '196',
  postalCode: '4050-174',
  city: 'Porto',
  phone: '+351 222 019 640',
  email: 'ola@fechadura.pt',
  geo: { latitude: 41.1531, longitude: -8.6176 },
  // Horas de início das sessões: dias úteis à tarde, fins de semana o dia todo. Fecha à segunda.
  slots: {
    weekday: ['17:30', '19:00', '20:30', '22:00'],
    weekend: ['10:30', '12:00', '14:30', '16:00', '17:30', '19:00', '20:30', '22:00'],
  },
  closedWeekdays: [1],
  bookingDays: 45,
  cancelHours: 24,
};

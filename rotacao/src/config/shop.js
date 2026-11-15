export const shop = {
  freeShippingFrom: 80,
  shippingCost: 4.9,
  maxPerRecord: 3,
  // Quando um disco da lista de procura entra na loja, fica guardado este tempo
  holdHours: 48,
};

export const rooms = {
  opens: 10,
  closes: 24,
  maxHours: 6,
  daysAhead: 14,
  cancelHours: 24,
  extras: {
    gravar: { label: 'Gravar o ensaio em multipista', price: 10 },
    pratos: { label: 'Pratos e tarola da casa', price: 5 },
  },
};

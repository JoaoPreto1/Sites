// Todo o dinheiro anda em cêntimos inteiros; só se formata no fim
export const euros = (cents) => {
  const abs = Math.abs(Math.round(cents));
  const int = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${cents < 0 ? '−' : ''}${int},${String(abs % 100).padStart(2, '0')} €`;
};

export const eurosShort = (cents) => (Math.round(cents) % 100 === 0 ? euros(cents).replace(',00', '') : euros(cents));

export function feeFor(cents, fees) {
  const provider = Math.round((cents * fees.providerPercent) / 100) + fees.providerFixedCents;
  const platform = Math.round((cents * fees.platformPercent) / 100);
  return { provider, platform, total: provider + platform };
}

// Quanto cobrar para que, depois das comissões, chegue exatamente `cents`
export function grossUp(cents, fees) {
  const pct = (fees.providerPercent + fees.platformPercent) / 100;
  let gross = Math.ceil((cents + fees.providerFixedCents) / (1 - pct));
  while (gross - feeFor(gross, fees).total < cents) gross += 1;
  return gross;
}

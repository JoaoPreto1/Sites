// Gera URLs do Unsplash em vários tamanhos para srcset (o mesmo formato que o frontend usa)
export function photoUrl(url, width, ratio, quality = 75) {
  const height = ratio ? `&h=${Math.round(width * ratio)}` : '';
  return `${url}?w=${width}${height}&q=${quality}&auto=format&fit=crop`;
}

export const srcset = (url, widths, ratio, quality) => widths.map((w) => `${photoUrl(url, w, ratio, quality)} ${w}w`).join(', ');

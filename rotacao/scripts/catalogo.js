// Vai buscar ao iTunes as capas, as faixas e as pré-escutas de 30 s de cada disco da loja
// e grava tudo em src/data/itunes.json. Correr com: npm run catalogo
import { writeFile } from 'node:fs/promises';
import { RECORDS } from '../src/data/records.js';

const OUT = new URL('../src/data/itunes.json', import.meta.url);
const COUNTRY = 'PT';

const artwork = (url) => url.replace(/\/\d+x\d+bb\.jpg$/, '/{size}x{size}bb.jpg');

async function lookup(id) {
  const res = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=song&country=${COUNTRY}&limit=200`);
  if (!res.ok) throw new Error(`iTunes respondeu ${res.status} para ${id}`);
  const { results } = await res.json();
  const album = results.find((r) => r.wrapperType === 'collection');
  if (!album) throw new Error(`Álbum ${id} não encontrado no iTunes ${COUNTRY}`);

  const tracks = results
    .filter((r) => r.wrapperType === 'track' && r.kind === 'song')
    .sort((a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber)
    .map((t) => ({
      disc: t.discNumber,
      number: t.trackNumber,
      title: t.trackName,
      ms: t.trackTimeMillis ?? 0,
      preview: t.previewUrl ?? null,
    }));

  return { artwork: artwork(album.artworkUrl100), appleUrl: album.collectionViewUrl.split('?')[0], tracks };
}

const data = {};
for (const record of RECORDS) {
  data[record.itunesId] = await lookup(record.itunesId);
  console.log(`✓ ${record.artist} — ${record.title} (${data[record.itunesId].tracks.length} faixas)`);
}

await writeFile(OUT, `${JSON.stringify(data, null, 1)}\n`);
console.log(`\n${RECORDS.length} discos gravados em src/data/itunes.json`);

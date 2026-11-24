import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { LIMITS } from '../config/platform.js';
import { documents } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';

const dir = join(env.storageDir, 'documentos');
const examples = fileURLToPath(new URL('../data/exemplos/', import.meta.url));

// O tipo vem dos primeiros bytes do ficheiro, nunca do nome nem do que o browser diz
function sniff(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ['image/jpeg', 'jpg'];
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return ['image/png', 'png'];
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return ['image/webp', 'webp'];
  if (buf.toString('ascii', 0, 5) === '%PDF-') return ['application/pdf', 'pdf'];
  return null;
}

// JPEG: tira os segmentos APP1 (EXIF com GPS, XMP), APP13 (IPTC) e comentários
function stripJpeg(buf) {
  const out = [buf.subarray(0, 2)];
  let i = 2;
  while (i < buf.length - 4) {
    if (buf[i] !== 0xff) break;
    const marker = buf[i + 1];
    if (marker === 0xda) {
      out.push(buf.subarray(i));
      return Buffer.concat(out);
    }
    const length = buf.readUInt16BE(i + 2);
    const drop = marker === 0xe1 || marker === 0xed || marker === 0xfe || (marker >= 0xe2 && marker <= 0xef && marker !== 0xee);
    if (!drop) out.push(buf.subarray(i, i + 2 + length));
    i += 2 + length;
  }
  throw new HttpError(400, 'A imagem JPEG parece estar danificada');
}

// PNG: tira texto, EXIF e data de criação
function stripPng(buf) {
  const DROP = new Set(['tEXt', 'zTXt', 'iTXt', 'eXIf', 'tIME']);
  const out = [buf.subarray(0, 8)];
  let i = 8;
  while (i < buf.length) {
    const length = buf.readUInt32BE(i);
    const type = buf.toString('ascii', i + 4, i + 8);
    const end = i + 12 + length;
    if (!DROP.has(type)) out.push(buf.subarray(i, end));
    i = end;
    if (type === 'IEND') break;
  }
  return Buffer.concat(out);
}

// WebP: tira os blocos EXIF e XMP e acerta os tamanhos do cabeçalho
function stripWebp(buf) {
  const chunks = [];
  let i = 12;
  while (i < buf.length) {
    const type = buf.toString('ascii', i, i + 4);
    const size = buf.readUInt32LE(i + 4);
    const end = i + 8 + size + (size % 2);
    if (type !== 'EXIF' && type !== 'XMP ') chunks.push(Buffer.from(buf.subarray(i, end)));
    i = end;
  }
  const vp8x = chunks.find((c) => c.toString('ascii', 0, 4) === 'VP8X');
  if (vp8x) vp8x[8] &= ~0x0c;
  const body = Buffer.concat(chunks);
  const header = Buffer.alloc(12);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(body.length + 4, 4);
  header.write('WEBP', 8, 'ascii');
  return Buffer.concat([header, body]);
}

export function clean(buf) {
  const type = sniff(buf);
  if (!type) throw new HttpError(415, 'Só aceitamos fotografias (JPG, PNG, WebP) ou PDF');
  const [mime, ext] = type;
  const strip = { 'image/jpeg': stripJpeg, 'image/png': stripPng, 'image/webp': stripWebp }[mime];
  // Nos PDF não conseguimos garantir a remoção de todos os metadados: fica indicado ao utilizador
  return { mime, ext, data: strip ? strip(buf) : buf, metadataRemoved: Boolean(strip) };
}

export async function ensureStorage() {
  await mkdir(dir, { recursive: true });
  const seeded = await documents.findAll((d) => d.file);
  for (const doc of seeded) {
    const storageName = `${doc.id}.png`;
    if (!existsSync(join(dir, storageName))) await copyFile(join(examples, doc.file), join(dir, storageName)).catch(() => {});
    await documents.update(doc.id, { storageName, file: undefined, size: 0 });
  }
}

export async function store({ ownerId, adId, description, shareRequested, file }) {
  const existing = await documents.findAll((d) => d.adId === adId);
  if (existing.length >= LIMITS.documentsPerAd) throw new HttpError(400, `Cada anúncio pode ter no máximo ${LIMITS.documentsPerAd} provas`);

  const { mime, ext, data, metadataRemoved } = clean(file.buffer);
  const id = randomUUID();
  const storageName = `${id}.${ext}`;
  await writeFile(join(dir, storageName), data, { mode: 0o600 });

  return documents.create({
    id,
    ownerId,
    adId,
    description,
    storageName,
    mime,
    size: data.length,
    shareRequested: Boolean(shareRequested),
    publicStatus: shareRequested ? 'pedido' : 'privado',
    verified: false,
    metadataRemoved,
  });
}

export async function read(doc) {
  try {
    return await readFile(join(dir, doc.storageName));
  } catch {
    throw notFound('Prova');
  }
}

export async function removeFile(doc) {
  await rm(join(dir, doc.storageName), { force: true });
  await documents.remove(doc.id);
}

// Envia o ficheiro com cabeçalhos que impedem cache, execução e indexação
export async function send(res, doc) {
  const data = await read(doc);
  res
    .set({
      'Content-Type': doc.mime,
      'Content-Disposition': `inline; filename="prova.${doc.mime.split('/')[1]}"`,
      'Cache-Control': 'private, no-store',
      'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
      'X-Robots-Tag': 'noindex, nofollow',
      'Cross-Origin-Resource-Policy': 'same-origin',
    })
    .send(data);
}

export const summary = (doc) => ({
  id: doc.id,
  adId: doc.adId,
  description: doc.description,
  mime: doc.mime,
  size: doc.size,
  shareRequested: doc.shareRequested,
  publicStatus: doc.publicStatus,
  verified: doc.verified,
  metadataRemoved: doc.metadataRemoved,
  createdAt: doc.createdAt,
});

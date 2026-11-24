import { REPORT_REASONS } from '../config/platform.js';
import { ads, reports } from '../repositories/index.js';
import { HttpError, notFound } from '../utils/httpError.js';

export async function create({ adId, reason, details }, reporterId = null) {
  const ad = await ads.findById(adId);
  if (!ad || !['ativo', 'concluido'].includes(ad.status)) throw notFound('Anúncio');
  return reports.create({
    adId,
    reporterId,
    reason,
    details: details ?? '',
    status: 'pendente',
    // Dados pessoais expostos passam à frente de tudo
    priority: reason === 'dados_pessoais' ? 'alta' : 'normal',
  });
}

export async function list(status = 'pendente') {
  const list = await reports.findAll((r) => status === 'todas' || r.status === status);
  const withAd = await Promise.all(
    list.map(async (r) => {
      const ad = await ads.findById(r.adId);
      return { ...r, reporterId: undefined, reasonLabel: REPORT_REASONS.find(([v]) => v === r.reason)?.[1], ad: ad && { id: ad.id, title: ad.title, slug: ad.slug, status: ad.status, story: ad.story } };
    }),
  );
  return withAd.sort((a, b) => (a.priority === b.priority ? a.createdAt.localeCompare(b.createdAt) : a.priority === 'alta' ? -1 : 1));
}

export async function resolve(id, staffMember, { resolution, note }) {
  const report = await reports.findById(id);
  if (!report) throw notFound('Denúncia');
  if (report.status !== 'pendente') throw new HttpError(400, 'Esta denúncia já foi tratada');
  return reports.update(id, { status: 'resolvida', resolution, note: note ?? '', resolvedBy: staffMember.name, resolvedAt: new Date().toISOString() });
}

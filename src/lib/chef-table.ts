import { getChefTable, formatDate, tr, type Lang } from '../i18n';

const base = getChefTable('sr');
export type ChefTableDate = (typeof base.dates)[number];

export { formatDate };

/** Upcoming dates at build time, sorted. The page also hides past dates client-side. */
export function upcomingDates(lang: Lang = 'sr', today = new Date()) {
  const todayIso = today.toISOString().slice(0, 10);
  return [...getChefTable(lang).dates].filter((d) => d.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date));
}

export function nextAvailable(lang: Lang = 'sr') {
  return upcomingDates(lang).find((d) => d.seatsLeft > 0);
}

export function dateLabel(d: ChefTableDate, lang: Lang = 'sr') {
  return `${formatDate(d.date, lang)} · ${d.theme}${d.guest ? ` ${d.guest}` : ''}`;
}

export const seatsLeftLabel = (n: number, lang: Lang) =>
  n <= 0 ? tr(lang, 'Popunjeno', 'Fully booked') : tr(lang, `Još ${n} mesta`, `${n} seats left`);

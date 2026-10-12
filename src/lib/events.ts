import { getChefTable, formatDate, route, tr, type Lang } from '../i18n';
import { getEvents } from '../i18n/content';
import { seatsLeftLabel } from './chef-table';

const TYPES = {
  vinyl: { sr: 'Vinyl & Dine', en: 'Vinyl & Dine' },
  'chef-table': { sr: "Chef's Table", en: "Chef's Table" },
  wine: { sr: 'Vinske večeri', en: 'Wine evenings' },
  cocktail: { sr: 'Koktel večeri', en: 'Cocktail evenings' },
  'guest-chef': { sr: 'Gostujući šefovi', en: 'Guest chefs' },
  other: { sr: 'Ostalo', en: 'Other' },
} as const;

export type EventType = keyof typeof TYPES;

export const eventTypes = (lang: Lang) =>
  Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [k, v[lang]])) as Record<EventType, string>;

/** One shape for archive cards — real events plus Chef's Table dates. */
export interface EventItem {
  key: string;
  href: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  excerpt: string;
  image?: string;
  price?: string;
  seatsLeft?: number;
}

export { formatDate };

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const isPast = (date: string) => date < todayIso();

/** All events (incl. Chef's Table dates), split into upcoming (soonest first) and past (latest first). */
export async function getEventItems(lang: Lang = 'sr') {
  const events = (await getEvents(lang)).map(
    (e): EventItem => ({
      key: e.ref,
      href: e.href,
      title: e.data.title,
      type: e.data.type,
      date: e.data.date,
      time: e.data.time,
      excerpt: e.data.excerpt,
      image: e.data.image,
      price: e.data.price,
      seatsLeft: e.data.seatsLeft,
    }),
  );
  const chef = getChefTable(lang).dates.map(
    (d): EventItem => ({
      key: `chef-table-${d.date}`,
      href: `${route('chefsTable', lang)}#${tr(lang, 'termini', 'dates')}`,
      title: `Chef's Table${d.guest ? ` ${d.guest}` : ''}`,
      type: 'chef-table',
      date: d.date,
      time: d.time,
      excerpt: d.theme,
      price: d.price,
      seatsLeft: d.seatsLeft,
    }),
  );
  const items = [...events, ...chef];
  const upcoming = items.filter((i) => !isPast(i.date)).sort((a, b) => a.date.localeCompare(b.date));
  const past = items.filter((i) => isPast(i.date)).sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, past };
}

export function seatsLabel(seatsLeft: number | undefined, lang: Lang = 'sr') {
  if (seatsLeft === undefined) return '';
  return seatsLeftLabel(seatsLeft, lang);
}

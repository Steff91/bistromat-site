import { getCollection, type CollectionEntry } from 'astro:content';
import { chefTable, formatDate } from './chef-table';

export const EVENT_TYPES = {
  vinyl: 'Vinyl & Dine',
  'chef-table': "Chef's Table",
  wine: 'Vinske večeri',
  cocktail: 'Koktel večeri',
  'guest-chef': 'Gostujući šefovi',
  other: 'Ostalo',
} as const;

export type EventType = keyof typeof EVENT_TYPES;

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

export async function getEventEntries() {
  return (await getCollection('events')).sort((a, b) => a.data.date.localeCompare(b.data.date));
}

const fromEntry = (e: CollectionEntry<'events'>): EventItem => ({
  key: e.id,
  href: `/dogadjaji/${e.id}/`,
  title: e.data.title,
  type: e.data.type,
  date: e.data.date,
  time: e.data.time,
  excerpt: e.data.excerpt,
  image: e.data.image,
  price: e.data.price,
  seatsLeft: e.data.seatsLeft,
});

const fromChefTable = (d: (typeof chefTable.dates)[number]): EventItem => ({
  key: `chef-table-${d.date}`,
  href: '/chefs-table/#termini',
  title: `Chef's Table${d.guest ? ` ${d.guest}` : ''}`,
  type: 'chef-table',
  date: d.date,
  time: d.time,
  excerpt: d.theme,
  price: d.price,
  seatsLeft: d.seatsLeft,
});

/** All events (incl. Chef's Table dates), split into upcoming (soonest first) and past (latest first). */
export async function getEventItems() {
  const items = [...(await getCollection('events')).map(fromEntry), ...chefTable.dates.map(fromChefTable)];
  const upcoming = items.filter((i) => !isPast(i.date)).sort((a, b) => a.date.localeCompare(b.date));
  const past = items.filter((i) => isPast(i.date)).sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, past };
}

export function seatsLabel(seatsLeft?: number) {
  if (seatsLeft === undefined) return '';
  return seatsLeft <= 0 ? 'Popunjeno' : `Još ${seatsLeft} mesta`;
}

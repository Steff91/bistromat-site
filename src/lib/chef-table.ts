import data from '../data/chef-table.json';

export type ChefTableDate = (typeof data.dates)[number];

const dateFmt = new Intl.DateTimeFormat('sr-Latn-RS', { weekday: 'long', day: 'numeric', month: 'long' });

/** "subota, 24. oktobar" → "Subota, 24. oktobar" */
export function formatDate(iso: string) {
  const s = dateFmt.format(new Date(`${iso}T12:00:00`));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Upcoming dates at build time, sorted. The page also hides past dates client-side. */
export function upcomingDates(today = new Date()) {
  const todayIso = today.toISOString().slice(0, 10);
  return [...data.dates].filter((d) => d.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date));
}

export function nextAvailable() {
  return upcomingDates().find((d) => d.seatsLeft > 0);
}

export function dateLabel(d: ChefTableDate) {
  return `${formatDate(d.date)} · ${d.theme}${d.guest ? ` ${d.guest}` : ''}`;
}

export { data as chefTable };

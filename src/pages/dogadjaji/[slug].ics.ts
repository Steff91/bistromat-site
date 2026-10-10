import type { APIRoute, GetStaticPaths } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getEventEntries } from '../../lib/events';
import info from '../../data/info.json';

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await getEventEntries();
  return entries.map((e) => ({ params: { slug: e.id }, props: { event: e } }));
};

const stamp = (date: string, time: string) => `${date.replaceAll('-', '')}T${time.replace(':', '')}00`;

/** End time defaults to start + 3h (same day). */
function endOf(date: string, time: string, endTime?: string) {
  if (endTime && endTime > time) return stamp(date, endTime);
  if (endTime) {
    // ends after midnight
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + 1);
    return stamp(next.toISOString().slice(0, 10), endTime);
  }
  const [h, m] = time.split(':').map(Number);
  const end = `${String(Math.min(h + 3, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return stamp(date, end);
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

export const GET: APIRoute = ({ props, site }) => {
  const { data, id } = props.event as CollectionEntry<'events'>;
  const url = new URL(`/dogadjaji/${id}/`, site).toString();
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bistromat//Dogadjaji//SR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${id}@bistromat`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=Europe/Belgrade:${stamp(data.date, data.time)}`,
    `DTEND;TZID=Europe/Belgrade:${endOf(data.date, data.time, data.endTime)}`,
    `SUMMARY:${esc(`${data.title} — ${info.name}`)}`,
    `DESCRIPTION:${esc(`${data.excerpt}\n\n${url}`)}`,
    `LOCATION:${esc(`${info.name}, ${info.address}, ${info.city}`)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(ics, {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};

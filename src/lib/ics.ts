import type { CollectionEntry } from 'astro:content';
import { getInfo, type Lang } from '../i18n';
import type { Localized } from '../i18n/content';

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

/** iCalendar file for one event ("Add to calendar"). */
export function eventIcs(event: Localized<CollectionEntry<'events'>['data']>, lang: Lang, site: URL | undefined) {
  const info = getInfo(lang);
  const { data } = event;
  const url = new URL(event.href, site).toString();
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Bistromat//Events//${lang.toUpperCase()}`,
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.ref}@bistromat`,
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

  return new Response(ics, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}

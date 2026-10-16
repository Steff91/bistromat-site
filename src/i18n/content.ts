// Localized content collections. Serbian entries are the source; English entries
// (src/content/en/…) override translated fields and set the English URL slug.
// A Serbian entry without a translation still appears on the English site (in Serbian),
// under its Serbian slug, so nothing goes missing when only one language is edited.
import { getCollection, type CollectionEntry } from 'astro:content';
import { merge, servicesBase, eventsBase, type Lang } from './index';
import { FEATURES } from '../config';

type ServiceData = CollectionEntry<'services'>['data'];
type EventData = CollectionEntry<'events'>['data'];

export interface Localized<D> {
  /** URL slug in this language */
  slug: string;
  /** Serbian id — shared key across languages */
  ref: string;
  href: string;
  data: D;
  /** Entry whose Markdown body to render */
  bodyEntry: CollectionEntry<'services'> | CollectionEntry<'events'> | CollectionEntry<'servicesEn'> | CollectionEntry<'eventsEn'>;
  /** Hrefs of this item in both languages (for the language switcher) */
  alternates: Record<Lang, string>;
}

const strip = (d: Record<string, unknown>) => {
  const { ref: _ref, ...rest } = d;
  return rest;
};

async function localize<D>(
  srName: 'services' | 'events',
  enName: 'servicesEn' | 'eventsEn',
  base: (l: Lang) => string,
  lang: Lang,
): Promise<Localized<D>[]> {
  const sr = await getCollection(srName);
  const en = await getCollection(enName);
  const enByRef = new Map(en.map((e) => [e.data.ref as string, e]));

  return sr.map((s) => {
    const t = enByRef.get(s.id);
    const enSlug = t?.id ?? s.id;
    const alternates = { sr: `${base('sr')}${s.id}/`, en: `${base('en')}${enSlug}/` };
    if (lang === 'sr' || !t) {
      return {
        slug: lang === 'sr' ? s.id : enSlug,
        ref: s.id,
        href: alternates[lang],
        data: s.data as D,
        bodyEntry: s,
        alternates,
      };
    }
    return {
      slug: enSlug,
      ref: s.id,
      href: alternates.en,
      data: merge(s.data, strip(t.data as Record<string, unknown>)) as D,
      bodyEntry: t.body?.trim() ? t : s,
      alternates,
    };
  });
}

export async function getServices(lang: Lang) {
  if (!FEATURES.services) return [] as Localized<ServiceData>[];
  const list = await localize<ServiceData>('services', 'servicesEn', servicesBase, lang);
  return list.sort((a, b) => a.data.order - b.data.order);
}

export async function getEvents(lang: Lang) {
  const list = await localize<EventData>('events', 'eventsEn', eventsBase, lang);
  return list.sort((a, b) => a.data.date.localeCompare(b.data.date));
}

/** Href of a service by its Serbian id, e.g. serviceHref('privatne-proslave', 'en') */
export async function serviceHref(ref: string, lang: Lang) {
  const s = (await getServices(lang)).find((x) => x.ref === ref);
  return s?.href ?? `${servicesBase(lang)}${ref}/`;
}

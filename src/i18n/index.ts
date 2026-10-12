// Languages: Serbian (default, no prefix) and English (/en/…).
import infoSr from '../data/info.json';
import infoEn from '../data/en/info.json';
import menuSr from '../data/menu.json';
import menuEn from '../data/en/menu.json';
import chefSr from '../data/chef-table.json';
import chefEn from '../data/en/chef-table.json';
import resSr from '../data/reservations.json';
import resEn from '../data/en/reservations.json';

export type Lang = 'sr' | 'en';
export const LANGS: Lang[] = ['sr', 'en'];

export const getLang = (url: URL): Lang =>
  url.pathname === '/en' || url.pathname.startsWith('/en/') ? 'en' : 'sr';

/** Pick the string for the current language: tr(lang, 'Meni', 'Menu') */
export const tr = (lang: Lang, sr: string, en: string) => (lang === 'en' ? en : sr);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export const ROUTES = {
  home: { sr: '/', en: '/en/' },
  menu: { sr: '/meni/', en: '/en/menu/' },
  chefsTable: { sr: '/chefs-table/', en: '/en/chefs-table/' },
  events: { sr: '/dogadjaji/', en: '/en/events/' },
  contact: { sr: '/kontakt/', en: '/en/contact/' },
  reservations: { sr: '/rezervacije/', en: '/en/reservations/' },
  thanks: { sr: '/hvala/', en: '/en/thank-you/' },
  privacy: { sr: '/privatnost/', en: '/en/privacy/' },
  cookies: { sr: '/kolacici/', en: '/en/cookies/' },
  imprint: { sr: '/impresum/', en: '/en/imprint/' },
} as const;

export type RouteKey = keyof typeof ROUTES;

export const route = (key: RouteKey, lang: Lang) => ROUTES[key][lang];

/** Legal page ids (Serbian file names) → route key */
export const LEGAL_ROUTE: Record<string, RouteKey> = {
  privatnost: 'privacy',
  kolacici: 'cookies',
  impresum: 'imprint',
};

/** Prefix for service and event detail pages */
export const servicesBase = (lang: Lang) => (lang === 'en' ? '/en/services/' : '/usluge/');
export const eventsBase = (lang: Lang) => (lang === 'en' ? '/en/events/' : '/dogadjaji/');

/** The same static page in the other language, if the path is a known route. */
export function staticAlternates(pathname: string): Record<Lang, string> | null {
  const p = pathname.endsWith('/') ? pathname : `${pathname}/`;
  for (const r of Object.values(ROUTES)) {
    if (r.sr === p || r.en === p) return { sr: r.sr, en: r.en };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Localized data: English files hold only the translated fields and are merged
// over the Serbian ones (arrays merge item by item), so numbers, dates, links
// and seat counts are kept in one place.
// ---------------------------------------------------------------------------

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

export function merge<T>(base: T, over: unknown): T {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base) && Array.isArray(over)) {
    return over.map((item, i) => merge(base[i], item)) as T;
  }
  if (isObj(base) && isObj(over)) {
    const out: Obj = { ...base };
    for (const [k, v] of Object.entries(over)) out[k] = merge((base as Obj)[k], v);
    return out as T;
  }
  return over as T;
}

const pick = <T>(sr: T, en: unknown) => (lang: Lang): T => (lang === 'en' ? merge(sr, en) : sr);

export const getInfo = pick(infoSr, infoEn);
export const getMenu = pick(menuSr, menuEn);
export const getChefTable = pick(chefSr, chefEn);
export const getReservations = pick(resSr, resEn);

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

const fmt = {
  sr: new Intl.DateTimeFormat('sr-Latn-RS', { weekday: 'long', day: 'numeric', month: 'long' }),
  en: new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
};

/** "Subota, 24. oktobar" / "Saturday, 24 October" */
export function formatDate(iso: string, lang: Lang = 'sr') {
  const s = fmt[lang].format(new Date(`${iso}T12:00:00`));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "19:00h" in Serbian, "19:00" in English */
export const timeLabel = (time: string, lang: Lang) => (lang === 'en' ? time : `${time}h`);

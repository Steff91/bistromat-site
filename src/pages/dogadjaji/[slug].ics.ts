import type { APIRoute, GetStaticPaths } from 'astro';
import { getEvents } from '../../i18n/content';
import { FEATURES } from '../../config';
import { eventIcs } from '../../lib/ics';

export const getStaticPaths: GetStaticPaths = async () =>
  !FEATURES.events ? [] : (await getEvents('sr')).map((e) => ({ params: { slug: e.slug }, props: { event: e } }));

export const GET: APIRoute = ({ props, site }) => eventIcs(props.event, 'sr', site);

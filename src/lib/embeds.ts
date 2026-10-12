import { getInfo, tr, type Lang } from '../i18n';

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Google Maps iframe HTML for ConsentEmbed (empty string when no embed URL is set). */
export const mapIframe = (height = 360, lang: Lang = 'sr') => {
  const info = getInfo(lang);
  const src = lang === 'en' ? info.mapsEmbed.replace('output=embed', 'hl=en&output=embed') : info.mapsEmbed;
  return info.mapsEmbed
    ? `<iframe src="${attr(src)}" title="${tr(lang, 'Bistromat na mapi', 'Bistromat on the map')}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="height:${height}px;filter:grayscale(1)"></iframe>`
    : '';
};

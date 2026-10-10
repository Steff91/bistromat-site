import info from '../data/info.json';

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Google Maps iframe HTML for ConsentEmbed (empty string when no embed URL is set). */
export const mapIframe = (height = 360) =>
  info.mapsEmbed
    ? `<iframe src="${attr(info.mapsEmbed)}" title="Bistromat na mapi" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="height:${height}px;filter:grayscale(1)"></iframe>`
    : '';

# bistromat-site

Website for Bistromat, a French open-kitchen restaurant in Belgrade. Astro + Tailwind, Sveltia CMS, deployed via GitHub Actions.

## Stack

- **Astro 7** (static output) + **Tailwind CSS 4** (`@tailwindcss/vite`)
- **IBM Plex Mono** (headings, UI) + **IBM Plex Sans** (body copy), self-hosted via Fontsource
- **Sveltia CMS** at `/admin` (Git-based, edits commit straight to `main`)
- **GitHub Actions** → build → `rsync` to own server

Requires Node `>=22.12`.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # → dist/
npm run preview
```

## Structure

```
src/
  data/info.json            # address, phone, hours, socials, Google rating, embeds, menu PDF
  content/
    services/*.md           # one file per service → /usluge/<file-name>/
    events.json             # upcoming events
    reviews.json            # curated Google reviews
  content.config.ts         # collection schemas
  components/
    sections/               # homepage sections (Hero, Services, Reviews, …)
    Header, Footer, Icon (Font Awesome SVG), Placeholder, InquiryForm, …
  layouts/Base.astro        # <head>, Restaurant JSON-LD, reveal-on-scroll script
  pages/
    index.astro
    usluge/[slug].astro     # shared template for all service pages
public/
  admin/                    # Sveltia CMS
  uploads/                  # CMS media (menu PDF, photos)
```

## Content editing

- Text in `[BRACKETS]` is placeholder content to replace.
- Images: pass `src` to `Placeholder` (or set `image` in the CMS); until then a labelled box is rendered.
- Menu: upload the PDF in CMS → *Podešavanja → Meni (PDF)*. The homepage keeps 3 highlighted dishes in HTML for SEO.
- Google Maps: paste the iframe `src` into `info.json → mapsEmbed` (no API key needed).
- Reservations: paste the provider's embed code into `info.json → reservationEmbed`.
- Inquiry form: set `info.json → formAction` to a form handler endpoint (e.g. Formspree).

## Deploy

Push to `main` runs `.github/workflows/deploy.yml`. Add repository secrets:

| Secret        | Value                                        |
|---------------|----------------------------------------------|
| `SSH_HOST`    | server hostname / IP                          |
| `SSH_USER`    | deploy user (write access to the web root only) |
| `SSH_KEY`     | private key of a dedicated deploy key pair    |
| `REMOTE_PATH` | web root, e.g. `/var/www/bistromat/`          |

Without `SSH_HOST` the workflow only builds (useful as a CI check).

## TODO

- [ ] Real photos, copy, prices, hours, Facebook / Google profile URLs
- [ ] Menu flipbook modal (PDF.js + StPageFlip), `[data-menu-flipbook]` button is the hook
- [ ] Form handler (`formAction`) and success/error states
- [ ] Privacy & cookie pages (`/privatnost/`, `/kolacici/`)
- [ ] Verify Sveltia GitHub login method and root-list support for `events.json` / `reviews.json`
- [ ] Set production domain in `astro.config.mjs` (`site`)

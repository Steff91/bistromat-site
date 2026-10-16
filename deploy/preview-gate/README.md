# Preview gate ("Coming soon" + password)

Copy these files into the web root **next to** the built site (`dist/`) to hide the site
behind a branded "Coming soon" page. Requires Apache with `mod_rewrite` and PHP 8.

- `.htaccess` — sends every request without the access cookie to `gate.php`; noindex header
- `gate.php` — SR/EN page with a password form; on success sets a 30-day cookie
- `gate-assets/` — fonts and logo for the gate page

Change the password: `php -r 'echo hash("sha256", "new-password");'` → `PASSWORD_SHA256` in `gate.php`.
Log everyone out: put a new random value in `ACCESS_TOKEN` (gate.php) **and** in `.htaccess`.
Go live: delete `gate.php` and `gate-assets/` and upload the built site; its `.htaccess` (from `public/`) replaces the gate one.

Not used by the GitHub deploy (rsync --delete would remove these files).

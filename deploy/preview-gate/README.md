# Preview gate ("Coming soon" + password)

The gate ships with the site but is **off**. Files: `public/gate.php`, `public/gate-assets/`,
and a commented block in `public/.htaccess`. Requires Apache with `mod_rewrite` and PHP 7+.

- Turn ON: in `.htaccess` on the server (or in `public/.htaccess` before a build) remove the `#`
  from the 7 lines in the "COMING SOON" block.
- Turn OFF: put the `#` back.
- Change the password: `php -r "echo hash('sha256', 'new-password');"` → `PASSWORD_SHA256` in `gate.php`.
- Log everyone out: new random value in `ACCESS_TOKEN` (gate.php) **and** on the cookie line in `.htaccess`.

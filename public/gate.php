<?php
// Bistromat — "Coming soon" page with a preview password.
// The password is stored only as a SHA-256 hash. To change it:
//   php -r 'echo hash("sha256", "new-password");'
// and paste the result below. The cookie token must match the one in .htaccess.

const PASSWORD_SHA256 = '5fee40886323d7c3347f1b619b3f05e810d47cfe25f32973a2d78ae46bdbf598';
const ACCESS_TOKEN    = '203abd1f175fa5a73f9183848388bf2659e3a9cb2574678b';
const COOKIE_NAME     = 'bm_preview';
const COOKIE_DAYS     = 30;

// PHP 7.x compatibility
if (!function_exists('str_starts_with')) {
  function str_starts_with($h, $n) { return strncmp($h, $n, strlen($n)) === 0; }
}

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
  || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

// Where to go after login: the page originally requested (same site only)
$target = $_POST['to'] ?? ($_SERVER['REQUEST_URI'] ?? '/');
if (!is_string($target) || $target === '' || $target[0] !== '/' || str_starts_with($target, '//') || str_starts_with($target, '/gate.php')) {
  $target = '/';
}

$error = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $given = (string)($_POST['password'] ?? '');
  if (hash_equals(PASSWORD_SHA256, hash('sha256', $given))) {
    // Plain header instead of setcookie() options array: works on every PHP version
    header(sprintf(
      'Set-Cookie: %s=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=Lax%s',
      COOKIE_NAME, ACCESS_TOKEN, COOKIE_DAYS * 86400, $https ? '; Secure' : ''
    ), false);
    header('Location: ' . $target, true, 303);
    exit;
  }
  $error = true;
  usleep(400000); // slow down guessing
}

$en = str_starts_with($target, '/en/');
$t = $en ? [
  'lang' => 'en',
  'title' => 'Coming soon — Bistromat',
  'eyebrow' => 'Open Kitchen Concept · Vračar, by the Temple of Saint Sava',
  'h1a' => 'A new website',
  'h1b' => 'is on its way.',
  'lead' => 'In the meantime, book a table by phone or follow us on Instagram.',
  'label' => 'Preview password',
  'button' => 'Enter',
  'error' => 'Wrong password. Please try again.',
  'switch' => 'Srpski',
  'switchTo' => '/',
] : [
  'lang' => 'sr-Latn',
  'title' => 'Uskoro — Bistromat',
  'eyebrow' => 'Open Kitchen Concept · Vračar, kod Hrama Svetog Save',
  'h1a' => 'Novi sajt',
  'h1b' => 'stiže uskoro.',
  'lead' => 'Do tada, sto rezervišite telefonom ili nas pratite na Instagramu.',
  'label' => 'Lozinka za pregled',
  'button' => 'Uđi',
  'error' => 'Pogrešna lozinka. Pokušajte ponovo.',
  'switch' => 'English',
  'switchTo' => '/en/',
];
$h = function ($s) { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); };
?><!doctype html>
<html lang="<?= $t['lang'] ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0F0F0F">
<title><?= $h($t['title']) ?></title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=3">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<style>
  @font-face { font-family: 'Plex Mono'; src: url('/gate-assets/plex-mono-400.woff2') format('woff2'); font-weight: 400; font-display: swap; }
  @font-face { font-family: 'Plex Mono'; src: url('/gate-assets/plex-mono-500.woff2') format('woff2'); font-weight: 500; font-display: swap; }
  @font-face { font-family: 'Plex Mono'; src: url('/gate-assets/plex-mono-400-italic.woff2') format('woff2'); font-weight: 400; font-style: italic; font-display: swap; }
  :root { --ink: #0F0F0F; --paper: #F2EFEA; --gold: #D4AF6A; --gold-light: #F0D49A; --muted: #C9C4BC; --dim: #9A958D; --line: #2A2A2A; }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0; background: var(--ink); color: var(--paper);
    font: 400 16px/1.65 'Plex Mono', ui-monospace, monospace;
    -webkit-font-smoothing: antialiased;
    display: flex; flex-direction: column;
  }
  a { color: var(--gold); text-decoration: none; transition: color .2s; }
  a:hover { color: var(--gold-light); }
  header, footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; max-width: 1240px; width: 100%; margin: 0 auto; }
  header { border-bottom: 1px solid var(--line); max-width: none; }
  .logo { display: flex; align-items: center; gap: 14px; }
  .logo img:first-child { width: 44px; height: 44px; }
  .logo img:last-child { height: 30px; width: auto; }
  .lang { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
  main { flex: 1; display: flex; align-items: center; width: 100%; max-width: 1240px; margin: 0 auto; padding: 64px 24px; }
  .wrap { max-width: 620px; }
  .eyebrow { margin: 0 0 20px; font-size: 14px; letter-spacing: .16em; text-transform: uppercase; color: var(--gold); }
  h1 { margin: 0; font-weight: 500; line-height: 1.1; letter-spacing: -.02em; font-size: clamp(34px, 6vw, 64px); }
  h1 em { font-weight: 400; }
  .lead { margin: 28px 0 0; max-width: 480px; font-family: system-ui, sans-serif; color: var(--muted); }
  .contact { margin: 18px 0 0; display: flex; flex-wrap: wrap; gap: 8px 28px; font-size: 15px; }
  .contact a { color: var(--paper); }
  .contact a:hover { color: var(--gold); }
  form { margin-top: 48px; padding-top: 28px; border-top: 1px solid var(--line); }
  label { display: block; margin-bottom: 10px; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); }
  .row { display: flex; flex-wrap: wrap; gap: 12px; }
  input {
    flex: 1 1 220px; min-width: 0; padding: 14px; border: 1px solid #3A3A3A; border-radius: 6px;
    background: #161616; color: var(--paper); font: 400 16px system-ui, sans-serif;
  }
  input:focus { outline: none; border-color: var(--gold); }
  button {
    padding: 14px 26px; border: 0; border-radius: 6px; background: var(--gold); color: var(--ink); cursor: pointer;
    font: 600 14px 'Plex Mono', monospace; letter-spacing: .04em; text-transform: uppercase;
    transition: transform .2s, background-color .2s;
  }
  button:hover { background: var(--gold-light); transform: translateY(-2px); }
  .error { margin: 12px 0 0; color: #E38B6F; font-size: 14px; font-family: system-ui, sans-serif; }
  footer { font-size: 13px; color: var(--dim); border-top: 1px solid var(--line); max-width: none; }
  @media (max-width: 520px) { .logo img:last-child { display: none; } }
  @media (prefers-reduced-motion: reduce) { button, a { transition: none; } button:hover { transform: none; } }
</style>
</head>
<body>
  <header>
    <a class="logo" href="<?= $en ? '/en/' : '/' ?>" aria-label="Bistromat">
      <img src="/gate-assets/bistromat-icon-white.svg" alt="">
      <img src="/gate-assets/bistromat-wordmark-white.svg" alt="Bistromat">
    </a>
    <a class="lang" href="<?= $h($t['switchTo']) ?>"><?= $h($t['switch']) ?></a>
  </header>

  <main>
    <div class="wrap">
      <p class="eyebrow"><?= $h($t['eyebrow']) ?></p>
      <h1><?= $h($t['h1a']) ?><br><em><?= $h($t['h1b']) ?></em></h1>
      <p class="lead"><?= $h($t['lead']) ?></p>
      <p class="contact">
        <a href="tel:+38163417063">063 417 063</a>
        <a href="https://www.instagram.com/bistromat_/" target="_blank" rel="noopener">@bistromat_</a>
        <span style="color:var(--dim)">Mutapova 9, <?= $en ? 'Belgrade' : 'Beograd' ?></span>
      </p>

      <form method="post" action="/gate.php">
        <input type="hidden" name="to" value="<?= $h($target) ?>">
        <label for="pw"><?= $h($t['label']) ?></label>
        <div class="row">
          <input id="pw" name="password" type="password" autocomplete="current-password" required <?= $error ? 'autofocus aria-invalid="true" aria-describedby="err"' : '' ?>>
          <button type="submit"><?= $h($t['button']) ?></button>
        </div>
        <?php if ($error): ?><p class="error" id="err" role="alert"><?= $h($t['error']) ?></p><?php endif; ?>
      </form>
    </div>
  </main>

  <footer>
    <span>© <?= date('Y') ?> Bistromat</span>
    <span>office@bistromat.rs</span>
  </footer>
</body>
</html>

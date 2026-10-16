<?php
/**
 * Bistromat — form handler (all site forms post here).
 * Sends the submitted fields as a plain-text email, then redirects to the thank-you page.
 *
 * Recipient: set FORM_TO in form-config.php next to this file (not in the repo), e.g.
 *   <?php const FORM_TO = 'office@bistromat.rs';
 * Several addresses: 'a@x.rs, b@y.rs'. Without form-config.php mail goes to office@bistromat.rs.
 * Optional in form-config.php: const FORM_FROM = 'sajt@bistromat.rs'; (an address on this domain)
 */

if (is_file(__DIR__ . '/form-config.php')) require __DIR__ . '/form-config.php';
if (!defined('FORM_TO')) define('FORM_TO', 'office@bistromat.rs');

date_default_timezone_set('Europe/Belgrade');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: /', true, 303);
    exit;
}

$host = preg_replace('/[^a-z0-9.\-]/i', '', explode(':', $_SERVER['HTTP_HOST'] ?? 'bistromat.rs')[0]);
$host = preg_replace('/^www\./i', '', $host);
$lang = (($_POST['jezik'] ?? '') === 'en') ? 'en' : 'sr';

// Thank-you page: only a path on this site is accepted (no open redirect).
$redirect = $lang === 'en' ? '/en/thank-you/' : '/hvala/';
if (!empty($_POST['redirect'])) {
    $u = parse_url((string) $_POST['redirect']);
    if (!empty($u['path']) && $u['path'][0] === '/' && strpos($u['path'], '//') === false) {
        $redirect = $u['path'] . (isset($u['query']) ? '?' . $u['query'] : '');
    }
}

// Spam trap: real visitors never fill the hidden "website" field. Pretend success.
if (!empty($_POST['website'])) {
    header('Location: ' . $redirect, true, 303);
    exit;
}

function clean($v): string {
    if (is_array($v)) $v = implode(', ', $v);
    $v = trim(str_replace("\0", '', (string) $v));
    return mb_substr($v, 0, 5000);
}
function oneline(string $v): string {
    return trim(preg_replace('/[\r\n]+/', ' ', $v));
}

$labels = [
    'usluga' => 'Forma', 'tema' => 'Tema', 'ime' => 'Ime i prezime', 'email' => 'Email', 'telefon' => 'Telefon',
    'datum' => 'Datum', 'vreme' => 'Vreme', 'termin' => 'Termin', 'osobe' => 'Broj osoba', 'gosti' => 'Broj gostiju',
    'trajanje' => 'Trajanje', 'vrsta' => 'Vrsta', 'paket' => 'Paket', 'adresa' => 'Adresa', 'radionica' => 'Radionica',
    'ucesnici' => 'Broj učesnika', 'privatni_termin' => 'Privatni termin', 'vaucer' => 'Vaučer', 'kolicina' => 'Količina',
    'primalac' => 'Primalac', 'posveta' => 'Posveta', 'napomena' => 'Napomena', 'poruka' => 'Poruka',
];
$skip = ['redirect', 'website', 'jezik'];

$fields = [];
foreach ($_POST as $k => $v) {
    if (in_array($k, $skip, true)) continue;
    $v = clean($v);
    if ($v === '') continue;
    $fields[$labels[$k] ?? ucfirst(str_replace('_', ' ', (string) $k))] = $v;
}

$email = filter_var(oneline(clean($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL) ?: '';
$name = oneline(clean($_POST['ime'] ?? ''));
$form = oneline(clean($_POST['usluga'] ?? 'Kontakt'));
$topic = oneline(clean($_POST['tema'] ?? ''));

// Something to send at all? (empty or bot posts get the thank-you page without an email)
$hasContent = $email !== '' || !empty($_POST['telefon']) || !empty($_POST['poruka']);
if (!$hasContent) {
    header('Location: ' . $redirect, true, 303);
    exit;
}

$body = '';
foreach ($fields as $label => $value) {
    $body .= strpos($value, "\n") !== false ? "\n{$label}:\n{$value}\n\n" : "{$label}: {$value}\n";
}
$body .= "\n—\nJezik sajta: " . strtoupper($lang)
       . "\nPoslato: " . date('d.m.Y. H:i')
       . "\nSa stranice: " . oneline(clean($_SERVER['HTTP_REFERER'] ?? ''))
       . "\nIP: " . ($_SERVER['REMOTE_ADDR'] ?? '') . "\n";
if ($email) $body .= "\nOdgovorite direktno na ovaj mejl — odgovor ide gostu ({$email}).\n";

$subject = 'Sajt: ' . ($topic ?: $form) . ($name ? ' — ' . $name : '');
$from = defined('FORM_FROM') ? FORM_FROM : 'noreply@' . $host;

$enc = fn(string $s) => '=?UTF-8?B?' . base64_encode($s) . '?=';
$headers = [
    'From: ' . $enc('Bistromat sajt') . ' <' . $from . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: Bistromat',
];
if ($email) $headers[] = 'Reply-To: ' . ($name ? $enc($name) . ' ' : '') . '<' . $email . '>';

$ok = @mail(FORM_TO, $enc($subject), $body, implode("\r\n", $headers), '-f' . $from);

if ($ok) {
    header('Location: ' . $redirect, true, 303);
    exit;
}

http_response_code(500);
$t = $lang === 'en'
    ? ['Message not sent', 'Sorry, your message could not be sent. Please call us on', 'Back']
    : ['Poruka nije poslata', 'Izvinite, poruka trenutno ne može da se pošalje. Pozovite nas na', 'Nazad'];
?><!doctype html>
<html lang="<?= $lang === 'en' ? 'en' : 'sr-Latn' ?>">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title><?= $t[0] ?> — Bistromat</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0F0F0F;color:#F2EEE8;font:17px/1.6 system-ui,sans-serif;padding:24px}main{max-width:440px;text-align:center}a{color:#C9A46A}</style></head>
<body><main><h1><?= $t[0] ?></h1><p><?= $t[1] ?> <a href="tel:+38163417063">063 417 063</a>.</p><p><a href="javascript:history.back()"><?= $t[2] ?></a></p></main></body>
</html>

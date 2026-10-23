const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = __dirname;
let pass = 0;
let fail = 0;

function check(label, condition) {
  if (condition) {
    pass++;
    console.log(`  [PASS] ${label}`);
  } else {
    fail++;
    console.log(`  [FAIL] ${label}`);
  }
}

function fileExists(name) {
  return fs.existsSync(path.join(DIR, name));
}

function readFile(name) {
  return fs.readFileSync(path.join(DIR, name), 'utf8');
}

// Load original source
const origHtml = readFile('Maraluxe Resort and Spa — Bar Menu(remodelled).html');

console.log('=================================================================');
console.log('  MARALUXE PWA REFACTOR — FULL SPECIFICATION VERIFICATION');
console.log('=================================================================\n');

// ── 1. TARGET FILE ARCHITECTURE ──
console.log('── 1. TARGET FILE ARCHITECTURE ──');
const requiredFiles = ['index.html', 'styles.css', 'assets.js', 'menu-data.js', 'app.js', 'sw.js'];
requiredFiles.forEach(f => check(`${f} exists`, fileExists(f)));

// ── 2A. assets.js ──
console.log('\n── 2A. assets.js (Programmatic Extraction) ──');
const assetsCode = readFile('assets.js');

check('assets.js is wrapped in an IIFE', /^\(function\s*\(\)\s*\{/.test(assetsCode.trim()));
check('assets.js uses "use strict"', assetsCode.includes("'use strict'"));
check('assets.js exposes window.MARALUXE_ASSETS', assetsCode.includes('window.MARALUXE_ASSETS'));
check('assets.js uses Object.freeze (via deepFreeze)', assetsCode.includes('Object.freeze'));

// Validate all 13 Base64 strings against originals
function extractCssVar(name) {
  const m = origHtml.match(new RegExp(`--${name}:url\\("(data:image\\/webp;base64,[^"]+)"\\)`));
  return m ? m[1] : null;
}
const origLogo = origHtml.match(/const L="(data:image\/webp;base64,[^"]+)";/)[1];
const origDataMatch = origHtml.match(/const D=(\{.*?\});\s*const L=/s);
const origD = JSON.parse(origDataMatch[1]);
const origSig = origD.groups[0].categories[0].items;

const expectedAssets = {
  logo: origLogo,
  'banners.hero': extractCssVar('hero'),
  'banners.cocktails': extractCssVar('bc'),
  'banners.spirits': extractCssVar('bb'),
  'banners.green': extractCssVar('bg'),
  'banners.lounge': extractCssVar('bl'),
  'banners.wine': extractCssVar('bl2'),
  'cocktails.coconutVelvetThumb': origSig[0].image.t,
  'cocktails.coconutVelvetFull': origSig[0].image.f,
  'cocktails.mangoSplashThumb': origSig[1].image.t,
  'cocktails.oasisThumb': origSig[2].image.t,
  'cocktails.strawberryBlissThumb': origSig[3].image.t,
  'cocktails.tropicalSunsetThumb': origSig[4].image.t,
};

const sandbox = { window: {}, self: {}, console };
vm.createContext(sandbox);
vm.runInContext(assetsCode, sandbox);
const A = sandbox.window.MARALUXE_ASSETS;

check('MARALUXE_ASSETS.logo exists', !!A.logo);
check('MARALUXE_ASSETS.banners has all 6 keys', A.banners && ['hero','cocktails','spirits','green','lounge','wine'].every(k => k in A.banners));
check('MARALUXE_ASSETS.cocktails has all 6 keys', A.cocktails && ['coconutVelvetThumb','coconutVelvetFull','mangoSplashThumb','oasisThumb','strawberryBlissThumb','tropicalSunsetThumb'].every(k => k in A.cocktails));

const flat = {
  logo: A.logo,
  'banners.hero': A.banners.hero,
  'banners.cocktails': A.banners.cocktails,
  'banners.spirits': A.banners.spirits,
  'banners.green': A.banners.green,
  'banners.lounge': A.banners.lounge,
  'banners.wine': A.banners.wine,
  'cocktails.coconutVelvetThumb': A.cocktails.coconutVelvetThumb,
  'cocktails.coconutVelvetFull': A.cocktails.coconutVelvetFull,
  'cocktails.mangoSplashThumb': A.cocktails.mangoSplashThumb,
  'cocktails.oasisThumb': A.cocktails.oasisThumb,
  'cocktails.strawberryBlissThumb': A.cocktails.strawberryBlissThumb,
  'cocktails.tropicalSunsetThumb': A.cocktails.tropicalSunsetThumb,
};

for (const [key, orig] of Object.entries(expectedAssets)) {
  check(`${key} byte-exact match (orig ${orig.length} == extracted ${(flat[key]||'').length})`, orig === flat[key]);
}

// ── 2B. menu-data.js ──
console.log('\n── 2B. menu-data.js (Clean Data Layer) ──');
const menuCode = readFile('menu-data.js');

check('menu-data.js exposes window.MARALUXE_MENU_DATA', menuCode.includes('window.MARALUXE_MENU_DATA'));
check('menu-data.js uses deepFreeze', menuCode.includes('deepFreeze'));
check('menu-data.js references window.MARALUXE_ASSETS.cocktails', menuCode.includes('MARALUXE_ASSETS') && menuCode.includes('cocktails'));

vm.runInContext(menuCode, sandbox);
const MD = sandbox.window.MARALUXE_MENU_DATA;

check('MARALUXE_MENU_DATA is frozen (immutable)', Object.isFrozen(MD));
check('MARALUXE_MENU_DATA.groups is frozen', Object.isFrozen(MD.groups));
check('Nested items are frozen', Object.isFrozen(MD.groups[0].categories[0].items[0]));

// Typo fixes
const mdJson = JSON.stringify(MD);
check('Typo fixed: Martel → Martell (no standalone "Martel")', !/Martel(?!l)/.test(mdJson));
check('Typo fixed: Bellaire → Belaire (no "Bellaire")', !/Bellaire/.test(mdJson));
check('Typo fixed: Brux → Brut ("Belaire Brut Gold" present)', mdJson.includes('Belaire Brut Gold'));
check('Martell VS is present', mdJson.includes('Martell VS'));
check('Martell VSOP is present', mdJson.includes('Martell VSOP'));
check('Belaire Luxe Rosé is present', mdJson.includes('Belaire Luxe Ros'));
check('Belaire Rare Luxe is present', mdJson.includes('Belaire Rare Luxe'));
check('Belaire Rare Rosé is present', mdJson.includes('Belaire Rare Ros'));

// 2-space indent
check('menu-data.js uses 2-space indentation', /\n  "/.test(menuCode) || /\n    /.test(menuCode));

// Signature cocktail images reference MARALUXE_ASSETS
const sig0 = MD.groups[0].categories[0].items[0];
check('Sig cocktail thumb is a valid base64 image URI', /^data:image\/webp;base64,/.test(sig0.image.t));
check('Sig cocktail full is a valid base64 image URI', /^data:image\/webp;base64,/.test(sig0.image.f));

// ── 2C. styles.css ──
console.log('\n── 2C. styles.css (Human-Readable BEM CSS) ──');
const css = readFile('styles.css');

// Check required BEM classes exist
const requiredBemClasses = [
  '.site-header', '.brand-logo', '.site-header__kicker', '.site-header__subtitle',
  '.menu-nav', '.menu-nav__search', '.category-pills', '.category-pills__btn', '.category-pills__btn--active',
  '.menu-container', '.menu-section', '.category-banner', '.category-banner--cocktails',
  '.category-banner--spirits', '.category-banner--green', '.category-banner--lounge', '.category-banner--wine',
  '.category-banner__title', '.category-banner__subtitle', '.subcategory-heading',
  '.featured-carousel', '.featured-card', '.featured-card__img', '.featured-card__title',
  '.featured-card__badge', '.featured-card__price',
  '.menu-item', '.menu-item__info', '.menu-item__thumb', '.menu-item__thumb--zoomable',
  '.menu-item__title', '.menu-item__badge', '.menu-item__desc', '.menu-item__pricing',
  '.menu-item__price-option', '.menu-item__option-label', '.menu-item__option-amount', '.empty-state',
  '.site-footer', '.lightbox-modal', '.lightbox-modal__img', '.lightbox-modal__caption',
  '.age-gate', '.age-gate__title', '.age-gate__message', '.age-gate__btn',
  '.age-gate__btn--confirm', '.age-gate__btn--decline',
];
requiredBemClasses.forEach(cls => {
  check(`CSS has ${cls}`, css.includes(cls));
});

// Obsolete single-letter selectors must NOT be present
const obsoleteSelectors = [
  /\.k\s*\{/, /\.s\s*\{/, /h2\.g\s*\{/, /h3\.c\s*\{/, /\.it\s*\{/,
  /\.nm\s*\{/, /\.ds\s*\{/, /\.pr\s*\{/, /\.th\s*\{/, /\.lb\s*\{/,
  /\.fs\s*\{/, /\.fc\s*\{/, /\.bd\s*\{/
];
obsoleteSelectors.forEach(regex => {
  check(`CSS has NO obsolete selector ${regex.source}`, !regex.test(css));
});

// Dark-mode support
check('CSS includes @media (prefers-color-scheme: dark)', css.includes('prefers-color-scheme: dark'));
check('CSS includes [data-theme="dark"]', css.includes('[data-theme="dark"]'));

// Design tokens
check('CSS has --color-bg token', css.includes('--color-bg'));
check('CSS has --color-gold token', css.includes('--color-gold'));
check('CSS has --font-serif token', css.includes('--font-serif'));
check('CSS has --font-sans token', css.includes('--font-sans'));

// Banner CSS custom properties
check('CSS references --banner-hero', css.includes('--banner-hero'));
check('CSS references --banner-cocktails', css.includes('--banner-cocktails'));
check('CSS references --banner-spirits', css.includes('--banner-spirits'));
check('CSS references --banner-green', css.includes('--banner-green'));
check('CSS references --banner-lounge', css.includes('--banner-lounge'));
check('CSS references --banner-wine', css.includes('--banner-wine'));

// ── 2D. app.js ──
console.log('\n── 2D. app.js (Security-Hardened Application Logic) ──');
const appJs = readFile('app.js');

check('app.js is wrapped in IIFE', /^\(function\s*\(\)\s*\{/.test(appJs.trim()));
check('app.js uses "use strict"', appJs.includes("'use strict'"));

// Zero innerHTML policy
check('app.js has ZERO innerHTML', !appJs.includes('innerHTML'));
check('app.js has ZERO outerHTML', !appJs.includes('outerHTML'));
check('app.js has ZERO insertAdjacentHTML', !appJs.includes('insertAdjacentHTML'));

// DOM construction methods
check('app.js uses document.createElement', appJs.includes('document.createElement'));
check('app.js uses document.createDocumentFragment', appJs.includes('document.createDocumentFragment'));
check('app.js uses .replaceChildren()', appJs.includes('.replaceChildren('));
check('app.js uses .textContent', appJs.includes('.textContent'));

// URI validation
check('app.js has isSafeImageUri function', appJs.includes('function isSafeImageUri'));
check('isSafeImageUri uses the specified regex pattern', appJs.includes('data:image\\/(webp|png|jpeg|jpg);base64,'));

// Event listeners — no .onclick
check('app.js uses addEventListener', appJs.includes('addEventListener'));
check('app.js has ZERO .onclick properties', !(/\.onclick\s*=/.test(appJs)));

// Escape key
check('app.js supports Escape key to close lightbox', appJs.includes("'Escape'") || appJs.includes('"Escape"'));
check('app.js calls removeAttribute("src") on lightbox close', appJs.includes('removeAttribute'));

// Input hardening: 60-char cap
check('app.js enforces 60-character search cap', appJs.includes('.slice(0, 60)') || appJs.includes('substring(0, 60)'));

// IntersectionObserver scroll-spy
check('app.js uses IntersectionObserver', appJs.includes('IntersectionObserver'));
check('app.js highlights category-pills__btn--active', appJs.includes('category-pills__btn--active'));
check('app.js scrolls pill into view', appJs.includes('scrollIntoView'));

// Age gate: sessionStorage with maraluxe_age_verified
check('app.js uses sessionStorage key "maraluxe_age_verified"', appJs.includes('maraluxe_age_verified'));
check('app.js wraps sessionStorage in try/catch', /try\s*\{[^}]*sessionStorage/.test(appJs));

// Service Worker registration
check('app.js registers ./sw.js', appJs.includes("'./sw.js'") || appJs.includes('"./sw.js"'));
check('app.js checks serviceWorker in navigator', appJs.includes("'serviceWorker' in navigator") || appJs.includes('"serviceWorker" in navigator'));
check('app.js registers SW on window load', appJs.includes("'load'") || appJs.includes('"load"'));

// ── 2E. index.html ──
console.log('\n── 2E. index.html (Hardened Entry Point) ──');
const html = readFile('index.html');

check('HTML has <!DOCTYPE html>', html.includes('<!DOCTYPE html>'));
check('HTML has <html lang="en">', html.includes('<html lang="en">'));

// Security meta tags
check('HTML has <meta name="referrer" content="no-referrer">', html.includes('content="no-referrer"'));
check('HTML has <meta http-equiv="X-Content-Type-Options" content="nosniff">', html.includes('content="nosniff"'));
check('HTML has Content-Security-Policy meta', html.includes('Content-Security-Policy'));

// CSP specifics
const cspMatch = html.match(/content="([^"]*Content-Security-Policy[^"]*|default-src[^"]*)"/i) || html.match(/content="(default-src[^"]*)"/);
const csp = cspMatch ? cspMatch[1] : '';
check("CSP has default-src 'none'", csp.includes("default-src 'none'"));
check("CSP has script-src 'self'", csp.includes("script-src 'self'"));
check("CSP script-src does NOT have 'unsafe-inline'", !(/script-src[^;]*unsafe-inline/.test(csp)));
check("CSP style-src does NOT have 'unsafe-inline'", !(/style-src[^;]*unsafe-inline/.test(csp)));
check("CSP has style-src 'self' https://fonts.googleapis.com", csp.includes("style-src 'self' https://fonts.googleapis.com"));
check('CSP has font-src https://fonts.gstatic.com', csp.includes('font-src https://fonts.gstatic.com'));
check("CSP has img-src 'self' data:", csp.includes("img-src 'self' data:"));
check("CSP has worker-src 'self'", csp.includes("worker-src 'self'"));
check("CSP has object-src 'none'", csp.includes("object-src 'none'"));
check("CSP has base-uri 'none'", csp.includes("base-uri 'none'"));
check("CSP has form-action 'none'", csp.includes("form-action 'none'"));

// Search input
check('HTML search input has maxlength="60"', html.includes('maxlength="60"'));

// External file loading
check('HTML loads ./styles.css in <head>', html.includes('href="./styles.css"'));
check('HTML loads ./assets.js with defer', /src="\.\/assets\.js"[^>]*defer/.test(html) || /defer[^>]*src="\.\/assets\.js"/.test(html));
check('HTML loads ./menu-data.js with defer', /src="\.\/menu-data\.js"[^>]*defer/.test(html) || /defer[^>]*src="\.\/menu-data\.js"/.test(html));
check('HTML loads ./app.js with defer', /src="\.\/app\.js"[^>]*defer/.test(html) || /defer[^>]*src="\.\/app\.js"/.test(html));

// No inline scripts or styles
check('HTML has ZERO <style> blocks', !/<style[\s>]/.test(html));
check('HTML has ZERO inline <script> blocks (only external)', (html.match(/<script/g) || []).length === (html.match(/<script\s+src=/g) || []).length);

// Semantic HTML elements
check('HTML uses <header>', html.includes('<header'));
check('HTML uses <nav>', html.includes('<nav'));
check('HTML uses <main>', html.includes('<main'));
check('HTML uses <footer>', html.includes('<footer'));

// Google Fonts
check('HTML preconnects to fonts.googleapis.com', html.includes('rel="preconnect" href="https://fonts.googleapis.com"'));
check('HTML preconnects to fonts.gstatic.com', html.includes('rel="preconnect" href="https://fonts.gstatic.com"'));
check('HTML loads Google Fonts stylesheet', html.includes('fonts.googleapis.com/css2'));

// ── 2F. sw.js ──
console.log('\n── 2F. sw.js (Offline-First Service Worker) ──');
const sw = readFile('sw.js');

check('sw.js defines CACHE_NAME = "maraluxe-bar-menu-v1"', sw.includes("'maraluxe-bar-menu-v1'") || sw.includes('"maraluxe-bar-menu-v1"'));

// Pre-cache list
const precacheFiles = ['./', './index.html', './styles.css', './assets.js', './menu-data.js', './app.js'];
precacheFiles.forEach(f => {
  check(`sw.js pre-caches "${f}"`, sw.includes(`'${f}'`) || sw.includes(`"${f}"`));
});

check('sw.js calls self.skipWaiting()', sw.includes('self.skipWaiting()') || sw.includes('skipWaiting()'));
check('sw.js cleans outdated caches in activate', sw.includes('activate') && sw.includes('caches.delete') || sw.includes('caches.keys'));
check('sw.js calls self.clients.claim()', sw.includes('self.clients.claim()') || sw.includes('clients.claim()'));

// Fetch strategy
check('sw.js has install event listener', sw.includes("'install'") || sw.includes('"install"'));
check('sw.js has activate event listener', sw.includes("'activate'") || sw.includes('"activate"'));
check('sw.js has fetch event listener', sw.includes("'fetch'") || sw.includes('"fetch"'));
check('sw.js ignores non-GET requests', sw.includes("'GET'") || sw.includes('"GET"'));
check('sw.js checks http/https schemes', sw.includes("'http:'") || sw.includes('"http:"') || sw.includes('protocol'));
check('sw.js does cache-first with caches.match', sw.includes('caches.match'));
check('sw.js dynamically caches Google Fonts', sw.includes('fonts.googleapis.com') || sw.includes('fonts.gstatic.com'));

// ── 3. VERIFICATION STEP ──
console.log('\n── 3. GLOBAL VERIFICATION CHECKS ──');

// Check ALL files for innerHTML
requiredFiles.forEach(f => {
  const content = readFile(f);
  check(`${f}: zero innerHTML`, !content.includes('innerHTML'));
  check(`${f}: zero outerHTML`, !content.includes('outerHTML'));
  check(`${f}: zero insertAdjacentHTML`, !content.includes('insertAdjacentHTML'));
});

// Check for unsafe-inline across all files
requiredFiles.forEach(f => {
  const content = readFile(f);
  check(`${f}: zero unsafe-inline`, !content.includes('unsafe-inline'));
});

// Check for single-letter obfuscated CSS class names in styles.css
const singleLetterClasses = css.match(/\.[a-z]\s*\{/g);
if (singleLetterClasses) {
  check(`styles.css: no single-letter class selectors (found: ${singleLetterClasses.join(', ')})`, false);
} else {
  check('styles.css: no single-letter class selectors', true);
}

// Check for single-letter obfuscated variable names in app.js
// (Just check for the specific ones from the original)
const obfuscatedVarPatterns = [
  /\bconst \$\s*=/, /\bconst esc\s*=/, /\bconst fix\s*=/,
  /\bconst fmt\s*=/, /\bconst slug\s*=/, /\bconst BK\s*=/
];
let noObfuscatedVars = true;
obfuscatedVarPatterns.forEach(p => {
  if (p.test(appJs)) {
    noObfuscatedVars = false;
    console.log(`    Warning: app.js contains obfuscated pattern: ${p.source}`);
  }
});
check('app.js: no obfuscated single-letter variable names from original', noObfuscatedVars);

// ══════ SUMMARY ══════
console.log('\n=================================================================');
console.log(`  RESULTS: ${pass} PASSED, ${fail} FAILED out of ${pass + fail} total checks`);
if (fail === 0) {
  console.log('  STATUS: ✅ ALL CHECKS PASSED');
} else {
  console.log('  STATUS: ❌ SOME CHECKS FAILED — review above');
}
console.log('=================================================================\n');

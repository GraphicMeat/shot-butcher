// Static HTML for the preview site. Real content in the HTML (no JS needed to read it); JS only adds copy buttons.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const PLATFORM_LABEL = { mac: 'Mac', iphone: 'iPhone 6.9"', ipad: 'iPad 13"' };
const LOCALE_LABEL = { 'en-US': 'English', 'de-DE': 'Deutsch', ja: '日本語' };
const REPO = 'https://github.com/GraphicMeat/shot-butcher';

export function renderPage({ manifest, locale, locales, SITE_BASE, SHOTS_URL, SITE_URL }) {
  const styles = [...new Map(manifest.map(m => [m.style, m])).values()];
  const pageUrl = `${SITE_URL}${SITE_BASE}${locale === 'en-US' ? '' : locale + '/'}`;
  const ogImage = `${SITE_URL}${SHOTS_URL}true-bento/mailvault/mac/en-US/01.webp`;
  const title = 'shot-butcher - 25 App Store screenshot styles';
  const description = '25 App Store screenshot styles for iPhone, iPad and Mac, each reproducible from a one-line prompt. A Claude Code skill by Graphic Meat that captures and composes store-ready sets.';
  let firstImages = true;

  const row = (m, platform) => {
    const [w, h] = m.dims?.[platform] ?? [560, 747];
    const shape = w > h ? 'landscape' : 'portrait';
    const imgs = m.slots.map((_, i) => {
      const n = String(i + 1).padStart(2, '0');
      const lazy = firstImages ? '' : ' loading="lazy"';
      return `<img src="${SHOTS_URL}${m.style}/${m.app}/${platform}/${locale}/${n}.webp" width="${w}" height="${h}"${lazy} decoding="async" alt="${esc(`${m.name} style, ${m.appName} ${PLATFORM_LABEL[platform]} screenshot ${i + 1} of ${m.slots.length}`)}">`;
    }).join('');
    return `<figure class="row row-${platform} row-${shape}"><figcaption>${esc(m.appName)} - ${PLATFORM_LABEL[platform]}</figcaption><div class="strip">${imgs}</div></figure>`;
  };

  const sections = styles.map((s, idx) => {
    const entries = manifest.filter(m => m.style === s.style);
    const prompts = entries.map(m => `
      <div class="prompt"><div class="prompt-head"><span>${esc(m.appName)} (${m.platforms.map(p => PLATFORM_LABEL[p]).join(', ')})</span><button type="button" class="copy" hidden>Copy prompt</button></div><pre><code>${esc(m.prompt)}</code></pre></div>`).join('');
    const rows = entries.flatMap(m => m.platforms.map(p => row(m, p))).join('');
    firstImages = false;
    return `
  <section id="${s.style}" class="style">
    <header><span class="num">${String(idx + 1).padStart(2, '0')}</span><h2>${esc(s.name)}</h2><p>${esc(s.summary)}</p></header>
    <div class="prompts">${prompts}</div>
    ${rows}
  </section>`;
  }).join('');

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'SoftwareSourceCode', name: 'shot-butcher', description,
    codeRepository: REPO, programmingLanguage: 'JavaScript', license: `${REPO}/blob/main/LICENSE`,
    author: { '@type': 'Organization', name: 'Graphic Meat', url: 'https://graphicmeat.com' }, url: pageUrl,
  };

  return `<!doctype html>
<html lang="${locale === 'en-US' ? 'en' : locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${pageUrl}">
${locales.map(l => `<link rel="alternate" hreflang="${l === 'en-US' ? 'en' : l}" href="${SITE_URL}${SITE_BASE}${l === 'en-US' ? '' : l + '/'}">`).join('\n')}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
:root { --bg: #f4f4f2; --surface: #ffffff; --ink: #141414; --muted: #5f5f66; --line: #e2e2e0; --accent: #d93a1f; --code: #f0efec; }
@media (prefers-color-scheme: dark) { :root { --bg: #0f0f11; --surface: #18181b; --ink: #ededee; --muted: #9b9ba3; --line: #2a2a2f; --accent: #ff5a3c; --code: #1e1e22; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
a { color: var(--accent); }
.wrap { max-width: 1240px; margin: 0 auto; padding: 0 16px; }
.top { padding: 56px 0 32px; border-bottom: 1px solid var(--line); }
.top h1 { font-size: clamp(34px, 6vw, 64px); line-height: 1; letter-spacing: -.03em; margin: 0 0 16px; }
.top h1 span { color: var(--accent); }
.top p { max-width: 720px; color: var(--muted); margin: 0 0 16px; font-size: 18px; }
.top pre { display: inline-block; max-width: 100%; overflow-x: auto; }
.langs { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; font-size: 14px; }
.langs a[aria-current] { color: var(--ink); font-weight: 600; text-decoration: none; }
nav.index { display: flex; flex-wrap: wrap; gap: 8px; padding: 24px 0; }
nav.index a { font-size: 13px; padding: 6px 10px; border: 1px solid var(--line); border-radius: 999px; text-decoration: none; color: var(--ink); background: var(--surface); }
nav.index a:hover { border-color: var(--accent); }
.style { padding: 48px 0; border-top: 1px solid var(--line); }
.style header { display: grid; grid-template-columns: auto 1fr; column-gap: 16px; align-items: baseline; }
.style .num { font: 600 14px/1 ui-monospace, monospace; color: var(--accent); }
.style h2 { margin: 0; font-size: 30px; letter-spacing: -.02em; }
.style header p { grid-column: 2; margin: 6px 0 0; color: var(--muted); max-width: 760px; }
.prompts { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: 12px; margin: 20px 0 8px; }
.prompt { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 12px; min-width: 0; }
.prompt-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); margin-bottom: 8px; }
pre { margin: 0; background: var(--code); border-radius: 6px; padding: 10px 12px; overflow-x: auto; font: 13px/1.5 ui-monospace, "SF Mono", Menlo, monospace; white-space: pre; }
.prompt pre { white-space: pre-wrap; overflow-wrap: anywhere; }
button.copy { font: 600 12px/1 system-ui, sans-serif; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); cursor: pointer; }
button.copy:hover { border-color: var(--accent); }
figure.row { margin: 20px 0 0; }
figure.row figcaption { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
.strip { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x proximity; }
.strip img { flex: none; height: auto; border-radius: 6px; scroll-snap-align: start; background: var(--line); }
.row-mac .strip img { width: 480px; }
.row-iphone .strip img { width: 190px; }
.row-ipad .strip img { width: 260px; }
.row-landscape .strip img { width: 400px; }
@media (max-width: 600px) { .row-mac .strip img { width: 300px; } .row-iphone .strip img { width: 150px; } .row-ipad .strip img { width: 200px; } .row-landscape .strip img { width: 280px; } }
footer { padding: 40px 0 64px; border-top: 1px solid var(--line); color: var(--muted); font-size: 14px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <h1>shot<span>-</span>butcher</h1>
    <p>25 App Store screenshot styles for iPhone, iPad and Mac. Pick one, and every screenshot, device and language in the set keeps it. Each set below is rendered from the prompt above it, so pasting that prompt into Claude Code with the skill installed gives you the same style for your app.</p>
    <pre><code>/plugin marketplace add GraphicMeat/shot-butcher
/plugin install shot-butcher@shot-butcher</code></pre>
    <div class="langs">Screenshot language: ${locales.map(l => `<a href="${SITE_BASE}${l === 'en-US' ? '' : l + '/'}"${l === locale ? ' aria-current="page"' : ''} hreflang="${l}">${LOCALE_LABEL[l] ?? l}</a>`).join(' ')}</div>
  </div>
  <nav class="index" aria-label="Styles">${styles.map((s, i) => `<a href="#${s.style}">${String(i + 1).padStart(2, '0')} ${esc(s.name)}</a>`).join('')}</nav>
  <main>${sections}
  </main>
  <footer>
    <p>Demo apps: <a href="https://mailvaultapp.com">MailVault</a> (Mac) and PhotoBooks (iPhone, iPad), both by <a href="https://graphicmeat.com">Graphic Meat</a>.</p>
    <p>Source, skill and renderer: <a href="${REPO}">github.com/GraphicMeat/shot-butcher</a>.</p>
  </footer>
</div>
<script>
for (const b of document.querySelectorAll('button.copy')) {
  b.hidden = false;
  b.addEventListener('click', async () => {
    const text = b.closest('.prompt').querySelector('code').textContent;
    try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; } catch { b.textContent = 'Select and copy'; }
    setTimeout(() => { b.textContent = 'Copy prompt'; }, 1600);
  });
}
</script>
</body>
</html>
`;
}

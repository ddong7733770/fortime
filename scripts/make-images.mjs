// 공유 미리보기(OG)·앱 아이콘 생성: `node scripts/make-images.mjs` (Playwright 필요, public/에 저장)
// 명인·부적 이미지는 public/images/에 있는 실제 이미지를 그대로 씁니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = createRequire(process.execPath)('playwright')); }
import { LANGS, dialSVG, dialLabels } from '../src/content.js';
import config from '../site.config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const css = fs.readFileSync(path.join(ROOT, 'src/client/style.css'), 'utf8');
const L = {};
for (const c of LANGS) L[c] = (await import(`../src/i18n/${c}.js`)).default;
const fs700 = n => `<link rel="stylesheet" href="file://${path.join(ROOT, 'node_modules/@fontsource', n, '700.css')}">`;
const FONTS = fs700('gowun-batang') + fs700('shippori-mincho') + fs700('noto-serif-sc') + `<style>:root{--serif:'Gowun Batang','Noto Serif CJK KR',serif}</style>`;

const browser = await chromium.launch();
const page = await browser.newPage();
async function shot(html, w, h, out, transparent = false) {
  await page.setViewportSize({ width: w, height: h });
  const tmp = path.join(ROOT, '.shot.html');
  fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${css}html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;${transparent ? 'background:transparent!important;background-image:none!important' : ''}}</style></head><body>${html}</body></html>`);
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, omitBackground: transparent });
  console.log('✔', path.relative(ROOT, out));
}

// OG 이미지 1200×630 (언어별) — 지금 사이트 디자인 그대로: 한지 바탕 · 먹 글씨 · 인주(빨강) 포인트 · 첫 화면 십이지 시계
// 시계는 빌드된 사이트(dist)의 첫 화면에서 그대로 가져옴 → `npm run build` 뒤에 실행
import http from 'node:http';
const DIST = path.join(ROOT, 'dist');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => {
  let f = path.join(DIST, decodeURIComponent(q.url.split('?')[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0);
const PORT = srv.address().port;
const SERIF = { ko: "'Noto Serif CJK KR'", ja: "'Noto Serif CJK JP'", zh: "'Noto Serif CJK SC'" };
const dialOf = async c => {
  const p2 = await browser.newPage({ viewport: { width: 420, height: 900 } });
  await p2.clock.setFixedTime(new Date('2026-06-15T12:40:00+09:00')); // 오시(午時) 한가운데
  await p2.goto(`http://127.0.0.1:${PORT}/${c}/`, { waitUntil: 'networkidle' });
  const svg = await p2.evaluate(() => document.querySelector('.now-dial svg')?.outerHTML || '');
  await p2.close();
  return svg.replace(/width="\d+" height="\d+"/, 'width="420" height="420"');
};
for (const c of [...LANGS, 'default']) {
  const Lc = L[c] || L.ko, lc = c === 'default' ? 'ko' : c;
  const sub = c === 'default' ? '시운 時運' : Lc.subBrand;
  // 줄바꿈이 단어 중간에 생기지 않게 (일본어는 단어 사이 띄어쓰기가 없어 직접 끊음)
  const tag = c === 'default' ? 'Your fortune,<br>hour by hour' : lc === 'ja' ? Lc.tagline.replace('変わる', '変わる<br>') : Lc.tagline.replace(', ', ',<br>');
  const serif = SERIF[lc] || "'Noto Serif CJK KR'";
  const dial = await dialOf(lc);
  const host = config.siteUrl.replace(/^https?:\/\//, '');
  await shot(`<div lang="${Lc.htmlLang}" style="width:1200px;height:630px;box-sizing:border-box;background:#FAF8F3;display:flex;align-items:center;gap:56px;padding:0 84px;position:relative">
<div style="position:absolute;inset:26px;border:1.5px solid #E6E2D9;border-radius:22px"></div>
<div style="flex:1;position:relative">
<div style="display:flex;align-items:center;gap:22px"><span style="width:34px;height:34px;background:#B3261E;border-radius:6px;flex:none"></span><span style="font:700 104px/1 'Noto Serif CJK KR',serif;color:#1A1A1A;letter-spacing:.01em">${config.brand}</span></div>
<div style="font:700 40px ${serif},serif;color:#6E6A62;margin:26px 0 0 56px">${sub}</div>
<div style="width:72px;height:4px;background:#B3261E;margin:46px 0 0 56px;border-radius:2px"></div>
<div style="font:700 42px/1.35 ${serif},serif;color:#1A1A1A;margin:34px 0 0 56px;word-break:keep-all">${tag}</div>
<div style="font:500 26px 'Noto Sans CJK KR',sans-serif;color:#8E1D17;margin:38px 0 0 56px;letter-spacing:.04em">${host}</div>
</div>
<div style="width:420px;height:420px;position:relative;flex:none">${dial}</div></div>`, 1200, 630, path.join(PUB, `og/${c === 'default' ? 'default' : c}.png`));
}
srv.close();

// 아이콘(public/icon-192.png · icon-512.png · favicon.svg)은 네잎클로버 그림으로 직접 관리합니다. 여기서 다시 만들지 않습니다.
await browser.close();
fs.rmSync(path.join(ROOT, '.shot.html'), { force: true });

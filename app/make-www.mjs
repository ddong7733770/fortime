// 사이트 빌드 결과(dist/)를 앱용(www/)으로 바꿉니다. 사이트 파일·사이트 빌드는 건드리지 않습니다.
//   app 폴더에서 npm run www   (= 사이트 빌드 → 이 스크립트)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import CFG from './app.config.mjs';

const APP = path.dirname(fileURLToPath(import.meta.url)); // app/ (앱 전용 폴더)
const DIST = path.join(APP, '..', 'dist'); // 사이트 빌드 결과 (읽기만 함)
const WWW = path.join(APP, 'www');
if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.error('dist/가 없습니다. 먼저 node build.mjs'); process.exit(1); }

// 앱에 필요 없는 파일: 서버(워커)·검색엔진·애드센스·서비스워커·OG 미리보기 이미지
const SKIP = new Set(['_headers', '_routes.json', '_worker.js', 'ads.txt', 'robots.txt', 'sitemap.xml', 'sw.js', 'og']);

fs.rmSync(WWW, { recursive: true, force: true });
fs.cpSync(DIST, WWW, { recursive: true, filter: src => !SKIP.has(path.relative(DIST, src).split(path.sep)[0]) || src === DIST });

const SITE = CFG.siteUrl.replace(/\/$/, '');
const HOST = new URL(SITE).host;
const must = (s, from, label) => { if (!s.includes(from)) throw new Error(`앱 변환 실패: '${label}' 부분을 찾지 못했습니다 (사이트 코드가 바뀌었는지 확인)`); };

// ── HTML: 애드센스 제거, 앱 스크립트·스타일 추가
const tag = `<link rel="stylesheet" href="/app/app.css">\n<script src="/app/native.js"></script>\n</head>`;
let pages = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.html')) continue;
    let h = fs.readFileSync(p, 'utf8');
    h = h.replace(/<script[^>]*pagead2\.googlesyndication\.com[^>]*><\/script>\s*/g, '')
      .replace(/<meta name="google-adsense-account"[^>]*>\s*/g, '')
      .replace("document.documentElement.classList.add('ads-on');", '')
      .replace(/<script type="speculationrules">[\s\S]*?<\/script>\s*/g, '')
      .replace(/("ads":\{"on":)true/, '$1false');
    must(h, '</head>', 'head');
    h = h.replace('</head>', tag);
    fs.writeFileSync(p, h); pages++;
  }
})(WWW);

// ── 화면 코드: 공유 링크·카드에 찍히는 주소를 앱 내부 주소 대신 실제 사이트 주소로
const A = path.join(WWW, 'assets');
const patch = (file, list) => {
  const f = path.join(A, file); let s = fs.readFileSync(f, 'utf8');
  for (const [from, to, label, all] of list) { must(s, from, label); s = all ? s.split(from).join(to) : s.replace(from, to); }
  fs.writeFileSync(f, s);
};
patch('app.js', [
  ['${location.origin}/', `${SITE}/`, '공유 링크 주소', true],
  ['location.host)', `${JSON.stringify(HOST)})`, '공유 카드 주소', true],
]);
patch('board.js', [['src="/api/board/img/', `src="${SITE}/api/board/img/`, '게시판 이미지 주소', true]]);

// ── 앱 연결 코드 묶기
fs.mkdirSync(path.join(WWW, 'app'), { recursive: true });
fs.copyFileSync(path.join(APP, 'app.css'), path.join(WWW, 'app', 'app.css'));
await build({
  entryPoints: [path.join(APP, 'native.js')],
  outfile: path.join(WWW, 'app', 'native.js'),
  bundle: true, format: 'iife', target: 'chrome90', minify: true, legalComments: 'none',
  define: { __CFG__: JSON.stringify({ siteUrl: SITE, appName: CFG.appName, admob: CFG.admob }) },
  logLevel: 'warning',
});

console.log(`✔ 앱용 www/ 완성: HTML ${pages}쪽 (광고: AdMob ${CFG.admob.test ? '테스트 ID' : '실제 ID'})`);

// 앱 전용 연결 코드 — 사이트 코드는 그대로 두고, 앱 안에서만 아래 기능을 덧붙입니다.
// make-www.mjs가 이 파일을 묶어서 모든 페이지 <head>에 넣습니다 (사이트 빌드에는 들어가지 않음).
//  1) /api 요청을 실제 사이트(fortime.kr)로 보냄 (게시판·문의·위치·통계)
//  2) 공유하기(navigator.share)를 안드로이드 공유 창으로 연결
//  3) 뒤로가기 버튼
//  4) AdMob 배너(화면 하단 고정) · 보상형 광고(window.ttfShowRewarded)
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, RewardAdPluginEvents } from '@capacitor-community/admob';

/* global __CFG__ */
const CFG = __CFG__;
const native = Capacitor.isNativePlatform();
const html = document.documentElement;
html.classList.add('is-app');

// ── 1) 서버 주소: 같은 앱 안의 주소는 그대로, /api 는 실제 사이트로
const _fetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  try {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith(location.origin + '/')) url = url.slice(location.origin.length); // 앱 안 파일은 상대 주소로
    if (url.startsWith('/api/')) url = CFG.siteUrl + url;
    if (typeof input === 'string' || input instanceof URL) input = url;
    else if (url !== input.url) input = new Request(url, input);
  } catch { /* 그대로 요청 */ }
  return _fetch(input, init);
};

// ── 2) 공유: 안드로이드 웹뷰에는 navigator.share가 없어서 앱 공유 창으로 대신함
if (native) {
  const toB64 = blob => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = no; r.readAsDataURL(blob); });
  navigator.canShare = () => true;
  navigator.share = async (data = {}) => {
    const files = [];
    for (const f of data.files || []) {
      const name = (f.name || 'forTime.png').replace(/[^\w.-]/g, '_');
      const w = await Filesystem.writeFile({ path: `share/${Date.now()}-${name}`, data: await toB64(f), directory: Directory.Cache, recursive: true });
      files.push(w.uri);
    }
    const opt = { title: data.title || undefined, text: data.text || undefined, url: data.url || undefined, dialogTitle: data.title || CFG.appName };
    if (files.length) opt.files = files;
    try { await Share.share(opt); }
    catch (e) { const err = new Error('AbortError'); err.name = 'AbortError'; throw err; } // 사이트 코드가 '취소'로 처리
  };
}

// ── 3) 뒤로가기: 이전 화면이 있으면 뒤로, 첫 화면이면 앱 종료
if (native && !window.__ttfBack) {
  window.__ttfBack = true;
  App.addListener('backButton', ({ canGoBack }) => {
    const ov = document.querySelector('.y-card-ov.on, .modal:not([hidden])');
    if (ov) { ov.querySelector('[data-a="close"], #modalClose')?.click(); return; } // 열린 창부터 닫기
    if (canGoBack) history.back(); else App.exitApp();
  });
}

// ── 4) AdMob
const ss = { get: k => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* */ } } };
const setAB = h => html.style.setProperty('--ab', `${Math.max(0, Math.round(h))}px`);
if (ss.get('ab')) { setAB(+ss.get('ab')); html.classList.add('has-ab'); }

// 화면 아래 안전 영역(제스처 바) 높이: Capacitor가 넣어 주는 --safe-area-inset-bottom, 없으면 env()
function bottomInset() {
  const v = parseFloat(getComputedStyle(html).getPropertyValue('--safe-area-inset-bottom'));
  if (v > 0) return v;
  const p = document.createElement('div');
  p.style.cssText = 'position:fixed;bottom:0;height:env(safe-area-inset-bottom);width:0;visibility:hidden';
  document.body.append(p); const h = p.getBoundingClientRect().height; p.remove();
  return h || 0;
}

let ready = null;
function initAds() {
  if (ready) return ready;
  ready = (async () => {
    await AdMob.initialize({ initializeForTesting: CFG.admob.test });
    // 유럽 등 동의가 필요한 지역이면 구글 동의 창(UMP)을 먼저 보여 줌
    try {
      const c = await AdMob.requestConsentInfo();
      if (c.isConsentFormAvailable && c.status === 'REQUIRED') await AdMob.showConsentForm();
    } catch { /* 동의 정보를 못 받아도 광고는 시도 */ }
  })();
  return ready;
}

async function startBanner() {
  if (ss.get('abOn')) return; // 배너는 앱이 켜져 있는 동안 계속 떠 있음 (페이지를 옮겨도 다시 만들지 않음)
  ss.set('abOn', '1');
  const margin = Math.round(bottomInset());
  AdMob.addListener(BannerAdPluginEvents.SizeChanged, s => {
    const h = s && s.height ? s.height + margin : 0;
    ss.set('ab', String(h)); setAB(h); html.classList.toggle('has-ab', h > 0);
  });
  AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => { ss.set('ab', '0'); setAB(0); html.classList.remove('has-ab'); });
  await AdMob.showBanner({ adId: CFG.admob.banner, adSize: BannerAdSize.ADAPTIVE_BANNER, position: BannerAdPosition.BOTTOM_CENTER, margin, isTesting: CFG.admob.test });
}

// 키보드가 올라오면 배너가 입력칸을 가리지 않도록 잠시 숨김
function watchKeyboard() {
  const vv = window.visualViewport; if (!vv) return;
  let hidden = false;
  vv.addEventListener('resize', () => {
    const kb = window.innerHeight - vv.height > 150 || screen.height - window.innerHeight > screen.height * 0.35;
    if (kb && !hidden) { hidden = true; AdMob.hideBanner().catch(() => {}); html.classList.add('ab-hidden'); }
    else if (!kb && hidden) { hidden = false; AdMob.resumeBanner().catch(() => {}); html.classList.remove('ab-hidden'); }
  });
}

// 보상형 광고: 사이트 코드가 이미 window.ttfShowRewarded(성공, 실패)를 찾아서 씀
//  · 끝까지 보면 onGranted → 열림
//  · 광고를 못 불러오면 onFail → 사이트 규칙대로 그냥 열어 줌
//  · 중간에 닫으면 아무 일도 없음 (다시 누르면 다시 시도)
let busy = false;
window.ttfShowRewarded = (onGranted, onFail) => {
  if (busy) return; busy = true;
  let granted = false;
  const subs = [];
  const done = () => { busy = false; subs.forEach(p => p.then(h => h.remove()).catch(() => {})); };
  subs.push(AdMob.addListener(RewardAdPluginEvents.Rewarded, () => { granted = true; }));
  subs.push(AdMob.addListener(RewardAdPluginEvents.Dismissed, () => { done(); if (granted) onGranted && onGranted(); }));
  subs.push(AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => { done(); onFail && onFail(); }));
  initAds()
    .then(() => AdMob.prepareRewardVideoAd({ adId: CFG.admob.rewarded, isTesting: CFG.admob.test }))
    .then(() => AdMob.showRewardVideoAd())
    .catch(() => { done(); onFail && onFail(); });
};

if (native) {
  const go = () => initAds().then(startBanner).catch(() => {}).finally(watchKeyboard);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true }); else go();
}

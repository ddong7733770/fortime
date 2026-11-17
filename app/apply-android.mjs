// app.config.mjs의 앱 이름·AdMob 앱 ID를 안드로이드 프로젝트(strings.xml)에 넣습니다.
import fs from 'node:fs';
import CFG from './app.config.mjs';
const f = new URL('./android/app/src/main/res/values/strings.xml', import.meta.url);
let s = fs.readFileSync(f, 'utf8');
const set = (name, val) => {
  const re = new RegExp(`<string name="${name}">[^<]*</string>`);
  const line = `<string name="${name}">${val}</string>`;
  s = re.test(s) ? s.replace(re, line) : s.replace('</resources>', `    ${line}\n</resources>`);
};
set('app_name', CFG.appName);
set('title_activity_main', CFG.appName);
set('admob_app_id', CFG.admob.appId);
fs.writeFileSync(f, s);
console.log(`✔ 안드로이드 설정: ${CFG.appName} · AdMob ${CFG.admob.test ? '테스트' : '실제'} 앱 ID`);

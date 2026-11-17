// forTime 사이트 설정 — 배포 전에 이 파일만 고치면 됩니다.
export default {
  // 실제 구매한 도메인 (끝에 / 없이)
  siteUrl: 'https://fortime.kr', // 메인 도메인 (fortime.co.kr은 한국어 첫 화면 /ko/ 로 넘어감)
  brand: 'forTime',

  // 문의 이메일 (정책 페이지와 문의 페이지에 표시됨)
  contactEmail: 'contact@fortime.kr', // Cloudflare Email Routing으로 개인 메일에 전달

  // 애드센스: 승인 후 'ca-pub-XXXXXXXXXXXXXXXX' 형태로 입력. 비워 두면 광고 자리만(미리보기에서) 표시됩니다.
  // client를 넣으면 모든 페이지 <head>에 애드센스 코드, 소유 확인 메타 태그, /ads.txt가 자동으로 들어갑니다.
  adsense: {
    client: 'ca-pub-8864456961047132',
    // 애드센스 → 광고 → 광고 단위별 → '디스플레이 광고'(반응형)로 만든 광고 단위 ID (data-ad-slot 숫자)
    slots: {
      A: '',       // 결과 화면: 오늘 운세 · 명인 화면 상단 카드 아래
      tab: '',     // 탭 하단: 해운·하나·도한 · 사주 · 궁합 · 미래 · 부적 · 2027
      content: '', // 정적 페이지 본문: 띠별·별자리·60타입·2027 띠 페이지
    },
  },

  // 구글 지도 API 키 ('지금 나에게 필요한 장소는?' 지도). 비워 두면 내장 세계지도를 씁니다.
  // Google Cloud에서 Maps JavaScript API를 켜고, 키 제한을 내 도메인(https://내도메인/*)으로 걸어 두세요.
  googleMapsKey: '',

  // Google Analytics 4 측정 ID (예: 'G-XXXXXXX'). 비워 두면 넣지 않습니다.
  ga4: '',


  // 이미지 파일 — 같은 이름으로 덮어쓰면 그대로 반영됩니다.
  images: {
    master: '/images/master.jpg', // 명인 해운정사
    hana: '/images/hana.jpg',     // 명인 하나 (연애·대인관계)
    dohan: '/images/dohan.jpg',   // 명인 도한 (직장·사업)
    charms: {
      achieve: '/images/charm/achieve.jpg',
      noble: '/images/charm/noble.jpg',
      health: '/images/charm/health.jpg',
      luck: '/images/charm/luck.jpg',
      peace: '/images/charm/peace.jpg',
      guard: '/images/charm/guard.jpg',
      allwell: '/images/charm/allwell.jpg',
      ward: '/images/charm/ward.jpg',
      wealth: '/images/charm/wealth.jpg',
      wish: '/images/charm/wish.jpg',
      yeonbun: '/images/charm/yeonbun.jpg',
      hwahap: '/images/charm/hwahap.jpg',
      dohwa: '/images/charm/dohwa.jpg',
      munchang: '/images/charm/munchang.jpg',
      yonggi: '/images/charm/yonggi.jpg',
      mugusul: '/images/charm/mugusul.jpg',
      haengro: '/images/charm/haengro.jpg',
      singi: '/images/charm/singi.jpg',
      beonchang: '/images/charm/beonchang.jpg',
      anmyeon: '/images/charm/anmyeon.jpg',
    },
  },
};

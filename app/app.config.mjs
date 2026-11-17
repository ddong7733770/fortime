// forTime 안드로이드 앱 설정 — 앱 출시 전에 고칠 곳은 이 파일 하나뿐입니다.
// 사이트(site.config.mjs)와는 별개입니다. 이 파일을 바꿔도 사이트에는 아무 영향이 없습니다.
export default {
  // 플레이 스토어 패키지 이름. 한 번 출시하면 바꿀 수 없습니다.
  appId: 'kr.fortime.app',
  appName: 'forTime',

  // 공유 링크·서버(게시판·문의·위치) 주소. 앱은 이 사이트의 /api 를 그대로 씁니다.
  siteUrl: 'https://fortime.kr',

  // 앱 안에서 쓰는 내부 주소(실제 도메인 아님). 바꾸면 기기에 저장된 입력 정보가 초기화되니 출시 후에는 고정.
  hostname: 'app.fortime.kr',

  // AdMob — 지금은 구글 공식 '테스트' ID입니다. AdMob에서 앱·광고 단위를 만든 뒤 실제 ID로 바꾸고 test를 false로.
  // 테스트 ID 상태로 출시하면 수익이 나지 않고, 실제 ID로 개발 중 광고를 누르면 계정이 정지될 수 있습니다.
  admob: {
    test: true,
    appId: 'ca-app-pub-3940256099942544~3347511713', // AdMob 앱 ID (~ 가 들어간 것)
    banner: 'ca-app-pub-3940256099942544/9214589741', // 배너(적응형) 광고 단위
    rewarded: 'ca-app-pub-3940256099942544/5224354917', // 보상형 광고 단위 (명인·궁합·사주·2027 열람)
  },
};

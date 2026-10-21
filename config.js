/*
 * 2026 안양대학교 AI 경진대회 홈페이지 설정
 * ------------------------------------------------------------
 * 날짜, 장소, 연락처, 신청서 접수 주소는 이 파일만 고치면
 * 페이지 전체(일정표, 상단 D-day 안내, 신청서 열림·닫힘)에 반영됩니다.
 * 따옴표 안의 값만 바꾸고, 쉼표와 따옴표는 지우지 마세요.
 * 날짜 형식: "YYYY-MM-DDTHH:MM:SS+09:00" (한국 시간)
 */
window.CONTEST = {
  /* 구글 Apps Script 웹 앱 URL (README의 1단계에서 받은 주소).
     비워 두면 신청서가 '접수 준비 중'으로 표시됩니다. */
  applyEndpoint: "https://script.google.com/macros/s/AKfycbzVbkzPguyVlxp7l68h8RWeEfhasOloEykL0P-qKiSoFemdfdI1WCrWSP4p7iN09ALZ/exec",

  /* 신청 기간 밖에서도 신청서를 열어 시험해 볼 때만 true. 배포 전 반드시 false. */
  forceOpen: false,

  schedule: {
    applyOpen:   "2026-10-21T09:00:00+09:00",  // 참가 신청 시작
    applyClose:  "2026-11-06T23:59:59+09:00",  // 참가 신청 마감
    confirm:     "2026-11-10T10:00:00+09:00",  // 참가 확정 안내
    preSubmit:   "2026-11-18T18:00:00+09:00",  // 예선 자료 제출 마감
    announce:    "2026-11-23T10:00:00+09:00",  // 본선 진출팀 안내
    finalSubmit: "2026-12-01T18:00:00+09:00",  // 본선 자료 제출 마감
    finalDay:    "2026-12-03T13:00:00+09:00",  // 본선 발표·시연, 시상
    results:     "2026-12-11T18:00:00+09:00"   // 수상작 게시
  },

  finalVenue: "10:00 ~, 안양대학교 아름다운리더관 4층 컨퍼런스룸 ",               // 예: "13:00, 아리관 ○○○호"
  host: "안양대학교",           // 주최
  contactPhone: "031-467-0700",
  contactEmail: "seha@gs.anyang.ac.kr",
  retention: "대회 종료 후 1년"              // 개인정보 보유 기간 (교내 규정에 맞게)
};

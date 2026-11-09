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
  applyEndpoint: "https://script.google.com/macros/s/AKfycbzztLiPpo-pSLaGl65ELDy4ibljwNX0TPPazorws4PU3n71y4Z6Kp8rn6GAzZI1ohRB/exec",

  /* 신청 기간 밖에서도 신청서를 열어 시험해 볼 때만 true. 배포 전 반드시 false. */
  forceOpen: false,

  /* 예선 자료 내려받기: 구글 드라이브 공유 링크를 따옴표 안에 그대로 붙여 넣으세요.
     (드라이브 공유 설정은 '링크가 있는 모든 사용자 - 뷰어') 비워 두면 '준비 중'으로 표시됩니다. */
  downloads: {
    template: "https://drive.google.com/file/d/1-_JZrd5gvFCSn1C_gxprcF3NApIrJP0W/view?usp=sharing",   // 예선 발표자료 템플릿 (pptx)
    guide: ""       // 예선 가이드라인 (pdf, 선택. 비워 두면 버튼이 숨겨집니다)
  },

  /* 참가 팀 목록 ('참가 팀' 칸에 이 순서대로 표시). 학생 이름 등 개인정보는 넣지 마세요.
     name: 팀명 (비우면 '팀명 정하는 중'), field: 분야 (비우면 '분야 정하는 중'),
     topic: 한 줄 주제 (비우면 '주제 정하는 중'). 팀을 빼려면 그 줄을 지우세요. */
  teams: [
    { name: "22학번", field: "건강·생활안전", topic: "음식 알레르기와 영양성분을 고려한 식단 관리" },
    { name: "밀당", field: "지역 상권·관광", topic: "빅데이터로 지역 불균형을 분석하는 AI" },
    { name: "뉴트리핏", field: "건강·생활안전", topic: "바쁜 현대인을 위한 AI 맞춤 영양 관리" },
    { name: "마프할랩", field: "교육·학습", topic: "ATmega128 학습을 돕는 AI 시뮬레이션" },
    { name: "김이서", field: "", topic: "AI가 낯선 사회적 약자도 AI 혜택을 누리게 돕는 서비스" },
    { name: "컴공23", field: "캠퍼스 생활", topic: "버튼 하나로 PC 네트워크 문제를 진단·해결하는 네트워크 닥터" },
    { name: "OVERCLOCK", field: "기타", topic: "컴퓨터실 전력 사용을 분석해 미사용 기기를 자동 차단" },
    { name: "플랜티즈", field: "환경·에너지", topic: "신재생 발전 예측과 수급 균형 제어" },
    { name: "sudo없이말해", field: "캠퍼스 생활", topic: "욕설·비속어와 대화 맥락을 판별하는 AI 필터" },
    { name: "환전", field: "캠퍼스 생활", topic: "안양대 날씨에 맞춘 체감온도 기반 옷차림 추천" },
    { name: "인생은 TRIP", field: "지역 상권·관광", topic: "여행 중 돌발 상황에 일정을 바꿔 주는 AI 여행 비서" },
    { name: "FOC", field: "캠퍼스 생활", topic: "상황에 맞는 캠퍼스 정보와 장소를 추천하는 플랫폼" },
    { name: "E4", field: "교육·학습", topic: "일정과 목표를 분석해 할 일을 제안하는 AI 자기관리" },
    { name: "챗바퀴", field: "", topic: "" },
    { name: "버그없는날", field: "기타", topic: "뽑기 결과를 분석해 재화 사용 계획을 세워 주는 서비스" },
    { name: "먀먀", field: "교육·학습", topic: "블록선도·수식을 인식해 제어공학 과제를 돕는 AI 튜터" },
    { name: "For god", field: "기타", topic: "계약서·진단서 속 어려운 용어를 풀어 주는 앱" },
    { name: "미원", field: "행정·법무", topic: "교회 행정 업무를 돕는 AI" },
    { name: "비트와 와트", field: "환경·에너지", topic: "센서와 AI로 생활 속 불편과 낭비를 줄이는 서비스" },
    { name: "지지직", field: "지역 상권·관광", topic: "공연장·영화관 시야를 예측해 좌석을 추천하는 AI" },
    { name: "문과의반란", field: "", topic: "" },
    { name: "에이아이", field: "", topic: "" },
    { name: "NATURA", field: "환경·에너지", topic: "강우·환경 데이터로 수질오염 위험 지역을 예측" },
    { name: "", field: "", topic: "" },   // 개인 신청 매칭팀 (팀명 정해지면 입력)
    { name: "", field: "", topic: "" },
    { name: "", field: "", topic: "" }
  ],

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
  contactPhone: "031-463-1347",
  contactEmail: "seha@gs.anyang.ac.kr",
  retention: "대회 종료 후 1년"              // 개인정보 보유 기간 (교내 규정에 맞게)
};

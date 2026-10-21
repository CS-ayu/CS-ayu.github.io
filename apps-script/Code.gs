/**
 * 2026 안양대학교 AI 경진대회 — 참가 신청 접수 (Google Apps Script)
 *
 * 홈페이지 신청서가 보낸 내용을 이 스크립트가 연결된 구글 시트의 '신청' 탭에 한 줄씩 쌓습니다.
 * 설치 방법은 README.md의 1단계를 따르세요.
 */

// ── 설정 ─────────────────────────────────────────────
const OPEN_AT  = new Date('2026-10-21T09:00:00+09:00');   // config.js의 applyOpen과 같게
const CLOSE_AT = new Date('2026-11-06T23:59:59+09:00');   // config.js의 applyClose와 같게
const TEST_MODE = false;          // true면 기간과 관계없이 접수(시험용). 배포 전 false로.
const SEND_CONFIRMATION = true;   // 대표 이메일로 접수 확인 메일 보내기
const CONTACT = '안양대학교 컴퓨터공학과 031-467-0700 / cho@anyang.ac.kr';
const SHEET_NAME = '신청';
// ─────────────────────────────────────────────────────

const HEADERS = [
  '접수번호', '접수시각', '신청유형', '팀명', '분야', '아이디어', '희망역할',
  '대표_이름', '대표_학과', '대표_학번', '대표_학년', '대표_휴대전화', '대표_이메일',
  '인원', '팀원(이름/학과/학번/학년)', '촬영동의', '개인정보동의', '메모', '학번목록'
];
const SID_COL = HEADERS.indexOf('학번목록') + 1;

function doGet() {
  return ContentService.createTextOutput('AI 경진대회 신청 접수 서버가 작동 중입니다.');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json({ ok: false, code: 'busy', message: '신청이 몰려 처리하지 못했습니다. 잠시 후 다시 제출해 주세요.' });
  }
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return json({ ok: true, id: 'AI26-000' });          // 자동 입력 방지용 숨은 칸

    const now = new Date();
    if (!TEST_MODE && (now < OPEN_AT || now > CLOSE_AT)) {
      return json({ ok: false, code: 'closed', message: '지금은 참가 신청 기간이 아닙니다.' });
    }

    const problem = validate(d);
    if (problem) return json({ ok: false, code: 'invalid', message: problem });

    const sh = sheet();
    const sids = [d.leader.sid].concat(d.members.map(function (m) { return m.sid; }));
    const dup = findDuplicate(sh, sids);
    if (dup) {
      return json({ ok: false, code: 'duplicate',
        message: '학번 ' + dup + '은(는) 이미 신청되어 있습니다. 한 사람은 한 팀으로만 참가할 수 있습니다. 바꿔야 하면 문의처로 연락해 주세요.' });
    }

    const id = 'AI26-' + ('00' + sh.getLastRow()).slice(-3);   // 머리글이 1행이므로 첫 신청이 001
    const team = d.type === 'team';
    sh.appendRow([
      id, now, team ? '팀' : '개인', clean(d.teamName), clean(d.field), clean(d.idea), clean(d.role),
      clean(d.leader.name), clean(d.leader.dept), "'" + d.leader.sid, d.leader.year, "'" + d.leader.phone, clean(d.leader.email),
      1 + d.members.length,
      d.members.map(function (m) { return [m.name, m.dept, m.sid, m.year].map(clean).join(' / '); }).join('\n'),
      d.consentPhoto ? '동의' : '미동의', '동의', '', ',' + sids.join(',') + ','
    ]);

    let mailed = null;
    if (SEND_CONFIRMATION) {
      try { sendConfirmation(id, d); mailed = true; } catch (err) { mailed = false; }
    }
    return json({ ok: true, id: id, mailed: mailed });
  } catch (err) {
    return json({ ok: false, code: 'error', message: '처리 중 문제가 생겼습니다. 잠시 후 다시 시도하거나 문의처로 연락해 주세요.' });
  } finally {
    lock.releaseLock();
  }
}

function validate(d) {
  const SID = /^\d{6,10}$/, PHONE = /^01[016789]-?\d{3,4}-?\d{4}$/, MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const YEARS = ['1', '2', '3', '4', '5 이상'];
  if (d.type !== 'team' && d.type !== 'solo') return '신청 유형을 선택해 주세요.';
  if (!d.consentPrivacy) return '개인정보 수집·이용에 동의해야 신청할 수 있습니다.';
  const L = d.leader || {};
  if (!text(L.name, 20) || !text(L.dept, 40)) return '대표자 이름과 학과를 입력해 주세요.';
  if (!SID.test(L.sid || '')) return '대표자 학번을 확인해 주세요.';
  if (YEARS.indexOf(L.year) < 0) return '대표자 학년을 선택해 주세요.';
  if (!PHONE.test(L.phone || '')) return '휴대전화 번호를 확인해 주세요.';
  if (!MAIL.test(L.email || '') || L.email.length > 80) return '이메일 주소를 확인해 주세요.';
  if (!text(d.field, 20)) return '분야를 선택해 주세요.';
  if ((d.idea || '').length > 100 || (d.role || '').length > 100) return '아이디어는 100자 이내로 적어 주세요.';
  if (!Array.isArray(d.members)) d.members = [];
  if (d.type === 'solo') { d.members = []; d.teamName = ''; return ''; }
  if (!text(d.teamName, 30)) return '팀명을 입력해 주세요.';
  if (!text(d.idea, 100)) return '아이디어 한 줄 요약을 입력해 주세요.';
  if (d.members.length < 1 || d.members.length > 3) return '팀은 대표자 포함 2~4명이어야 합니다.';
  const seen = {}; seen[L.sid] = true;
  for (let i = 0; i < d.members.length; i++) {
    const m = d.members[i] || {};
    if (!text(m.name, 20) || !text(m.dept, 40) || !SID.test(m.sid || '') || YEARS.indexOf(m.year) < 0) {
      return '팀원 ' + (i + 1) + '의 정보를 확인해 주세요.';
    }
    if (seen[m.sid]) return '같은 학번(' + m.sid + ')이 두 번 입력되었습니다.';
    seen[m.sid] = true;
  }
  return '';
}

function text(s, max) { return typeof s === 'string' && s.trim().length > 0 && s.length <= max; }

// 시트 수식으로 해석되지 않게 앞에 ' 를 붙입니다.
function clean(s) {
  s = String(s == null ? '' : s).trim();
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.hideColumns(SID_COL);
  }
  return sh;
}

function findDuplicate(sh, sids) {
  const last = sh.getLastRow();
  if (last < 2) return '';
  const all = sh.getRange(2, SID_COL, last - 1, 1).getValues().map(function (r) { return String(r[0]); }).join('');
  for (let i = 0; i < sids.length; i++) {
    if (all.indexOf(',' + sids[i] + ',') >= 0) return sids[i];
  }
  return '';
}

function sendConfirmation(id, d) {
  const team = d.type === 'team';
  const lines = [
    d.leader.name + '님, 2026 안양대학교 AI 경진대회 참가 신청이 접수되었습니다.',
    '',
    '접수번호: ' + id,
    '신청 유형: ' + (team ? '팀 (' + d.teamName + ', ' + (1 + d.members.length) + '명)' : '개인 (팀 구성 지원 희망)'),
    '분야: ' + d.field,
    d.idea ? '아이디어: ' + d.idea : '',
    '',
    '참가 확정과 예선 자료 제출 방법은 11월 10일(화)경 이 주소로 안내합니다.',
    '신청 내용을 바꾸거나 취소하려면 접수번호와 함께 아래로 연락해 주세요.',
    CONTACT
  ].filter(function (x, i, a) { return x !== '' || a[i - 1] !== ''; });
  MailApp.sendEmail({
    to: d.leader.email,
    subject: '[2026 안양대 AI 경진대회] 참가 신청 접수 확인 (' + id + ')',
    body: lines.join('\n'),
    name: '안양대학교 AI 경진대회'
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 설치 직후 한 번 실행하면 '신청' 탭과 머리글을 만들고 메일 발송 권한을 승인받습니다.
function setup() {
  sheet();
  MailApp.getRemainingDailyQuota();
}

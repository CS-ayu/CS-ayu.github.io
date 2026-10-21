(function () {
  'use strict';
  var C = window.CONTEST || {};
  var S = C.schedule || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- dates (always shown in Korea time) ---------- */
  var HOUR = 3600000, DAY = 24 * HOUR;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function at(key) { return S[key] ? new Date(S[key]) : null; }
  function parts(d) {
    var k = new Date(d.getTime() + 9 * HOUR);
    return { M: k.getUTCMonth() + 1, D: k.getUTCDate(), W: '일월화수목금토'.charAt(k.getUTCDay()), t: pad(k.getUTCHours()) + ':' + pad(k.getUTCMinutes()) };
  }
  function fmt(d, f) {
    var p = parts(d);
    switch (f) {
      case 'md': return p.M + '.' + p.D;
      case 'mdw': return p.M + '.' + p.D + '.(' + p.W + ')';
      case 'mdwt': return p.M + '.' + p.D + '.(' + p.W + ') ' + p.t;
      case 'mdt': return p.M + '.' + p.D + '. ' + p.t;
      case 't': return p.t;
      default: return p.M + '.' + p.D + '.(' + p.W + ')';
    }
  }
  function kstDay(d) { return Math.floor((d.getTime() + 9 * HOUR) / DAY); }
  function endOfDay(d) { return new Date((kstDay(d) + 1) * DAY - 9 * HOUR - 1); }
  function dday(target, now) { var n = kstDay(target) - kstDay(now); return n <= 0 ? 'D-DAY' : 'D-' + n; }

  $$('[data-date]').forEach(function (el) {
    var d = at(el.getAttribute('data-date'));
    if (d && !isNaN(d)) el.textContent = fmt(d, el.getAttribute('data-fmt'));
  });
  $$('[data-cfg]').forEach(function (el) {
    var v = C[el.getAttribute('data-cfg')];
    if (typeof v === 'string' && v) el.textContent = v;
  });

  var now = new Date();
  var open = at('applyOpen'), close = at('applyClose');

  /* ---------- status line ---------- */
  (function status() {
    var el = $('#status-text'); if (!el || !open) return;
    var pre = at('preSubmit'), ann = at('announce'), fin = at('finalSubmit'), fday = at('finalDay'), res = at('results');
    var b = function (s) { return '<b>' + s + '</b>'; };
    var m;
    if (now < open) m = '참가 신청 ' + b(fmt(open, 'mdw') + ' 시작 · ' + dday(open, now));
    else if (now <= close) m = '참가 신청 중 · 마감 ' + b(dday(close, now)) + ' (' + fmt(close, 'mdt') + ')';
    else if (now <= pre) m = '예선 자료 제출 마감 ' + b(dday(pre, now)) + ' (' + fmt(pre, 'mdt') + ')';
    else if (now < ann) m = '예선 심사 중 · ' + b(fmt(ann, 'mdw')) + ' 본선 진출팀 안내';
    else if (now <= fin) m = '본선 자료 제출 마감 ' + b(dday(fin, now)) + ' (' + fmt(fin, 'mdt') + ')';
    else if (now <= endOfDay(fday)) m = '본선 발표·시연 ' + b(dday(fday, now)) + ' (' + fmt(fday, 'mdw') + ')';
    else m = '대회가 끝났습니다 · 수상작 ' + b(fmt(res, 'mdw')) + '까지 공개';
    el.innerHTML = m;
  })();

  /* ---------- timeline progress ---------- */
  if (open && now >= open) {
    var marked = false;
    $$('#timeline .step').forEach(function (s) {
      var end = at(s.getAttribute('data-end')); if (!end) return;
      if (s.hasAttribute('data-end-of-day')) end = endOfDay(end);
      if (now > end) s.classList.add('done');
      else if (!marked) {
        marked = true; s.classList.add('now');
        var bd = document.createElement('span'); bd.className = 'badge'; bd.textContent = '진행 중';
        s.insertBefore(bd, s.firstChild);
      }
    });
  }

  /* ---------- scoring tabs ---------- */
  var SC = {
    final: [
      ['프로토타입 완성도', 30, '핵심 기능이 라이브 시연에서 실제로 작동하는가, 소스코드로 확인되는가'],
      ['AI 활용의 적절성', 25, '방법 선택이 타당한가, 팀이 무엇을 설계·구현했는가'],
      ['문제 정의·필요성', 20, '대상과 상황이 구체적인가, 예선 이후 구체화되었는가'],
      ['발표·질의응답', 15, '팀원 각자가 맡은 부분과 작동 원리를 설명할 수 있는가'],
      ['검증 및 한계 인식', 10, '검증 결과를 과장 없이 해석하고 한계를 밝혔는가']
    ],
    pre: [
      ['문제 정의·필요성', 30, '대상과 상황이 구체적인가, 해결할 가치가 있는가'],
      ['AI 활용 아이디어의 적절성', 30, '이 문제에 AI가 필요한 이유와 활용 방법이 타당한가'],
      ['실현 가능성', 25, '개발 기간 안에 만들 수 있는 범위와 계획인가, 데이터 확보 방안이 있는가'],
      ['자료의 완성도', 15, '아이디어와 계획이 자료만으로 분명하게 전달되는가']
    ]
  };
  var list = $('#scores');
  function renderScores(key) {
    list.innerHTML = '';
    SC[key].forEach(function (r) {
      var li = document.createElement('li'); li.className = 'score';
      li.innerHTML = '<span class="name"></span><span class="pts num"></span><span class="bar" aria-hidden="true"><i></i></span><span class="desc"></span>';
      $('.name', li).textContent = r[0];
      $('.pts', li).textContent = r[1] + '점';
      $('.bar i', li).style.width = r[1] + '%';
      $('.desc', li).textContent = r[2];
      list.appendChild(li);
    });
  }
  if (list) {
    var tabs = { final: $('#tab-final'), pre: $('#tab-pre') };
    Object.keys(tabs).forEach(function (k) {
      tabs[k].addEventListener('click', function () {
        Object.keys(tabs).forEach(function (j) { tabs[j].setAttribute('aria-selected', j === k ? 'true' : 'false'); });
        renderScores(k);
      });
    });
    renderScores('final');
  }

  /* ---------- rotating word in the hero ---------- */
  var words = ['전공', '경영', '교육', '디자인', '사회복지', '행정', '건강', '캠퍼스', '지역'], wi = 0, slot = $('#slot');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (slot && !reduce) setInterval(function () {
    if (document.hidden) return;
    wi = (wi + 1) % words.length; slot.textContent = words[wi];
    slot.classList.remove('swap'); void slot.offsetWidth; slot.classList.add('swap');
  }, 2200);

  /* ---------- application form ---------- */
  var form = $('#apply-form'); if (!form) return;
  var stateEl = $('#form-state'), errEl = $('#form-err'), submitBtn = $('#submit');
  var membersEl = $('#members'), addBtn = $('#add-member');
  var MAX_MEMBERS = 3;

  function setState(msg) { stateEl.textContent = msg; stateEl.hidden = !msg; }
  var accepting = true;
  if (!C.forceOpen) {
    if (open && now < open) { accepting = false; setState('신청서는 ' + fmt(open, 'mdwt') + '부터 제출할 수 있습니다. 미리 내용을 확인해 두세요.'); }
    else if (close && now > close) { accepting = false; form.hidden = true; setState('참가 신청이 마감되었습니다. 문의는 아래 연락처로 해 주세요.'); }
  }
  if (accepting && !C.applyEndpoint) { accepting = false; setState('신청 접수를 준비하고 있습니다. 잠시 후 다시 확인해 주세요.'); }
  submitBtn.disabled = !accepting;

  function yearSelect(id) {
    return '<select id="' + id + '" required><option value="">선택</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5 이상</option></select>';
  }
  var seq = 0;
  function addMember() {
    var n = membersEl.children.length; if (n >= MAX_MEMBERS) return;
    var i = ++seq, box = document.createElement('div');
    box.className = 'member';
    box.innerHTML =
      '<div class="member-head"><b></b><button type="button" class="link-btn danger">삭제</button></div>' +
      '<div class="fgrid">' +
      '<div class="field"><label class="req" for="m' + i + '-name">이름</label><input id="m' + i + '-name" maxlength="20" required></div>' +
      '<div class="field"><label class="req" for="m' + i + '-dept">학과(전공)</label><input id="m' + i + '-dept" maxlength="40" required></div>' +
      '<div class="field"><label class="req" for="m' + i + '-sid">학번</label><input id="m' + i + '-sid" inputmode="numeric" maxlength="10" pattern="[0-9]{6,10}" required></div>' +
      '<div class="field"><label class="req" for="m' + i + '-year">학년</label>' + yearSelect('m' + i + '-year') + '</div>' +
      '</div>';
    $('.danger', box).addEventListener('click', function () { box.remove(); renumber(); });
    membersEl.appendChild(box); renumber();
    return box;
  }
  function renumber() {
    var boxes = $$('.member', membersEl);
    boxes.forEach(function (b, k) {
      $('b', b).textContent = '팀원 ' + (k + 1);
      $('.danger', b).hidden = boxes.length <= 1;
    });
    addBtn.hidden = boxes.length >= MAX_MEMBERS;
  }
  addBtn.addEventListener('click', function () { var b = addMember(); if (b) $('input', b).focus(); });
  addMember();

  function isTeam() { return $('#type-team').checked; }
  function applyType() {
    var team = isTeam();
    $$('.team-only', form).forEach(function (el) { el.hidden = !team; });
    $$('.solo-only', form).forEach(function (el) { el.hidden = team; });
    $('#leader-legend').textContent = team ? '대표자 정보' : '신청자 정보';
    $('#idea-label').classList.toggle('req', team);
  }
  $$('input[name="type"]').forEach(function (r) { r.addEventListener('change', applyType); });
  applyType();

  var idea = $('#idea'), ideaCount = $('#idea-count');
  idea.addEventListener('input', function () { ideaCount.textContent = idea.value.length; });

  var phone = $('#l-phone');
  phone.addEventListener('blur', function () {
    var d = phone.value.replace(/\D/g, '');
    if (/^01\d{8,9}$/.test(d)) phone.value = d.slice(0, 3) + '-' + d.slice(3, d.length - 4) + '-' + d.slice(-4);
  });

  function v(id) { return ($('#' + id).value || '').trim(); }
  function showErr(msg, el) {
    errEl.textContent = msg; errEl.hidden = false;
    if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
  }
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid')) e.target.removeAttribute('aria-invalid');
    errEl.hidden = true;
  });

  function validate() {
    var team = isTeam();
    var scope = $$('input, select', form).filter(function (el) {
      return el.id !== 'website' && !el.closest('[hidden]') && el.type !== 'radio';
    });
    for (var k = 0; k < scope.length; k++) {
      var el = scope[k];
      if (el.id === 'teamName' && team && !el.value.trim()) return showErr('팀명을 입력해 주세요.', el), false;
      if (el.id === 'idea' && team && !el.value.trim()) return showErr('아이디어 한 줄 요약을 입력해 주세요. 예선 전까지 바뀌어도 괜찮습니다.', el), false;
      if (el.type === 'checkbox') continue;
      if (!el.checkValidity()) {
        var label = form.querySelector('label[for="' + el.id + '"]');
        var name = label ? label.textContent.replace(/\s*\*$/, '') : '항목';
        var who = el.closest('.member') ? $('b', el.closest('.member')).textContent + '의 ' : '';
        var msg = el.validity.valueMissing ? who + name + '을(를) 입력해 주세요.'
          : el.id.slice(-3) === 'sid' ? who + '학번은 숫자 6~10자리로 입력해 주세요.'
          : el.type === 'email' ? '이메일 주소 형식을 확인해 주세요.'
          : el.type === 'tel' ? '휴대전화 번호를 010-0000-0000 형식으로 입력해 주세요.'
          : who + name + '을(를) 확인해 주세요.';
        return showErr(msg, el), false;
      }
    }
    if (team) {
      var sids = [v('l-sid')].concat($$('.member', membersEl).map(function (b) { return $('input[id$="-sid"]', b).value.trim(); }));
      var seen = {};
      for (var j = 0; j < sids.length; j++) {
        if (seen[sids[j]]) return showErr('같은 학번(' + sids[j] + ')이 두 번 입력되었습니다.', null), false;
        seen[sids[j]] = 1;
      }
    }
    if (!$('#c-privacy').checked) return showErr('개인정보 수집·이용에 동의해야 신청할 수 있습니다.', $('#c-privacy')), false;
    return true;
  }

  function payload() {
    var team = isTeam();
    return {
      type: team ? 'team' : 'solo',
      teamName: team ? v('teamName') : '',
      leader: { name: v('l-name'), dept: v('l-dept'), sid: v('l-sid'), year: v('l-year'), phone: v('l-phone'), email: v('l-email') },
      members: team ? $$('.member', membersEl).map(function (b) {
        var g = function (s) { return ($('[id$="-' + s + '"]', b).value || '').trim(); };
        return { name: g('name'), dept: g('dept'), sid: g('sid'), year: g('year') };
      }) : [],
      field: v('field'),
      idea: v('idea'),
      role: team ? '' : v('role'),
      consentPrivacy: $('#c-privacy').checked,
      consentPhoto: $('#c-photo').checked,
      website: v('website')
    };
  }

  var sending = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending || !accepting) return;
    errEl.hidden = true;
    if (!validate()) return;
    sending = true; submitBtn.disabled = true; submitBtn.textContent = '보내는 중…';
    fetch(C.applyEndpoint, { method: 'POST', body: JSON.stringify(payload()) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok) {
          form.hidden = true; setState('');
          $('#rcpt-id').textContent = res.id || '';
          if (res.mailed === false) $('#done-msg').textContent = '접수번호를 캡처해 두세요. 확인 메일은 보내지 못했지만 신청은 정상 접수되었습니다.';
          var done = $('#done'); done.hidden = false; done.focus();
        } else {
          showErr((res && res.message) || '신청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.', null);
        }
      })
      .catch(function () {
        showErr('전송하지 못했습니다. 인터넷 연결을 확인하고 다시 눌러 주세요. 계속 안 되면 문의처로 연락해 주세요.', null);
      })
      .then(function () { sending = false; submitBtn.disabled = !accepting; submitBtn.textContent = '신청서 제출'; });
  });
})();

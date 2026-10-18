'use strict';

/* ---------- 술 종류 & 귀여운 스티커 ---------- */

const DRINKS = {
  soju:       { name: '소주',   unit: '병', shape: 'bottle', body: '#7ecf96', cap: '#4a9664' },
  beerCan:    { name: '맥주캔', unit: '캔', shape: 'can',    body: '#ffd166', cap: '#c9a227' },
  beerBottle: { name: '맥주병', unit: '병', shape: 'bottle', body: '#d39a6a', cap: '#8a5a35' },
  makgeolli:  { name: '막걸리', unit: '병', shape: 'jug',    body: '#f3ede0', cap: '#7cc49a' },
  wine:       { name: '와인',   unit: '병', shape: 'wine',   body: '#b56fa8', cap: '#7a3f70' },
  highball:   { name: '하이볼', unit: '캔', shape: 'can',    body: '#9cc9ff', cap: '#5a8fd0' },
  whisky:     { name: '위스키', unit: '병', shape: 'square', body: '#e7a75a', cap: '#4a3b40' },
  etc:        { name: '기타',   unit: '잔', shape: 'can',    body: '#ffb3c6', cap: '#e07a98' },
};

function face(cx, cy) {
  return `
    <circle cx="${cx - 4}" cy="${cy}" r="1.6" fill="#4a3b40"/>
    <circle cx="${cx + 4}" cy="${cy}" r="1.6" fill="#4a3b40"/>
    <ellipse cx="${cx - 7}" cy="${cy + 3.2}" rx="2.2" ry="1.3" fill="#ff8c96" opacity=".75"/>
    <ellipse cx="${cx + 7}" cy="${cy + 3.2}" rx="2.2" ry="1.3" fill="#ff8c96" opacity=".75"/>
    <path d="M${cx - 2} ${cy + 2.3} Q${cx} ${cy + 4.6} ${cx + 2} ${cy + 2.3}" stroke="#4a3b40" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
}

function sticker(type) {
  const d = DRINKS[type] || DRINKS.etc;
  const label = '#fffaf0';
  let shape;
  switch (d.shape) {
    case 'can':
      shape = `
        <rect x="8" y="12" width="24" height="48" rx="6" fill="${d.body}"/>
        <rect x="9" y="8" width="22" height="7" rx="3" fill="${d.cap}"/>
        <rect x="16" y="5" width="8" height="4" rx="2" fill="${d.cap}"/>
        <rect x="8" y="28" width="24" height="17" fill="${label}" opacity=".9"/>
        ${face(20, 35)}`;
      break;
    case 'jug':
      shape = `
        <rect x="15" y="3" width="10" height="7" rx="2" fill="${d.cap}"/>
        <path d="M15 10 L25 10 L25 14 Q32 16 32 24 L32 58 Q32 62 28 62 L12 62 Q8 62 8 58 L8 24 Q8 16 15 14 Z" fill="${d.body}" stroke="#e2d8c4" stroke-width="1"/>
        <rect x="8" y="30" width="24" height="18" fill="${d.cap}" opacity=".35"/>
        ${face(20, 38)}`;
      break;
    case 'wine':
      shape = `
        <rect x="16" y="2" width="8" height="8" rx="1.5" fill="${d.cap}"/>
        <rect x="17" y="9" width="6" height="13" fill="${d.body}"/>
        <path d="M17 21 Q10 24 10 32 L10 58 Q10 62 14 62 L26 62 Q30 62 30 58 L30 32 Q30 24 23 21 Z" fill="${d.body}"/>
        <rect x="10" y="36" width="20" height="16" fill="${label}"/>
        ${face(20, 42)}`;
      break;
    case 'square':
      shape = `
        <rect x="15" y="4" width="10" height="7" rx="2" fill="${d.cap}"/>
        <rect x="16" y="10" width="8" height="8" fill="${d.body}"/>
        <rect x="7" y="17" width="26" height="45" rx="5" fill="${d.body}"/>
        <rect x="7" y="31" width="26" height="17" fill="${label}"/>
        ${face(20, 38)}`;
      break;
    default: // bottle
      shape = `
        <rect x="15" y="2" width="10" height="6" rx="1.5" fill="${d.cap}"/>
        <rect x="16" y="7" width="8" height="10" fill="${d.body}"/>
        <path d="M16 16 Q10 18 10 26 L10 58 Q10 62 14 62 L26 62 Q30 62 30 58 L30 26 Q30 18 24 16 Z" fill="${d.body}"/>
        <rect x="10" y="32" width="20" height="17" fill="${label}"/>
        ${face(20, 38)}`;
  }
  return `<svg viewBox="0 0 40 64" aria-hidden="true">${shape}</svg>`;
}

/* ---------- 분수 (n명이서 나눠 마신 양을 정확하게) ---------- */

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function frac(n, d) { const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; }
function addFrac(a, b) { return frac(a.n * b.d + b.n * a.d, a.d * b.d); }
function fmtFrac({ n, d }) {
  if (d === 1) return String(n);
  const whole = Math.floor(n / d), rest = n % d;
  return whole ? `${whole}과 ${rest}/${d}` : `${rest}/${d}`;
}
const shareOf = (e) => frac(e.qty, e.people);

/* ---------- 저장소 ---------- */

const KEY = 'alcal.v1';
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { entries: [] }; }
  catch { return { entries: [] }; }
}
let db = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch { toast('이 브라우저에서는 저장이 안 돼요. 백업을 꼭 해두세요'); }
}
function pref(k, v) {
  try { if (v === undefined) return localStorage.getItem(KEY + '.' + k); localStorage.setItem(KEY + '.' + k, v); }
  catch { return null; }
}

const pad = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayStr = () => { const t = new Date(); return ymd(t.getFullYear(), t.getMonth(), t.getDate()); };
const entriesOn = (date) => db.entries.filter((e) => e.date === date);

/* ---------- 화면 ---------- */

const $ = (id) => document.getElementById(id);
const now = new Date();
let view = { y: now.getFullYear(), m: now.getMonth() };
let sel = todayStr();      // 빠른 기록이 붙을 날짜
let openDate = null;       // 상세 시트가 열린 날짜
let people = 1;            // 같이 마신 사람 수 (빠른 기록에 적용)
db.memos = db.memos || {};

const CHEERS = [
  '기록하는 당신, 멋져요 ✨',
  '즐거운 시간이었길 바라요 🥂',
  '물 한 잔도 같이 챙겨요 💧',
  '오늘도 수고했어요 🫶',
  '맛있는 안주는 뭐였어요? 🍗',
  '내일의 나에게 꿀물 한 잔 🍯',
];

const dateLabel = (date) => {
  const [, mm, dd] = date.split('-');
  const dow = '일월화수목금토'[new Date(date + 'T00:00').getDay()];
  return `${+mm}월 ${+dd}일 (${dow})`;
};

function renderAll() { renderCalendar(); renderQuick(); if (openDate) renderEntries(); }

function renderCalendar() {
  const { y, m } = view;
  $('title').textContent = `${y}년 ${m + 1}월`;
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const today = todayStr();
  const grid = $('grid');
  grid.innerHTML = '';

  for (let i = 0; i < first; i++) {
    const el = document.createElement('div');
    el.className = 'day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= days; d++) {
    const date = ymd(y, m, d);
    const list = entriesOn(date);
    const count = list.reduce((s, e) => s + e.qty, 0);
    const dow = (first + d - 1) % 7;
    const el = document.createElement('button');
    el.className = 'day' + (date === today ? ' today' : '') + (date === sel ? ' sel' : '')
      + (dow === 0 ? ' sun' : dow === 6 ? ' sat' : '') + (list.length ? ' has' : '');
    el.setAttribute('aria-label', `${m + 1}월 ${d}일${list.length ? `, 스티커 ${count}개` : ''}`);

    let html = `<span class="num">${d}</span>`;
    if (list.length) {
      // 병/캔 하나당 스티커 하나 (최대 3개)
      const icons = list.flatMap((e) => Array(e.qty).fill(e.type));
      html += `<div class="stickers">${icons.slice(0, 3).map(sticker).join('')}</div>`;
      if (icons.length > 3) html += `<span class="more">+${icons.length - 3}</span>`;
      const types = new Set(list.map((e) => e.type));
      if (types.size === 1) {
        const total = list.map(shareOf).reduce(addFrac);
        html += `<span class="amt">${fmtFrac(total)}${DRINKS[list[0].type].unit}</span>`;
      }
    }
    el.innerHTML = html;
    // 한 번 누르면 그 날짜 선택, 선택된 날을 또 누르면 상세 보기
    el.addEventListener('click', () => {
      if (sel === date) openSheet(date);
      else { sel = date; renderAll(); }
    });
    grid.appendChild(el);
  }
  renderSummary();
}

function renderSummary() {
  const { y, m } = view;
  const prefix = `${y}-${pad(m + 1)}-`;
  const month = db.entries.filter((e) => e.date.startsWith(prefix));
  const drankDays = new Set(month.map((e) => e.date)).size;

  // 지나간 날 중 안 마신 날 = 쉰 날
  const t = new Date();
  const days = new Date(y, m + 1, 0).getDate();
  let elapsed = 0;
  if (y < t.getFullYear() || (y === t.getFullYear() && m < t.getMonth())) elapsed = days;
  else if (y === t.getFullYear() && m === t.getMonth()) elapsed = t.getDate();
  const pastDrank = new Set(month.filter((e) => e.date <= todayStr()).map((e) => e.date)).size;
  const restDays = Math.max(0, elapsed - pastDrank);

  const byType = {};
  for (const e of month) byType[e.type] = byType[e.type] ? addFrac(byType[e.type], shareOf(e)) : shareOf(e);

  const rows = Object.keys(DRINKS).filter((k) => byType[k]).map((k) => `
    <div class="row">${sticker(k)}<div><b>${fmtFrac(byType[k])}${DRINKS[k].unit}</b><small>${DRINKS[k].name}</small></div></div>`).join('');

  const lead = month.length
    ? '이번 달 내 몫만 모아봤어요 (나눠 마신 건 1/n로 계산)'
    : '아직 붙인 스티커가 없어요. 아래 술병을 톡 누르면 바로 붙어요 🌱';

  $('summary').innerHTML = `
    <h2>${m + 1}월 스티커 모음</h2>
    <p class="lead">${lead}</p>
    ${rows ? `<div class="rows">${rows}</div>` : ''}
    <div class="badges">
      <span class="badge">🥂 즐긴 날 ${drankDays}일</span>
      ${elapsed ? `<span class="badge rest">🌱 쉬어간 날 ${restDays}일</span>` : ''}
    </div>`;
}

/* ---------- 빠른 기록: 한 번 누르면 한 병 ---------- */

function renderQuick() {
  const isToday = sel === todayStr();
  $('quickDate').innerHTML = `${dateLabel(sel)}${isToday ? ' <em>오늘</em>' : ''}`;
  $('peopleLbl').textContent = people === 1 ? '혼자' : `${people}명이서`;
  const list = entriesOn(sel);
  $('quickTypes').innerHTML = Object.entries(DRINKS).map(([k, d]) => {
    const mine = list.filter((e) => e.type === k);
    const badge = mine.length ? `<span class="cnt">${fmtFrac(mine.map(shareOf).reduce(addFrac))}</span>` : '';
    return `<button class="qt" data-type="${k}" aria-label="${d.name} 1${d.unit} 붙이기">${badge}${sticker(k)}<span>${d.name}</span></button>`;
  }).join('');
}

// 같은 날·같은 술·같은 인원은 한 기록으로 합쳐서 수량만 올립니다.
function addOne(date, type, n) {
  let e = db.entries.find((x) => x.date === date && x.type === type && x.people === n);
  if (e) e.qty++;
  else {
    e = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), date, type, qty: 1, people: n, memo: '' };
    db.entries.push(e);
  }
  save();
  return e.id;
}

function removeOne(id) {
  const e = db.entries.find((x) => x.id === id);
  if (!e) return;
  if (--e.qty <= 0) db.entries = db.entries.filter((x) => x !== e);
  save();
}

$('quickTypes').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-type]');
  if (!b) return;
  const type = b.dataset.type, d = DRINKS[type];
  const id = addOne(sel, type, people);
  renderAll();
  const tile = $('quickTypes').querySelector(`[data-type="${type}"]`);
  tile.classList.add('bump');
  if (navigator.vibrate) navigator.vibrate(15);
  toast(`${d.name} ${fmtFrac(frac(1, people))}${d.unit} 쏙!`, () => { removeOne(id); renderAll(); });
});

$('pMinus').onclick = () => { people = Math.max(1, people - 1); renderQuick(); };
$('pPlus').onclick = () => { people = Math.min(30, people + 1); renderQuick(); };

/* ---------- 상세 시트: 고치기 · 메모 ---------- */

function openSheet(date) {
  openDate = date;
  $('sheetTitle').textContent = dateLabel(date);
  $('cheer').textContent = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  $('memo').value = db.memos[date] || '';
  renderEntries();
  $('backdrop').hidden = false; $('sheet').hidden = false;
}

function closeSheet() {
  $('backdrop').hidden = true; $('sheet').hidden = true; openDate = null;
}

function renderEntries() {
  const list = entriesOn(openDate);
  const ul = $('entries');
  if (!list.length) {
    ul.innerHTML = '<li class="nothing">아직 스티커가 없어요. 아래 술병을 눌러 붙여보세요</li>';
    return;
  }
  ul.innerHTML = list.map((e) => {
    const d = DRINKS[e.type] || DRINKS.etc;
    const how = e.people > 1 ? `${e.qty}${d.unit}을 ${e.people}명이서` : '혼자서';
    return `<li>${sticker(e.type)}
      <div class="info"><b>${d.name} ${fmtFrac(shareOf(e))}${d.unit}</b>
      <small>${how}${e.memo ? ' · ' + escapeHtml(e.memo) : ''}</small></div>
      <button class="mini" data-act="dec" data-id="${e.id}" aria-label="하나 빼기">−</button>
      <button class="mini" data-act="inc" data-id="${e.id}" aria-label="하나 더">+</button></li>`;
  }).join('');
}

$('entries').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-act]');
  if (!b) return;
  if (b.dataset.act === 'inc') { db.entries.find((x) => x.id === b.dataset.id).qty++; save(); }
  else removeOne(b.dataset.id);
  renderAll();
});

$('memo').addEventListener('input', () => {
  const v = $('memo').value.trim();
  if (v) db.memos[openDate] = v; else delete db.memos[openDate];
  save();
});

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let toastTimer;
function toast(msg, undo) {
  document.querySelector('.toast')?.remove();
  clearTimeout(toastTimer);
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  if (undo) {
    const b = document.createElement('button');
    b.textContent = '되돌리기';
    b.onclick = () => { undo(); t.remove(); };
    t.appendChild(b);
  }
  document.body.appendChild(t);
  toastTimer = setTimeout(() => t.remove(), undo ? 3000 : 1800);
}

/* ---------- 이벤트 ---------- */

$('prev').onclick = () => { view.m--; if (view.m < 0) { view.m = 11; view.y--; } renderCalendar(); };
$('next').onclick = () => { view.m++; if (view.m > 11) { view.m = 0; view.y++; } renderCalendar(); };
$('title').onclick = () => { const t = new Date(); view = { y: t.getFullYear(), m: t.getMonth() }; sel = todayStr(); renderAll(); };
$('backdrop').onclick = closeSheet;
$('closeSheet').onclick = closeSheet;
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openDate) closeSheet(); });

// 파일로 저장하고, 파일 저장이 막힌 곳(앱 안 미리보기 등)을 위해 클립보드에도 복사합니다.
$('exportBtn').onclick = () => {
  const json = JSON.stringify(db, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `alcohol-calendar-${todayStr()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  navigator.clipboard?.writeText(json)
    .then(() => toast('백업을 저장하고 클립보드에도 복사했어요'))
    .catch(() => toast('백업 파일을 저장했어요'));
};

// 불러온 기록은 지금 기록과 합칩니다 (같은 기록은 한 번만).
function mergeBackup(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data.entries)) throw new Error('bad backup');
  const have = new Set(db.entries.map((e) => e.id));
  const fresh = data.entries.filter((e) => e && e.id && e.date && DRINKS[e.type] && !have.has(e.id));
  db.entries.push(...fresh);
  db.memos = { ...(data.memos || {}), ...db.memos };
  save(); renderAll();
  toast(`기록 ${fresh.length}개를 합쳤어요`);
}

$('importInput').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try { mergeBackup(await file.text()); }
  catch { toast('백업 파일을 읽지 못했어요'); }
  e.target.value = '';
};

// 복사해 둔 백업 텍스트를 화면에 붙여넣어도 불러옵니다.
document.addEventListener('paste', (e) => {
  if (openDate) return;
  const text = e.clipboardData?.getData('text') || '';
  if (!text.trim().startsWith('{')) return;
  try { mergeBackup(text); } catch { toast('붙여넣은 내용이 백업 형식이 아니에요'); }
});

renderAll();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

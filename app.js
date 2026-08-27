// ============================================================
// app.js — state, rendering, and the exercise timer runner.
// No build step, no dependencies. Everything lives in localStorage.
// ============================================================

const KEYS = {
  START: 'sb_program_start',
  LOG: 'sb_log',
  STARTER: 'sb_starter_checklist',
  SETTINGS: 'sb_settings',
  BEST_STREAK: 'sb_best_streak',
  REVIEWS: 'sb_reviews',
};

// ---------------- storage helpers ----------------
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full/unavailable */ }
}

function getLog() { return readJSON(KEYS.LOG, {}); }
function saveLog(log) { writeJSON(KEYS.LOG, log); }
function getSettings() { return readJSON(KEYS.SETTINGS, { sound: true, vibration: true }); }
function saveSettings(s) { writeJSON(KEYS.SETTINGS, s); }
function getStarter() { return readJSON(KEYS.STARTER, HOME_MODS_STARTER_CHECKLIST.map(() => false)); }
function saveStarter(arr) { writeJSON(KEYS.STARTER, arr); }
function getReviews() { return readJSON(KEYS.REVIEWS, {}); }
function saveReviews(r) { writeJSON(KEYS.REVIEWS, r); }
function getBestStreak() { return readJSON(KEYS.BEST_STREAK, 0); }
function saveBestStreak(n) { writeJSON(KEYS.BEST_STREAK, n); }

function getStartDate() {
  const s = localStorage.getItem(KEYS.START);
  if (s) return parseKey(s);
  const def = mondayOf(new Date());
  localStorage.setItem(KEYS.START, dateKey(def));
  return def;
}
function setStartDate(d) { localStorage.setItem(KEYS.START, dateKey(d)); }

// ---------------- date helpers ----------------
function dateKey(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseKey(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function mondayOf(d) {
  const nd = new Date(d);
  const day = nd.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nd.setDate(nd.getDate() + diff);
  nd.setHours(0, 0, 0, 0);
  return nd;
}
function addDays(d, n) { const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd; }
function isWeekendDow(dow) { return dow === 0 || dow === 6; }
function isFloorDow(dow) { return dow === 1 || dow === 3 || dow === 5; }

function countWeekdaysInclusive(from, to) {
  if (from > to) return 0;
  let c = 0;
  const d = new Date(from); d.setHours(0, 0, 0, 0);
  const end = new Date(to); end.setHours(0, 0, 0, 0);
  while (d <= end) {
    if (!isWeekendDow(d.getDay())) c++;
    d.setDate(d.getDate() + 1);
  }
  return c;
}

function getProgramInfo(today) {
  const dow = today.getDay();
  const isWeekend = isWeekendDow(dow);
  const start = getStartDate();
  const curMon = mondayOf(today);
  const startMon = mondayOf(start);
  const weeksElapsed = Math.round((curMon - startMon) / (7 * 86400000));
  const weekNumber = ((weeksElapsed % 4) + 4) % 4;
  const dayInWeek = isWeekend ? null : dow - 1; // 0=Mon..4=Fri
  const isFloorDay = isFloorDow(dow);
  const isFriday = dow === 5;
  const dayNumber = Math.max(0, countWeekdaysInclusive(start, today));
  return { isWeekend, weekNumber, dayInWeek, isFloorDay, isFriday, dateKey: dateKey(today), dayNumber };
}

// ---------------- completion logic ----------------
function coreDoneForEntry(entry, isFloorDay) {
  if (!entry) return false;
  return !!(entry.coreSeated && (isFloorDay ? entry.coreFloor : true));
}
function isDayFullyDone(entry, dow) {
  if (!entry) return false;
  return coreDoneForEntry(entry, isFloorDow(dow)) && !!entry.powerbi && !!entry.homemods;
}

function computeCurrentStreak(log, today) {
  let count = 0;
  const todayEntry = log[dateKey(today)];
  if (isDayFullyDone(todayEntry, today.getDay())) count++;
  let d = addDays(today, -1);
  while (true) {
    const dow = d.getDay();
    if (isWeekendDow(dow)) { d = addDays(d, -1); continue; }
    const entry = log[dateKey(d)];
    if (isDayFullyDone(entry, dow)) { count++; d = addDays(d, -1); }
    else break;
  }
  return count;
}

function computeTotals(log) {
  let core = 0, powerbi = 0, homemods = 0, activeDays = 0;
  Object.keys(log).forEach((k) => {
    const entry = log[k];
    if (!entry) return;
    const d = parseKey(k);
    const dow = d.getDay();
    if (isWeekendDow(dow)) return;
    if (coreDoneForEntry(entry, isFloorDow(dow))) core++;
    if (entry.powerbi) powerbi++;
    if (entry.homemods) homemods++;
    if (entry.coreSeated || entry.coreFloor || entry.powerbi || entry.homemods) activeDays++;
  });
  return { core, powerbi, homemods, activeDays };
}

// ---------------- header ----------------
function updateHeader() {
  const today = new Date();
  const info = getProgramInfo(today);
  const log = getLog();
  const entry = log[info.dateKey] || {};

  document.getElementById('dateBadge').textContent = today.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  const corePct = info.isWeekend ? 0 : (() => {
    const total = info.isFloorDay ? 2 : 1;
    const done = (entry.coreSeated ? 1 : 0) + (info.isFloorDay && entry.coreFloor ? 1 : 0);
    return Math.round((done / total) * 100);
  })();
  document.getElementById('gaugeCore').style.width = corePct + '%';
  document.getElementById('gaugePowerbi').style.width = (!info.isWeekend && entry.powerbi ? 100 : 0) + '%';
  document.getElementById('gaugeHomemods').style.width = (!info.isWeekend && entry.homemods ? 100 : 0) + '%';

  const streak = computeCurrentStreak(log, today);
  const best = Math.max(getBestStreak(), streak);
  saveBestStreak(best);

  const readout = info.isWeekend
    ? `DAY <b>${info.dayNumber}</b> · WEEKEND · STREAK <b>${streak}</b>`
    : `DAY <b>${info.dayNumber}</b> · WK <b>${info.weekNumber + 1}/4</b> · STREAK <b>${streak}</b>`;
  document.getElementById('statReadout').innerHTML = readout;
}

// ---------------- toggling entries ----------------
function toggleField(field) {
  const today = new Date();
  const dk = dateKey(today);
  const log = getLog();
  if (!log[dk]) log[dk] = {};
  log[dk][field] = !log[dk][field];
  saveLog(log);
  updateHeader();
  render(currentTab);
}

// ============================================================
// TODAY VIEW
// ============================================================
function renderToday() {
  const view = document.getElementById('view');
  const today = new Date();
  const info = getProgramInfo(today);
  const log = getLog();
  const entry = log[info.dateKey] || {};

  if (info.isWeekend) {
    view.innerHTML = `
      <div class="card track-neutral rest-card">
        <div class="big">Weekend — open</div>
        <p>Nothing's scheduled. Rest, or use the time for a bigger home-mods push if you've got it in you. Plan resumes Monday.</p>
      </div>`;
    return;
  }

  const arcWeek = POWERBI_ARC[info.weekNumber];
  const dayPlan = arcWeek.days[info.dayInWeek];
  const book = BOOKS[dayPlan.reading.book];
  const homeTask = HOME_MODS_ADMIN[info.dayInWeek];
  const starter = getStarter();
  const starterRemaining = starter.filter((v) => !v).length;

  const coreSeatedDone = !!entry.coreSeated;
  const coreFloorDone = !!entry.coreFloor;

  let html = '';

  // ---- Core Strength ----
  html += `<div class="section-label">Core Strength</div>`;
  html += `<div class="card track-core">
    <div class="card-head">
      <div>
        <div class="card-title">Seated Block</div>
        <div class="card-meta">10 min · every weekday</div>
      </div>
      <span class="check-pill ${coreSeatedDone ? 'done' : ''}">${coreSeatedDone ? '✓ Done' : '7 exercises'}</span>
    </div>
    <button class="btn primary core" data-action="open-runner" data-block="seated">${coreSeatedDone ? 'Redo Seated Block' : 'Start Seated Block'}</button>
  </div>`;

  if (info.isFloorDay) {
    html += `<div class="card track-core">
      <div class="card-head">
        <div>
          <div class="card-title">Floor Block</div>
          <div class="card-meta">~12 min · Mon / Wed / Fri</div>
        </div>
        <span class="check-pill ${coreFloorDone ? 'done' : ''}">${coreFloorDone ? '✓ Done' : '6 exercises'}</span>
      </div>
      <button class="btn primary core" data-action="open-runner" data-block="floor">${coreFloorDone ? 'Redo Floor Block' : 'Start Floor Block'}</button>
    </div>`;
  }

  // ---- Power BI ----
  html += `<div class="section-label">Power BI — ${arcWeek.topic}</div>`;
  html += `<div class="card track-powerbi">
    <div class="card-head">
      <div>
        <div class="card-title">${escapeHtml(dayPlan.concept)}</div>
        <div class="card-meta">45 min</div>
      </div>
      <span class="check-pill ${entry.powerbi ? 'done powerbi' : ''}">${entry.powerbi ? '✓ Done' : 'Open'}</span>
    </div>
    <div class="card-body"><p><strong>Apply it:</strong> ${escapeHtml(dayPlan.apply)}</p></div>
    <div class="reading-ref">
      <div class="book-title">${escapeHtml(book.title)}</div>
      <div class="book-meta">${escapeHtml(book.authors)} · ${escapeHtml(book.edition)} · Ch. ${dayPlan.reading.chapter} — ${escapeHtml(dayPlan.reading.chapterTitle)}</div>
    </div>
    <button class="btn ${entry.powerbi ? 'ghost' : 'primary powerbi'}" data-action="toggle" data-field="powerbi">${entry.powerbi ? 'Mark Incomplete' : 'Mark Session Complete'}</button>
  </div>`;

  // ---- Home Mods ----
  html += `<div class="section-label">Home Accessibility</div>`;
  html += `<div class="card track-homemods">
    <div class="card-head">
      <div>
        <div class="card-title">${escapeHtml(homeTask.task)}</div>
        <div class="card-meta">15 min</div>
      </div>
      <span class="check-pill ${entry.homemods ? 'done homemods' : ''}">${entry.homemods ? '✓ Done' : 'Open'}</span>
    </div>
    <div class="card-body"><p>${escapeHtml(homeTask.detail)}</p></div>
    ${starterRemaining > 0 ? starterChecklistHtml(starter) : ''}
    <button class="btn ${entry.homemods ? 'ghost' : 'primary homemods'}" data-action="toggle" data-field="homemods">${entry.homemods ? 'Mark Incomplete' : 'Mark Complete'}</button>
  </div>`;

  // ---- Friday review ----
  if (info.isFriday) {
    const weekKey = dateKey(mondayOf(today));
    const reviews = getReviews();
    const val = reviews[weekKey] || '';
    html += `<div class="section-label">Friday Review</div>`;
    html += `<div class="card track-neutral">
      <div class="card-title" style="margin-bottom:8px;">Three questions</div>
      <div class="card-body">
        <p>1. What Power BI concept clicked this week?</p>
        <p>2. What's the next <em>concrete</em> home-mods action?</p>
        <p>3. Did the core routine feel sustainable?</p>
      </div>
      <textarea class="review-box" data-action="review-input" data-weekkey="${weekKey}" placeholder="Jot a few lines...">${escapeHtml(val)}</textarea>
      <button class="btn ${entry.fridayReview ? 'ghost' : 'primary'}" data-action="toggle" data-field="fridayReview">${entry.fridayReview ? '✓ Reviewed' : 'Mark Reviewed'}</button>
    </div>`;
  }

  view.innerHTML = html;
}

function starterChecklistHtml(starter) {
  let items = HOME_MODS_STARTER_CHECKLIST.map((label, i) => `
    <div class="checklist-item ${starter[i] ? 'checked' : ''}">
      <input type="checkbox" data-action="starter" data-idx="${i}" ${starter[i] ? 'checked' : ''}>
      <span>${escapeHtml(label)}</span>
    </div>`).join('');
  return `<div class="card-meta" style="margin:12px 0 4px;">ONE-TIME STARTER CHECKLIST</div>${items}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ============================================================
// HISTORY VIEW
// ============================================================
function renderHistory() {
  const view = document.getElementById('view');
  const today = new Date();
  const log = getLog();
  const streak = computeCurrentStreak(log, today);
  const best = Math.max(getBestStreak(), streak);
  const totals = computeTotals(log);

  let html = `<div class="section-label">Streaks</div>
  <div class="stat-grid">
    <div class="stat-box"><div class="num">${streak}</div><div class="lbl">Current</div></div>
    <div class="stat-box"><div class="num">${best}</div><div class="lbl">Best</div></div>
    <div class="stat-box"><div class="num">${totals.activeDays}</div><div class="lbl">Active Days</div></div>
  </div>
  <div class="section-label">Totals</div>
  <div class="stat-grid">
    <div class="stat-box"><div class="num">${totals.core}</div><div class="lbl">Core</div></div>
    <div class="stat-box"><div class="num">${totals.powerbi}</div><div class="lbl">Power BI</div></div>
    <div class="stat-box"><div class="num">${totals.homemods}</div><div class="lbl">Home Mods</div></div>
  </div>
  <div class="section-label">Last 14 Weekdays</div>`;

  let rows = '';
  let d = new Date(today);
  let collected = 0;
  while (collected < 14) {
    const dow = d.getDay();
    if (!isWeekendDow(dow)) {
      const entry = log[dateKey(d)];
      const coreOn = coreDoneForEntry(entry, isFloorDow(dow));
      const pbiOn = !!(entry && entry.powerbi);
      const hmOn = !!(entry && entry.homemods);
      rows += `<div class="day-row">
        <span class="day-date">${d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })}</span>
        <div class="dot-row">
          <span class="dot ${coreOn ? 'on core' : ''}" title="Core"></span>
          <span class="dot ${pbiOn ? 'on powerbi' : ''}" title="Power BI"></span>
          <span class="dot ${hmOn ? 'on homemods' : ''}" title="Home Mods"></span>
        </div>
      </div>`;
      collected++;
    }
    d = addDays(d, -1);
  }
  html += rows;
  view.innerHTML = html;
}

// ============================================================
// SETTINGS VIEW
// ============================================================
function renderSettings() {
  const view = document.getElementById('view');
  const start = getStartDate();
  const settings = getSettings();

  view.innerHTML = `
    <div class="section-label">Program</div>
    <div class="field">
      <label for="startDateInput">Program start date (anchors the 4-week reading arc)</label>
      <input type="date" id="startDateInput" value="${dateKey(start)}">
    </div>

    <div class="section-label">Timer Alerts</div>
    <div class="toggle-row">
      <span>Sound</span>
      <label class="switch"><input type="checkbox" id="soundToggle" ${settings.sound ? 'checked' : ''}><span class="track"></span></label>
    </div>
    <div class="toggle-row">
      <span>Vibration</span>
      <label class="switch"><input type="checkbox" id="vibrationToggle" ${settings.vibration ? 'checked' : ''}><span class="track"></span></label>
    </div>

    <div class="section-label">Data</div>
    <button class="btn danger" id="resetBtn">Reset Progress</button>

    <div class="about-block">
      This plan is a starting structure — adjust as needed. For the core routine specifically: getting it fine-tuned by a physical therapist familiar with MS is worth the two or three sessions, especially for spotting compensation patterns a screen can't see.
    </div>
  `;

  document.getElementById('startDateInput').addEventListener('change', (e) => {
    if (!e.target.value) return;
    setStartDate(parseKey(e.target.value));
    updateHeader();
  });
  document.getElementById('soundToggle').addEventListener('change', (e) => {
    const s = getSettings(); s.sound = e.target.checked; saveSettings(s);
  });
  document.getElementById('vibrationToggle').addEventListener('change', (e) => {
    const s = getSettings(); s.vibration = e.target.checked; saveSettings(s);
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Reset all logged progress, streaks, and checklist state? Your start date and alert settings are kept.')) {
      writeJSON(KEYS.LOG, {});
      writeJSON(KEYS.STARTER, HOME_MODS_STARTER_CHECKLIST.map(() => false));
      writeJSON(KEYS.REVIEWS, {});
      writeJSON(KEYS.BEST_STREAK, 0);
      updateHeader();
      render(currentTab);
    }
  });
}

// ============================================================
// VIEW SWITCHING
// ============================================================
let currentTab = 'today';
function render(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
  if (tab === 'today') renderToday();
  else if (tab === 'history') renderHistory();
  else if (tab === 'settings') renderSettings();
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const action = t.dataset.action;
  if (action === 'toggle') toggleField(t.dataset.field);
  else if (action === 'open-runner') openRunner(t.dataset.block);
  else if (action === 'starter') {
    const idx = Number(t.dataset.idx);
    const starter = getStarter();
    starter[idx] = !starter[idx];
    saveStarter(starter);
    render(currentTab);
  }
});
document.addEventListener('input', (e) => {
  if (e.target.dataset && e.target.dataset.action === 'review-input') {
    const reviews = getReviews();
    reviews[e.target.dataset.weekkey] = e.target.value;
    saveReviews(reviews);
  }
});

document.querySelectorAll('.tab').forEach((btn) => {
  btn.addEventListener('click', () => render(btn.dataset.tab));
});

// ============================================================
// EXERCISE RUNNER
// ============================================================
let runnerState = null;
let runnerTimerId = null;

function openRunner(blockKey) {
  const exercises = blockKey === 'seated' ? CORE_SEATED : CORE_FLOOR;
  runnerState = { blockKey, exercises, idx: 0, currentRep: 1, repPhase: 'ready', timeLeft: 0, holdMs: 0, startTs: 0 };
  document.getElementById('runner').classList.remove('hidden');
  renderRunner();
}

function closeRunner(markIncomplete) {
  clearInterval(runnerTimerId);
  runnerTimerId = null;
  runnerState = null;
  document.getElementById('runner').classList.add('hidden');
  updateHeader();
  render(currentTab);
}

function currentExercise() { return runnerState.exercises[runnerState.idx]; }

function startHoldRep() {
  const ex = currentExercise();
  runnerState.repPhase = 'counting';
  runnerState.holdMs = ex.holdSeconds * 1000;
  runnerState.timeLeft = runnerState.holdMs;
  runnerState.startTs = Date.now();
  renderRunner();
  clearInterval(runnerTimerId);
  runnerTimerId = setInterval(() => {
    const elapsed = Date.now() - runnerState.startTs;
    const remaining = Math.max(0, runnerState.holdMs - elapsed);
    runnerState.timeLeft = remaining;
    if (remaining <= 0) {
      clearInterval(runnerTimerId);
      runnerTimerId = null;
      onHoldComplete();
    } else {
      updateRingOnly();
    }
  }, 100);
}

function onHoldComplete() {
  playBeep();
  doVibrate();
  runnerState.repPhase = 'repDone';
  renderRunner();
}

function nextRep() {
  runnerState.currentRep++;
  runnerState.repPhase = 'ready';
  startHoldRep();
}

function goNextExercise() {
  clearInterval(runnerTimerId);
  runnerTimerId = null;
  runnerState.idx++;
  runnerState.currentRep = 1;
  runnerState.repPhase = 'ready';
  if (runnerState.idx >= runnerState.exercises.length) finishBlock();
  else renderRunner();
}

function finishBlock() {
  const today = new Date();
  const dk = dateKey(today);
  const log = getLog();
  if (!log[dk]) log[dk] = {};
  if (runnerState.blockKey === 'seated') log[dk].coreSeated = true;
  else log[dk].coreFloor = true;
  saveLog(log);
  renderRunnerDone();
}

function updateRingOnly() {
  const ringTime = document.getElementById('ringTime');
  const ringFg = document.getElementById('ringFg');
  if (!ringTime || !ringFg) return;
  const ex = currentExercise();
  const secs = Math.ceil(runnerState.timeLeft / 1000);
  ringTime.textContent = secs;
  const pct = 1 - runnerState.timeLeft / (ex.holdSeconds * 1000);
  const circumference = 2 * Math.PI * 88;
  ringFg.style.strokeDasharray = `${circumference}`;
  ringFg.style.strokeDashoffset = `${circumference * (1 - pct)}`;
}

function renderRunnerDone() {
  const el = document.getElementById('runner');
  const label = runnerState.blockKey === 'seated' ? 'Seated Block' : 'Floor Block';
  el.innerHTML = `
    <div class="runner-top">
      <span class="runner-progress">${label}</span>
      <button class="runner-close" data-runner-close="1">✕</button>
    </div>
    <div class="runner-body done-screen">
      <div class="big-check">✓</div>
      <div class="runner-exname">Block complete</div>
      <div class="runner-cue">Nice work. Logged for today.</div>
    </div>
    <div class="runner-controls">
      <button class="btn primary core" data-runner-close="1">Back to Today</button>
    </div>
  `;
  el.querySelectorAll('[data-runner-close]').forEach((b) => b.addEventListener('click', () => closeRunner()));
}

function renderRunner() {
  const el = document.getElementById('runner');
  const ex = currentExercise();
  const total = runnerState.exercises.length;
  const label = runnerState.blockKey === 'seated' ? 'Seated Block' : 'Floor Block';
  const circumference = 2 * Math.PI * 88;

  let body = '';
  let controls = '';

  if (ex.type === 'reps') {
    body = `
      <div class="runner-exname">${escapeHtml(ex.name)}</div>
      <div class="runner-cue">${escapeHtml(ex.cue)}</div>
      <div class="reps-target">${ex.reps}${ex.sides ? ' / side' : ''}</div>
      <div class="reps-label">reps</div>
    `;
    controls = `<button class="btn primary core" data-runner-action="next-exercise">Mark Complete</button>`;
  } else {
    // hold type
    const secsShown = runnerState.repPhase === 'counting' ? Math.ceil(runnerState.timeLeft / 1000) : ex.holdSeconds;
    const offset = runnerState.repPhase === 'counting'
      ? circumference * (runnerState.timeLeft / (ex.holdSeconds * 1000))
      : 0;
    body = `
      <div class="runner-exname">${escapeHtml(ex.name)}</div>
      <div class="runner-cue">${escapeHtml(ex.cue)}</div>
      <div class="ring-wrap">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle class="ring-bg" cx="100" cy="100" r="88"></circle>
          <circle id="ringFg" class="ring-fg" cx="100" cy="100" r="88"
            style="stroke-dasharray:${circumference};stroke-dashoffset:${offset};"></circle>
        </svg>
        <div class="ring-center">
          <div class="ring-time" id="ringTime">${secsShown}</div>
          ${ex.reps > 1 ? `<div class="ring-rep">rep ${runnerState.currentRep} of ${ex.reps}</div>` : ''}
        </div>
      </div>
    `;
    if (runnerState.repPhase === 'ready') {
      controls = `<button class="btn primary core" data-runner-action="start-hold">Start Hold</button>`;
    } else if (runnerState.repPhase === 'counting') {
      controls = `<button class="btn ghost" disabled>Holding…</button>`;
    } else if (runnerState.repPhase === 'repDone') {
      controls = runnerState.currentRep < ex.reps
        ? `<button class="btn primary core" data-runner-action="next-rep">Next Rep</button>`
        : `<button class="btn primary core" data-runner-action="next-exercise">Continue</button>`;
    }
  }

  el.innerHTML = `
    <div class="runner-top">
      <span class="runner-progress">${label} · ${runnerState.idx + 1} of ${total}</span>
      <button class="runner-close" data-runner-close="1">✕</button>
    </div>
    <div class="runner-body">${body}</div>
    <div class="runner-controls">${controls}</div>
  `;

  el.querySelectorAll('[data-runner-close]').forEach((b) => b.addEventListener('click', () => closeRunner()));
  const startBtn = el.querySelector('[data-runner-action="start-hold"]');
  if (startBtn) startBtn.addEventListener('click', startHoldRep);
  const nextRepBtn = el.querySelector('[data-runner-action="next-rep"]');
  if (nextRepBtn) nextRepBtn.addEventListener('click', nextRep);
  const nextExBtn = el.querySelector('[data-runner-action="next-exercise"]');
  if (nextExBtn) nextExBtn.addEventListener('click', goNextExercise);
}

// ---------------- audio / haptics ----------------
function playBeep() {
  if (!getSettings().sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.4);
  } catch (e) { /* audio unavailable */ }
}
function doVibrate() {
  if (!getSettings().vibration) return;
  if (navigator.vibrate) navigator.vibrate([180, 80, 180]);
}

// ============================================================
// INIT
// ============================================================
getStartDate(); // ensure a default exists
updateHeader();
render('today');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}

/* ======== Simple clone helper ======== */
const clone = (o) => JSON.parse(JSON.stringify(o));

/* ======== Storage ======== */
const STORE_KEY = "wardy_qudrat_en_v1";
const defaultData = {
  xp: 0,
  coins: 0,
  streak: 0,
  lastStudyDate: null,
  tasks: {}, // { tabId: { dayIndex: { taskIndex: boolean } } }
};
const load = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || clone(defaultData); }
  catch { return clone(defaultData); }
};
const save = (data) => localStorage.setItem(STORE_KEY, JSON.stringify(data));
let state = load();

/* ======== UI Refs ======== */
const xpEl = document.getElementById("xp");
const coinsEl = document.getElementById("coins");
const streakEl = document.getElementById("streak");
const badgesEl = document.getElementById("badges");
const moodEl = document.getElementById("mood");

/* ======== Badges ======== */
function updateBadges(){
  badgesEl.innerHTML = "";
  const { xp } = state;
  const earned = [];
  if (xp >= 100) earned.push("🎀");
  if (xp >= 300) earned.push("👑");
  if (xp >= 600) earned.push("💎");
  earned.forEach(b => {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = b;
    badgesEl.appendChild(span);
  });
}

/* ======== Stats ======== */
function setStatsUI(){
  xpEl.textContent = state.xp;
  coinsEl.textContent = state.coins;
  streakEl.textContent = `${state.streak}🔥`;
  updateBadges();
}
setStatsUI();

/* ======== Streak ======== */
function markDailyStreak(){
  const today = new Date();
  const dStr = today.toISOString().slice(0,10);
  if (state.lastStudyDate === dStr) return; // already counted today
  if (state.lastStudyDate){
    const prev = new Date(state.lastStudyDate);
    const diffDays = Math.round((today - prev) / (1000*60*60*24));
    state.streak = (diffDays === 1) ? (state.streak + 1) : 1;
  } else {
    state.streak = 1;
  }
  state.lastStudyDate = dStr;
  // streak reward
  addXP(5);
  save(state);
  setStatsUI();
}

/* ======== Rewards helpers ======== */
function addXP(n){
  state.xp += n;
  save(state);
  setStatsUI();
}
function addCoins(n){
  state.coins += n;
  save(state);
  setStatsUI();
}
function celebrate(){
  const c = document.getElementById("confetti");
  c.style.display = "block";
  c.innerHTML = "";
  const emojis = ["🌸","✨","💖","🎀","💪","🌷","🎉","🩷"];
  const n = 50;
  for(let i=0;i<n;i++){
    const s = document.createElement("span");
    s.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    s.style.position="absolute";
    s.style.left = Math.random()*100+"%";
    s.style.top = "-10%";
    s.style.transition = `transform ${2+Math.random()*2}s linear, opacity .3s ease`;
    s.style.transform = `translateY(${110+Math.random()*30}vh) rotate(${Math.random()*360}deg)`;
    c.appendChild(s);
    setTimeout(()=>{ s.style.transform = `translateY(${110}vh)`; }, 20);
    setTimeout(()=>{ s.style.opacity = 0; }, 2200);
  }
  setTimeout(()=>{ c.style.display = "none"; c.innerHTML=""; }, 2800);
}

/* ======== Content: English + a sprinkle of Arabic ======== */
const content = {
  verbal: [
    {
      title: "Day 1 — Verbal (لفظي)",
      tasks: [
        "Vocabulary: 25 words (+ synonyms/antonyms)",
        "Analogies (تناظر): 20 questions",
        "Reading: 2 short passages + comprehension",
        "Quick grammar rules (همزات/plurals basics)",
        "Review today's mistakes"
      ]
    },
    {
      title: "Day 2 — Verbal (لفظي)",
      tasks: [
        "Vocabulary: 25 new words",
        "Analogies (تناظر): 25 questions",
        "Sentence completion: 20 questions",
        "One long comprehension passage",
        "Make flashcards (Anki/Quizlet)"
      ]
    },
    {
      title: "Day 3 — Verbal (لفظي)",
      tasks: [
        "Mini verbal test: 30 questions",
        "Analyze mistakes deeply",
        "Mixed vocab review: 30 words",
        "Read a short article",
        "Bullet-point summary"
      ]
    }
  ],
  quant: [
    {
      title: "Day 4 — Quant (كمي)",
      tasks: [
        "Ratios & percentages: 20 questions",
        "Average/median/range: 15 questions",
        "Word problems → equations",
        "Fast rules sheet (ratios/percents)",
        "Review mistakes"
      ]
    },
    {
      title: "Day 5 — Quant (كمي)",
      tasks: [
        "Algebra: equations/inequalities (25 questions)",
        "Basic functions & simple graphs",
        "Time/work/speed problems",
        "Summarize core algebra rules",
        "Short quiz: 15 questions"
      ]
    },
    {
      title: "Day 6 — Quant (كمي)",
      tasks: [
        "Geometry: area/perimeter/angles (25 questions)",
        "Circles & special triangles",
        "Similarity ratios",
        "10 challenge questions",
        "Error log + law flashcards"
      ]
    }
  ],
  review: [
    {
      title: "Day 7 — Review (مراجعة)",
      tasks: [
        "Error notebook (30 min)",
        "Verbal mixed: 25 questions",
        "Quant mixed: 25 questions",
        "List top weak points",
        "Breathing & relax 10 min"
      ]
    },
    {
      title: "Day 8 — Review (مراجعة)",
      tasks: [
        "Full mock test (60–80 Q)",
        "Review all solutions",
        "Tough vocab: 20 words",
        "Core quant laws (one sheet)",
        "Good sleep + hydrate"
      ]
    },
    {
      title: "Day 9 — Light Review (مراجعة)",
      tasks: [
        "Warm-up: 10 verbal + 10 quant",
        "Read your final notes",
        "Avoid brand-new hard Qs",
        "Prep test-day items (ID, pencils)",
        "Confidence (ثقة) — you got this!"
      ]
    }
  ]
};

/* ======== Build Checklists ======== */
function getTaskState(tabId, dayIdx){
  if(!state.tasks[tabId]) state.tasks[tabId] = {};
  if(!state.tasks[tabId][dayIdx]) state.tasks[tabId][dayIdx] = {};
  return state.tasks[tabId][dayIdx];
}
function buildTabPanel(tabId, panelEl, items){
  panelEl.innerHTML = "";
  items.forEach((day, dIdx)=>{
    const dayCard = document.createElement("div");
    dayCard.className = "day-card";

    const head = document.createElement("div");
    head.className = "day-head";

    const title = document.createElement("div");
    title.className = "day-title";
    title.textContent = day.title;

    const resetBtn = document.createElement("button");
    resetBtn.className = "reset-day";
    resetBtn.textContent = "Reset Day";
    resetBtn.addEventListener("click", ()=>{
      state.tasks[tabId][dIdx] = {};
      save(state);
      buildTabPanel(tabId, panelEl, items);
    });

    head.appendChild(title);
    head.appendChild(resetBtn);

    const counter = document.createElement("div");
    counter.className = "counter";

    const listFrag = document.createDocumentFragment();
    const dayState = getTaskState(tabId, dIdx);

    day.tasks.forEach((t, tIdx)=>{
      const row = document.createElement("div");
      row.className = "task";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!dayState[tIdx];

      const label = document.createElement("label");
      label.textContent = t;

      if (cb.checked){ row.classList.add("done"); }

      cb.addEventListener("change", ()=>{
        dayState[tIdx] = cb.checked;
        if (cb.checked){
          row.classList.add("done");
          addXP(2);       // per task
          addCoins(1);
          const all = day.tasks.length;
          const doneNow = Object.values(dayState).filter(Boolean).length;
          if (doneNow === all){
            addXP(10);    // daily bonus
            addCoins(3);
            celebrate();
            moodEl.textContent = "Bravo, ya وردي! Full day complete 🎉";
          }
        } else {
          row.classList.remove("done");
        }
        save(state);
        updateCounter();
      });

      row.appendChild(cb);
      row.appendChild(label);
      listFrag.appendChild(row);
    });

    function updateCounter(){
      const current = Object.values(dayState).filter(Boolean).length;
      counter.textContent = `Progress: ${current}/${day.tasks.length}`;
    }
    updateCounter();

    dayCard.appendChild(head);
    dayCard.appendChild(counter);
    dayCard.appendChild(listFrag);
    panelEl.appendChild(dayCard);
  });
}

buildTabPanel("verbal", document.getElementById("verbal"), content.verbal);
buildTabPanel("quant", document.getElementById("quant"), content.quant);
buildTabPanel("review", document.getElementById("review"), content.review);

/* ======== Tabs ======== */
document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(t=>{t.classList.remove("active"); t.setAttribute("aria-selected","false");});
    btn.classList.add("active"); btn.setAttribute("aria-selected","true");

    const id = btn.dataset.tab;
    document.querySelectorAll(".tabpanel").forEach(p=>{ p.hidden = true; p.classList.remove("active"); });
    const panel = document.getElementById(id);
    panel.hidden = false; panel.classList.add("active");
  });
});

/* ======== Timer ======== */
const displayEl = document.getElementById("timerDisplay");
const progressEl = document.getElementById("timerProgress");
const customRow = document.getElementById("customRow");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

let timerId = null;
let totalSecs = 25*60;
let remainSecs = totalSecs;
let workSecs = 25*60;
let breakSecs = 5*60;
let isWork = true;
let mode = "pomodoro";

function setMode(m){
  mode = m;
  if (m === "pomodoro"){ workSecs = 25*60; breakSecs = 5*60; customRow.hidden = true; }
  if (m === "deep"){ workSecs = 50*60; breakSecs = 10*60; customRow.hidden = true; }
  if (m === "custom"){
    customRow.hidden = false;
    const w = +document.getElementById("customWork").value || 30;
    const b = +document.getElementById("customBreak").value || 5;
    workSecs = w*60; breakSecs = b*60;
  }
  isWork = true;
  totalSecs = workSecs;
  remainSecs = totalSecs;
  updateDisplay();
}
function updateDisplay(){
  const m = Math.floor(remainSecs/60).toString().padStart(2,"0");
  const s = Math.floor(remainSecs%60).toString().padStart(2,"0");
  displayEl.textContent = `${m}:${s}`;
  const pct = 100*(1 - (remainSecs/totalSecs));
  progressEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}
function tick(){
  if (remainSecs > 0){ remainSecs--; updateDisplay(); return; }
  // session finished
  clearInterval(timerId); timerId = null;

  if (isWork){
    addXP(10); addCoins(2); celebrate(); markDailyStreak();
    moodEl.textContent = "Great work! خذي بريك لطيف 🌷";
    // switch to break
    isWork = false;
    totalSecs = breakSecs; remainSecs = totalSecs; updateDisplay();
  } else {
    moodEl.textContent = "Yalla نكمّل! 💪";
    isWork = true;
    totalSecs = workSecs; remainSecs = totalSecs; updateDisplay();
  }
}
function start(){
  if (timerId) return;
  timerId = setInterval(tick, 1000);
}
function pause(){
  clearInterval(timerId); timerId = null;
}
function reset(){
  pause();
  isWork = true;
  if (mode==="pomodoro"){ totalSecs = 25*60; }
  else if (mode==="deep"){ totalSecs = 50*60; }
  else {
    const w = +document.getElementById("customWork").value || 30;
    totalSecs = w*60;
  }
  remainSecs = totalSecs;
  updateDisplay();
  moodEl.textContent = "✨ Fresh start — دقائق قليلة تصنع فرقًا";
}

document.querySelectorAll(".chip[data-mode]").forEach(ch=>{
  ch.addEventListener("click", ()=> setMode(ch.dataset.mode));
});
document.getElementById("customWork").addEventListener("input", ()=> { if(mode==="custom"){ setMode("custom"); } });
document.getElementById("customBreak").addEventListener("input", ()=> { if(mode==="custom"){ setMode("custom"); } });
startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", pause);
resetBtn.addEventListener("click", reset);

// init
setMode("pomodoro");
updateDisplay();

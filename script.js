// ================== EDIT INI ==================
const CONFIG = {
  countdownStart: 3,

  texts: [
    "I LOVE U SAYANG 💗",
    "KAMU FAVORIT AKU ✨",
    "AKU KANGEN KAMU",
    "MAKASIH YA… 🤍"
  ],
  smallLine: "— dari aku, yang selalu pilih kamu",

  // Pixel LOVE size & speed
  cellSize: 16,          // ukuran 1 pixel kotak (naikin -> LOVE makin gede)
  spacing: 1,            // jarak antar pixel (0-2)
  attract: 0.008,        // makin kecil -> makin pelan
  damping: 0.88,         // makin besar -> lebih “berat”/smooth
  jitter: 0.10,          // kecil aja biar hidup tapi tetap rapi

  // Fireworks: 1x jumbo then a few small
  jumboCount: 260,
  jumboPowerMin: 3.2,
  jumboPowerMax: 9.8,
  jumboLifeMin: 90,
  jumboLifeMax: 140,

  smallBursts: 4,
  smallEveryMs: 520,
  smallCount: 52
};
// ==============================================

const $ = (q, el=document) => el.querySelector(q);

const canvas = $("#fx");
const ctx = canvas.getContext("2d", { alpha:true });

const bgFloat = $("#bgFloat");

const countEl = $("#count");
const bigTextEl = $("#bigText");
const smallTextEl = $("#smallText");

const overlay = $("#overlay");
const book = $("#book");
const openBookBtn = $("#openBookBtn");
const laterBookBtn = $("#laterBookBtn");
const closeBookBtn = $("#closeBookBtn");

function rand(min,max){ return Math.random()*(max-min)+min; }

function resize(){
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener("resize", resize);
resize();

// keep canvas empty until countdown done
function hardClear(){
  ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
}
hardClear();

// minimal bg floats (sedikit)
(function addBgItems(){
  if(!bgFloat) return;
  const items = [
    { txt:"🛩️", size:[18,26] },
    { txt:"🪐", size:[18,26] },
    { txt:"💗", size:[16,22] },
    { txt:"🌸", size:[16,22] },
  ];
  const total = 7;
  for(let i=0;i<total;i++){
    const it = document.createElement("div");
    it.className = "floatItem";
    const pick = items[(Math.random()*items.length)|0];
    it.textContent = pick.txt;
    it.style.fontSize = Math.floor(rand(pick.size[0], pick.size[1])) + "px";
    it.style.left = rand(5, 95) + "vw";
    it.style.top  = rand(8, 90) + "vh";
    it.style.opacity = rand(0.12, 0.23).toFixed(2);
    it.style.setProperty("--dur", `${rand(12, 22).toFixed(1)}s`);
    bgFloat.appendChild(it);
  }
})();

// ====== countdown (no effects besides number pulse)
let n = CONFIG.countdownStart;
function pulseCount(){
  countEl.classList.remove("pulse");
  void countEl.offsetWidth;
  countEl.classList.add("pulse");
}
function setCount(v){
  countEl.textContent = String(v);
  pulseCount();
}
setCount(n);

const cd = setInterval(() => {
  n -= 1;
  if(n >= 1){
    setCount(n);
    return;
  }
  setCount(1);
  setTimeout(() => {
    clearInterval(cd);
    afterCountdown();
  }, 900);
}, 1000);

// ====== cinematic text (no shake)
let textIndex = 0;
function showText(str, first=false){
  bigTextEl.textContent = str;
  bigTextEl.classList.remove("cineIn","cineSwap","glow");
  void bigTextEl.offsetWidth;
  bigTextEl.classList.add(first ? "cineIn" : "cineSwap", "glow");
}

// =====================================================
// PIXEL HEART PATTERN (outline hitam + pink + shading)
// mirip contoh gambar yang kamu kirim
// =====================================================

// Legend:
// 0 = empty
// 1 = outline (hitam)
// 2 = fill light pink
// 3 = shade darker pink (bagian kanan/bawah)
function pixelHeartGrid(){
  // grid 16x16 (bisa kamu ubah, tapi ini sudah “mirip” style contoh)
  // bentuknya sengaja blocky.
  const G = [
    [0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,1,2,2,1,0,0,0,1,2,2,1,0,0,0],
    [0,1,2,2,2,2,1,0,1,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,1,2,2,2,2,2,1,0,0],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [1,2,2,2,2,2,2,2,2,2,2,2,3,2,1,0],
    [0,1,2,2,2,2,2,2,2,2,2,3,3,1,0,0],
    [0,0,1,2,2,2,2,2,2,2,3,3,1,0,0,0],
    [0,0,0,1,2,2,2,2,2,3,3,1,0,0,0,0],
    [0,0,0,0,1,2,2,2,3,3,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,3,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,3,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    // sisa baris kosong biar tetap 16 tinggi
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ];
  return G;
}

function cellColor(v){
  if(v === 1) return "rgba(0,0,0,0.92)";          // outline hitam
  if(v === 2) return "rgba(255,170,200,0.95)";    // light pink
  if(v === 3) return "rgba(255,92,140,0.92)";     // darker shade
  return null;
}

// Convert grid -> target pixels centered at (cx, cy)
function pixelHeartTargets(cx, cy){
  const grid = pixelHeartGrid();
  const cell = CONFIG.cellSize;
  const sp = CONFIG.spacing;

  // ukur grid yang kepakai biar center rapi
  const rows = grid.length;
  const cols = grid[0].length;

  const w = cols * (cell + sp) - sp;
  const h = rows * (cell + sp) - sp;

  const startX = cx - w/2;
  const startY = cy - h/2;

  const targets = [];
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const v = grid[r][c];
      if(v === 0) continue;
      targets.push({
        x: startX + c*(cell+sp),
        y: startY + r*(cell+sp),
        c: cellColor(v),
        s: cell
      });
    }
  }

  // bikin “tebel banget” = duplikasi pixel di sekitar (bloom thickness)
  // tapi tetap pixel style (tetangga dekat saja).
  const thick = [];
  for(const t of targets){
    thick.push(t);
    // tambahkan beberapa neighbor biar terlihat padat
    if(Math.random() < 0.70) thick.push({ ...t, x: t.x + (cell+sp)*0.18, y: t.y });
    if(Math.random() < 0.70) thick.push({ ...t, x: t.x, y: t.y + (cell+sp)*0.18 });
    if(Math.random() < 0.45) thick.push({ ...t, x: t.x + (cell+sp)*0.18, y: t.y + (cell+sp)*0.18 });
  }

  return thick;
}

// Dots
const dots = [];
let animOn = false;

function initDots(targets){
  dots.length = 0;

  for(const t of targets){
    dots.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      tx: t.x,
      ty: t.y,
      vx: 0,
      vy: 0,
      c: t.c,
      s: t.s
    });
  }
}

function drawDots(){
  for(const p of dots){
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;

    p.vx = (p.vx + dx * CONFIG.attract) * CONFIG.damping;
    p.vy = (p.vy + dy * CONFIG.attract) * CONFIG.damping;

    // sedikit jitter biar “hidup”, tapi tetap rapi
    p.x += p.vx + rand(-CONFIG.jitter, CONFIG.jitter);
    p.y += p.vy + rand(-CONFIG.jitter, CONFIG.jitter);

    ctx.fillStyle = p.c;

    // pixel block (biar crisp, jangan blur)
    ctx.fillRect(p.x, p.y, p.s, p.s);

    // outline subtle highlight (bikin lebih “pixel art”)
    if(p.c.includes("0,0,0")) {
      // outline hitam: kasih 1px highlight tipis biar tajem
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(p.x + 1, p.y + 1, Math.max(1, p.s*0.18), Math.max(1, p.s*0.18));
      ctx.globalAlpha = 1;
    }
  }
}

// ====== Fireworks (jumbo then a few small)
const fw = [];

function addFirework(x, y, count, powerMin, powerMax, lifeMin, lifeMax){
  const colors = [
    "rgba(255,79,216,0.90)",
    "rgba(94,231,255,0.84)",
    "rgba(184,107,255,0.84)",
    "rgba(255,255,255,0.84)"
  ];
  for(let i=0;i<count;i++){
    const a = rand(0, Math.PI*2);
    const sp = rand(powerMin, powerMax);
    fw.push({
      x, y,
      vx: Math.cos(a)*sp,
      vy: Math.sin(a)*sp,
      life: rand(lifeMin, lifeMax),
      max: rand(lifeMin, lifeMax),
      c: colors[(Math.random()*colors.length)|0],
      r: rand(1.8, 2.9)
    });
  }
}

function drawFireworks(){
  for(let i=fw.length-1;i>=0;i--){
    const p = fw[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.045;
    p.vx *= 0.988;
    p.vy *= 0.988;
    p.life -= 1;

    ctx.globalAlpha = Math.max(0, p.life/(p.max || 120));
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = p.c;
    ctx.fill();
    ctx.globalAlpha = 1;

    if(p.life <= 0) fw.splice(i,1);
  }
}

// Loop (only after countdown)
function loop(){
  if(!animOn) return;

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(0,0,window.innerWidth, window.innerHeight);

  drawDots();
  drawFireworks();

  requestAnimationFrame(loop);
}

// After countdown

function afterCountdown(){
  document.body.classList.add("bg-romantic");
  countEl.classList.add("fadeOut");

  bigTextEl.classList.add("showText");
  smallTextEl.classList.add("showText");
  bigTextEl.setAttribute("aria-hidden","false");
  smallTextEl.setAttribute("aria-hidden","false");

  smallTextEl.textContent = CONFIG.smallLine;
  showText(CONFIG.texts[0], true);

  // Pixel LOVE (style contoh)
  const cx = window.innerWidth/2;
  const cy = window.innerHeight*0.44;

  const targets = pixelHeartTargets(cx, cy);
  initDots(targets);

  animOn = true;
  loop();

  // JUMBO fireworks 1x
  setTimeout(() => {
    addFirework(
      window.innerWidth/2,
      window.innerHeight*0.28,
      CONFIG.jumboCount,
      CONFIG.jumboPowerMin,
      CONFIG.jumboPowerMax,
      CONFIG.jumboLifeMin,
      CONFIG.jumboLifeMax
    );
  }, 520);

  // setelah jumbo mereda -> small fireworks sedikit
  setTimeout(() => {
    for(let i=0;i<CONFIG.smallBursts;i++){
      setTimeout(() => {
        addFirework(
          rand(window.innerWidth*0.24, window.innerWidth*0.76),
          rand(window.innerHeight*0.18, window.innerHeight*0.52),
          CONFIG.smallCount,
          1.6, 4.4,
          45, 80
        );
      }, i*CONFIG.smallEveryMs);
    }
  }, 1900);

  // rotate text
  setInterval(() => {
    textIndex = (textIndex + 1) % CONFIG.texts.length;
    showText(CONFIG.texts[textIndex], false);
  }, 2600);

  // book prompt
  setTimeout(() => openOverlay(), 3600);
}

// Overlay + Book
function openOverlay(){
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden","false");
}
function closeOverlay(){
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden","true");
  book.classList.remove("open");
}

openBookBtn.addEventListener("click", () => book.classList.add("open"));
closeBookBtn.addEventListener("click", () => book.classList.remove("open"));
laterBookBtn.addEventListener("click", () => closeOverlay());

overlay.addEventListener("click", (e) => {
  const insidePrompt = e.target.closest(".prompt");
  const insideBook = e.target.closest(".bookWrap");
  if(!insidePrompt && !insideBook) closeOverlay();
});

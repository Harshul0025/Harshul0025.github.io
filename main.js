// ===== CONFIG: apna LinkedIn URL yahan daalo =====
const LINKEDIN_URL = "https://www.linkedin.com/in/harshul-saini-701057322/"; // e.g. "https://www.linkedin.com/in/your-id/"

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// LinkedIn button: hide if URL not set
const li = document.getElementById("linkedinLink");
if (LINKEDIN_URL) li.href = LINKEDIN_URL;
else li.style.display = "none";

// ===== 1. 3D particle globe in the hero =====
const canvas = document.getElementById("globe");
const ctx = canvas.getContext("2d");
let W, H, points = [];
let rotX = 0, rotY = 0;          // current rotation
let targetX = 0, targetY = 0;    // where mouse wants it to go

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// spread N points evenly on a sphere (Fibonacci sphere)
function makePoints(n) {
  points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    points.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r });
  }
}

function drawGlobe() {
  ctx.clearRect(0, 0, W, H);
  const R = Math.min(W, H) * 0.42;
  const cx = W / 2, cy = H / 2;

  // ease rotation toward the mouse + slow auto spin
  rotY += 0.0025;
  rotX += (targetX - rotX) * 0.05;
  const ry = rotY + targetY;

  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

  for (const p of points) {
    // rotate around Y then X
    let x = p.x * cosY - p.z * sinY;
    let z = p.x * sinY + p.z * cosY;
    let y = p.y * cosX - z * sinX;
    z = p.y * sinX + z * cosX;

    // simple perspective
    const scale = 2.2 / (2.2 + z);
    const sx = cx + x * R * scale;
    const sy = cy + y * R * scale;
    const depth = (1 - z) / 2; // 0 = back, 1 = front

    // front points cyan, back points pink
    ctx.fillStyle = depth > 0.5
      ? `rgba(0, 240, 255, ${0.25 + depth * 0.7})`
      : `rgba(255, 43, 214, ${0.1 + depth * 0.5})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.6 + depth * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!reduceMotion) requestAnimationFrame(drawGlobe);
}

resize();
makePoints(window.innerWidth < 700 ? 450 : 900);
drawGlobe();
window.addEventListener("resize", resize);

// ===== 2. Mouse: globe rotation + cursor glow =====
const glow = document.getElementById("cursor-glow");
window.addEventListener("mousemove", (e) => {
  targetY = (e.clientX / window.innerWidth - 0.5) * 1.2;
  targetX = (e.clientY / window.innerHeight - 0.5) * 0.8;
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

// ===== 3. Typing effect for roles =====
const roles = ["AI agent builder", "ML engineer", "full-stack developer", "hardware tinkerer", "hackathon person"];
const typed = document.getElementById("typed");
let roleIdx = 0, charIdx = 0, deleting = false;

function typeLoop() {
  const word = roles[roleIdx];
  typed.textContent = word.slice(0, charIdx);
  if (!deleting && charIdx < word.length) charIdx++;
  else if (deleting && charIdx > 0) charIdx--;
  else if (!deleting) { deleting = true; return setTimeout(typeLoop, 1400); }
  else { deleting = false; roleIdx = (roleIdx + 1) % roles.length; }
  setTimeout(typeLoop, deleting ? 40 : 80);
}
typeLoop();

// ===== 4. Scroll reveal + number counters =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("show");
    entry.target.querySelectorAll("[data-count]").forEach(countUp);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

function countUp(el) {
  const end = +el.dataset.count;
  let n = 0;
  const step = () => {
    n++;
    el.textContent = n;
    if (n < end) setTimeout(step, 900 / end);
  };
  step();
}

// ===== 5. Scroll progress bar =====
const bar = document.getElementById("progress");
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (window.scrollY / max) * 100 + "%";
});

// ===== 6. 3D tilt + spotlight on project cards =====
document.querySelectorAll(".tilt").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;   // 0..1
    const y = (e.clientY - r.top) / r.height;   // 0..1
    card.style.setProperty("--mx", x * 100 + "%");
    card.style.setProperty("--my", y * 100 + "%");
    if (!reduceMotion) {
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateY(-4px)`;
    }
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; });
});

// ===== 7. Magnetic buttons =====
document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    if (reduceMotion) return;
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
});

// ===== 8. Copy email + toast =====
const toast = document.getElementById("toast");
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}
const emailBtn = document.getElementById("copyEmail");
emailBtn.addEventListener("click", () => {
  const email = emailBtn.dataset.email;
  navigator.clipboard.writeText(email)
    .then(() => showToast("email copied ✓"))
    .catch(() => { window.location.href = "mailto:" + email; });
});

// ===== 9. Secret terminal (press ~) =====
const term = document.getElementById("terminal");
const termBody = document.getElementById("termBody");
const termInput = document.getElementById("termInput");

const commands = {
  help: "commands: <span class='acc'>about, projects, skills, contact, github, resume, sudo hire harshul, clear, exit</span>",
  about: "Harshul Saini · B.Tech CSE (2024–28) @ BML Munjal University.\nBuilds AI agents, ML models, full-stack apps & hardware.",
  projects: "inboxorcist · airdeck · resqcity-lite · travel-planner · fresh-vision · nifty-direction\n+ iot-monitor, one-stream, vendorsetu, cleanify, obstacle-car, o-dar",
  skills: "python java c++ js · tensorflow sklearn xgboost opencv · gemini adk langchain · next fastapi node · esp32 arduino",
  contact: "sainiharshul111@gmail.com",
  github: "opening github.com/Harshul0025 ...",
  resume: "resume coming soon. till then: sainiharshul111@gmail.com",
  "sudo hire harshul": "<span class='acc'>[sudo] permission granted.</span> 🚀 Excellent decision. Email: sainiharshul111@gmail.com",
  hire: "try: sudo hire harshul",
  ls: "about.txt  projects/  skills.json  contact.md  secret.txt",
  "cat secret.txt": "the globe on top follows your mouse. try it 👀",
  whoami: "a recruiter with great taste, probably",
};

function print(html) {
  termBody.innerHTML += html + "\n";
  termBody.scrollTop = termBody.scrollHeight;
}

function toggleTerm(open) {
  term.classList.toggle("open", open);
  term.setAttribute("aria-hidden", !open);
  if (open) {
    if (!termBody.innerHTML) print("welcome to harshul's terminal 👾\ntype <span class='acc'>help</span> to start.");
    setTimeout(() => termInput.focus(), 100);
  }
}

termInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const cmd = termInput.value.trim().toLowerCase();
  termInput.value = "";
  if (!cmd) return;
  print(`<span class='cmd'>$ ${cmd.replace(/</g, "&lt;")}</span>`);
  if (cmd === "clear") { termBody.innerHTML = ""; return; }
  if (cmd === "exit") { toggleTerm(false); return; }
  if (cmd === "github") window.open("https://github.com/Harshul0025", "_blank");
  print(commands[cmd] || `command not found: ${cmd.replace(/</g, "&lt;")} — type help`);
});

document.addEventListener("keydown", (e) => {
  const typing = document.activeElement === termInput;
  if ((e.key === "~" || e.key === "`") && !typing) { e.preventDefault(); toggleTerm(!term.classList.contains("open")); }
  if (e.key === "Escape") toggleTerm(false);
});
document.getElementById("openTerm").addEventListener("click", () => toggleTerm(true));
document.getElementById("closeTerm").addEventListener("click", () => toggleTerm(false));

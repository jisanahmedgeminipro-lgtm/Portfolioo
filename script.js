/* =============================================================
   JISAN AHMED — PREMIUM PORTFOLIO  ·  script.js
   Vanilla JS. No libraries. All interactions + advanced FX.
   ============================================================= */
(function () {
  "use strict";

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* =========================================================
     LOADER (animated %, then fade)
     ========================================================= */
  function initLoader() {
    const loader = $("#loader");
    if (!loader) return;
    const fill = $(".loader__fill", loader);
    const pct = $(".loader__pct", loader);
    let p = 0;
    const timer = setInterval(() => {
      p += Math.random() * 14 + 6;
      if (p >= 100) { p = 100; clearInterval(timer); finish(); }
      if (fill) fill.style.width = p + "%";
      if (pct) pct.textContent = Math.floor(p) + "%";
    }, 130);

    function finish() {
      setTimeout(() => {
        loader.classList.add("done");
        document.body.style.overflow = "";
        setTimeout(() => loader.remove(), 650);
      }, 350);
    }
    // safety
    setTimeout(() => { if (document.body.contains(loader)) { clearInterval(timer); finish(); } }, 4000);
  }

  /* =========================================================
     THEME CUSTOMIZER (localStorage)
     ========================================================= */
  function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme") || "dark";
    root.setAttribute("data-theme", saved);

    const btn = $("#theme-btn");
    const panel = $("#theme-panel");
    if (btn && panel) {
      btn.addEventListener("click", (e) => { e.stopPropagation(); panel.classList.toggle("open"); });
      document.addEventListener("click", (e) => {
        if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove("open");
      });
    }
    $$(".theme-opt").forEach((opt) => {
      opt.addEventListener("click", () => {
        const t = opt.getAttribute("data-theme-set");
        root.setAttribute("data-theme", t);
        localStorage.setItem("theme", t);
        if (panel) panel.classList.remove("open");
      });
    });
  }

  /* =========================================================
     NAVBAR: scroll state + hide/show + active link indicator
     ========================================================= */
  function initNavbar() {
    const navbar = $("#navbar");
    const links = $$(".nav-link");
    const indicator = $("#nav-indicator");
    let lastY = window.scrollY;

    function moveIndicator(el) {
      if (!indicator || !el) return;
      indicator.style.left = el.offsetLeft + "px";
      indicator.style.width = el.offsetWidth + "px";
    }

    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (navbar) {
        navbar.classList.toggle("scrolled", y > 24);
        if (Math.abs(y - lastY) > 8) {
          navbar.classList.toggle("hide", y > lastY && y > 240);
          lastY = y;
        }
      }
    }, { passive: true });

    // active section highlight
    const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const id = "#" + en.target.id;
          links.forEach((l) => {
            const on = l.getAttribute("href") === id;
            l.classList.toggle("active", on);
            if (on) moveIndicator(l);
          });
        }
      });
    }, { threshold: 0.5, rootMargin: "-20% 0px -40% 0px" });
    sections.forEach((s) => spy.observe(s));

    links.forEach((l) => l.addEventListener("mouseenter", () => moveIndicator(l)));
    const nav = $("#nav-links");
    if (nav) nav.addEventListener("mouseleave", () => {
      const active = links.find((l) => l.classList.contains("active"));
      moveIndicator(active);
    });
  }

  /* =========================================================
     MOBILE MENU
     ========================================================= */
  function initMobileMenu() {
    const burger = $("#hamburger");
    const menu = $("#mobile-menu");
    if (!burger || !menu) return;
    const close = () => {
      burger.classList.remove("open"); menu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false"); document.body.style.overflow = "";
    };
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".mobile-menu__links a", menu).forEach((a) => a.addEventListener("click", close));
  }

  /* =========================================================
     SCROLL PROGRESS BAR
     ========================================================= */
  function initScrollProgress() {
    const bar = $("#scroll-progress");
    if (!bar) return;
    window.addEventListener("scroll", () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }, { passive: true });
  }

  /* =========================================================
     CUSTOM CURSOR + MOUSE GLOW
     ========================================================= */
  function initCursor() {
    const dot = $("#cursor"), ring = $("#cursor-glow"), glow = $("#mouse-glow");
    if (!finePointer) { [dot, ring, glow].forEach((e) => e && (e.style.display = "none")); return; }
    document.body.classList.add("cursor-on");

    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
      if (glow) { glow.style.left = mx + "px"; glow.style.top = my + "px"; }
    });
    (function loop() {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      if (ring) { ring.style.left = rx + "px"; ring.style.top = ry + "px"; }
      requestAnimationFrame(loop);
    })();
    const sel = "a, button, .project, .glass-card, .filter, [data-tilt]";
    document.addEventListener("mouseover", (e) => { if (e.target.closest(sel) && ring) ring.classList.add("hover"); });
    document.addEventListener("mouseout", (e) => { if (e.target.closest(sel) && ring) ring.classList.remove("hover"); });
  }

  /* =========================================================
     HERO NAME REVEAL (letter by letter)
     ========================================================= */
  function initHeroName() {
    const el = $("#hero-name");
    if (!el) return;
    const text = el.getAttribute("data-text") || "";
    el.textContent = "";
    let d = 0;
    text.split("").forEach((c) => {
      const s = document.createElement("span");
      s.className = "ch"; s.textContent = c === " " ? "\u00A0" : c;
      s.style.animationDelay = d + "ms";
      el.appendChild(s);
      if (reduce) s.classList.add("in"); else requestAnimationFrame(() => s.classList.add("in"));
      d += 60;
    });
  }

  /* =========================================================
     TYPING ANIMATION
     ========================================================= */
  function initTyping() {
    const el = $("#typed");
    if (!el) return;
    const words = ["scalable web apps.", "clean REST APIs.", "premium UI/UX.", "full stack products."];
    let wi = 0, ci = 0, del = false;
    (function tick() {
      const w = words[wi];
      el.textContent = w.slice(0, del ? --ci : ++ci);
      if (!del && ci === w.length) { del = true; return setTimeout(tick, 1500); }
      if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
      setTimeout(tick, del ? 45 : 85);
    })();
  }

  /* =========================================================
     SCROLL REVEAL + skill bars + counters
     ========================================================= */
  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach((e) => e.classList.add("in"));
      $$(".bar").forEach(fillBar); $$("[data-count]").forEach(countUp); return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add("in");
        $$(".bar", el).forEach(fillBar);
        $$("[data-count]", el).forEach(countUp);
        if (el.matches(".bar")) fillBar(el);
        if (el.hasAttribute("data-count")) countUp(el);
        obs.unobserve(el);
      });
    }, { threshold: 0.18 });
    $$(".reveal, .bar, [data-count]").forEach((e) => io.observe(e));
  }
  function fillBar(bar) {
    const f = $(".bar__fill", bar), lvl = bar.getAttribute("data-level");
    if (f && lvl) f.style.width = lvl + "%";
  }
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    const target = parseFloat(el.getAttribute("data-count")) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = target + suffix; return; }
    const dur = 1500, start = performance.now();
    (function f(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(e * target) + suffix;
      if (p < 1) requestAnimationFrame(f); else el.textContent = target + suffix;
    })(start);
  }

  /* =========================================================
     PROJECT FILTER
     ========================================================= */
  function initFilters() {
    const filters = $$(".filter"), cards = $$(".project");
    filters.forEach((b) => b.addEventListener("click", () => {
      filters.forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      const f = b.getAttribute("data-filter");
      cards.forEach((c) => c.classList.toggle("hide", !(f === "all" || c.getAttribute("data-category") === f)));
    }));
  }

  /* =========================================================
     PROJECT MODAL
     ========================================================= */
  function initModal() {
    const modal = $("#modal");
    if (!modal) return;
    const title = $("#modal-title"), desc = $("#modal-desc"), tech = $("#modal-tech");
    const open = (card) => {
      title.textContent = card.getAttribute("data-title") || "Project";
      desc.textContent = card.getAttribute("data-desc") || "";
      tech.innerHTML = "";
      (card.getAttribute("data-tech") || "").split(",").filter(Boolean).forEach((t) => {
        const s = document.createElement("span"); s.textContent = t.trim(); tech.appendChild(s);
      });
      modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const close = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };
    $$(".project__more").forEach((b) => b.addEventListener("click", () => open(b.closest(".project"))));
    $("#modal-close").addEventListener("click", close);
    $("#modal-backdrop").addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* =========================================================
     GITHUB — LIVE DATA (public API, no auth, no database)
     Pulls real repos / stars / followers for @xisandurjoy.
     Runs in the visitor's browser, so the sandbox needs no net.
     ========================================================= */
  function initGitHub() {
    const USER = "xisandurjoy";
    const api = (path) => fetch("https://api.github.com" + path, { headers: { Accept: "application/vnd.github+json" } });

    // count-up helper to a real target
    function animateTo(el, target) {
      if (!el) return;
      target = Number(target) || 0;
      if (reduce) { el.textContent = target; return; }
      const dur = 1200, start = performance.now();
      (function f(now) {
        const p = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(e * target);
        if (p < 1) requestAnimationFrame(f); else el.textContent = target;
      })(start);
    }

    // 1) profile: repos / followers / following
    api("/users/" + USER)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        animateTo($("#gh-repos"), d.public_repos);
        animateTo($("#gh-followers"), d.followers);
        animateTo($("#gh-following"), d.following);
        animateTo($("#stat-repos"), d.public_repos);
      })
      .catch(() => fallback());

    // 2) repos: total stars + highlight cards
    api("/users/" + USER + "/repos?per_page=100&sort=updated")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((repos) => {
        if (!Array.isArray(repos)) return fallback();
        const stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
        animateTo($("#gh-stars"), stars);
        renderRepos(repos);
      })
      .catch(() => fallback());

    function renderRepos(repos) {
      const wrap = $("#gh-repos-list");
      if (!wrap) return;
      const top = repos
        .filter((r) => !r.fork)
        .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.pushed_at) - new Date(a.pushed_at)))
        .slice(0, 6);
      if (!top.length) { wrap.innerHTML = '<div class="gh-repo gh-repo--loading">No public repositories yet.</div>'; return; }
      wrap.innerHTML = top.map((r) => `
        <a class="gh-repo glass-card" href="${r.html_url}" target="_blank" rel="noopener">
          <span class="gh-repo__top"><i class="fa-regular fa-folder-open"></i> ${escapeHtml(r.name)}</span>
          <span class="gh-repo__desc">${escapeHtml(r.description || "No description provided.")}</span>
          <span class="gh-repo__meta">
            ${r.language ? `<span><i class="fa-solid fa-circle" style="color:var(--accent)"></i> ${escapeHtml(r.language)}</span>` : ""}
            <span><i class="fa-solid fa-star"></i> ${r.stargazers_count}</span>
            <span><i class="fa-solid fa-code-fork"></i> ${r.forks_count}</span>
          </span>
        </a>`).join("");
    }

    function fallback() {
      const wrap = $("#gh-repos-list");
      if (wrap && wrap.querySelector(".gh-repo--loading")) {
        wrap.innerHTML = `<a class="gh-repo gh-repo--loading" href="https://github.com/${USER}" target="_blank" rel="noopener">Couldn't load live data (GitHub rate limit) — view full profile on GitHub →</a>`;
      }
      ["#gh-repos", "#gh-stars", "#gh-followers", "#gh-following", "#stat-repos"].forEach((s) => {
        const el = $(s); if (el && el.textContent === "—") el.textContent = "—";
      });
    }
    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }
  }

  /* =========================================================
     3D TILT CARDS
     ========================================================= */
  function initTilt() {
    if (reduce || !finePointer) return;
    const MAX = 8;
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        const ry = (px - 0.5) * 2 * MAX, rx = (0.5 - py) * 2 * MAX;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* =========================================================
     MAGNETIC BUTTONS
     ========================================================= */
  function initMagnetic() {
    if (reduce || !finePointer) return;
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* =========================================================
     CONTACT FORM (spinner -> done)
     ========================================================= */
  function initForm() {
    const form = $("#contact-form"), btn = $("#c-submit");
    if (!form || !btn) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) return form.reportValidity();
      btn.classList.add("loading"); btn.disabled = true;
      setTimeout(() => {
        btn.classList.remove("loading"); btn.classList.add("done");
        setTimeout(() => { btn.classList.remove("done"); btn.disabled = false; form.reset(); }, 2200);
      }, 1500);
    });
  }

  /* =========================================================
     BACK TO TOP + smooth anchor scroll
     ========================================================= */
  function initBackToTop() {
    const btn = $("#back-to-top");
    if (!btn) return;
    window.addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 450), { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
  function initYear() { const y = $("#year"); if (y) y.textContent = new Date().getFullYear(); }

  /* =========================================================
     PARALLAX on hero orbs/visual
     ========================================================= */
  function initParallax() {
    if (reduce) return;
    const visual = $(".hero__visual");
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (visual && y < window.innerHeight) visual.style.transform = `translateY(${y * 0.08}px)`;
    }, { passive: true });
  }

  /* =========================================================
     ANIMATED PARTICLES BACKGROUND (fixed canvas)
     ========================================================= */
  function initParticles() {
    const canvas = $("#particles");
    if (!canvas) return;
    if (reduce) { canvas.style.display = "none"; return; }
    const ctx = canvas.getContext("2d");
    let w, h, dpr = Math.min(window.devicePixelRatio || 1, 2), pts = [], raf;
    const COUNT = window.innerWidth < 700 ? 28 : 60, LINK = 130;

    function size() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      pts = [];
      for (let n = 0; n < COUNT; n++) pts.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.6 + 0.8
      });
    }
    // read current primary color from CSS variable
    function brand() { return getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#6366f1"; }

    function draw() {
      const color = brand();
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.globalAlpha = 0.55; ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = color; ctx.globalAlpha = (1 - dist / LINK) * 0.16; ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    let t;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { dpr = Math.min(window.devicePixelRatio || 1, 2); size(); seed(); }, 200); });
    // pause when tab hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
      else if (!raf) draw();
    });
    size(); seed(); draw();
  }

  /* =========================================================
     FLOATING CHAT / MESSAGE WIDGET + TOAST
     --------------------------------------------------------
     No backend needed. Messages reach the owner via WhatsApp
     or Email. Fill in CONFIG below with real details.
     ========================================================= */
  const CHAT_CONFIG = {
    whatsapp: "8801956560391",           // owner's WhatsApp (country code, no +, no spaces)
    email: "jisan@example.com",          // used only if you re-enable the email option
    web3formsKey: ""                     // optional Web3Forms access key for in-page email send
  };

  function toast(msg, ok) {
    const t = $("#toast");
    if (!t) return;
    t.innerHTML = (ok === false ? '<i class="fa-solid fa-circle-exclamation" style="color:#f87171"></i>' : '<i class="fa-solid fa-circle-check"></i>') + " " + msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  function initChat() {
    const chat = $("#chat");
    if (!chat) return;
    const toggle = $("#chat-toggle"), close = $("#chat-close");
    const bubble = $("#chat-bubble"), bubbleX = $("#chat-bubble-x");
    const form = $("#chat-form"), nameEl = $("#chat-name"), msgEl = $("#chat-msg");

    function openChat() {
      chat.classList.add("open"); chat.classList.add("chat--read");
      if (bubble) bubble.classList.remove("show");
      setTimeout(() => msgEl && msgEl.focus(), 250);
    }
    function closeChat() { chat.classList.remove("open"); }

    toggle.addEventListener("click", () => chat.classList.contains("open") ? closeChat() : openChat());
    if (close) close.addEventListener("click", closeChat);
    if (bubble) bubble.addEventListener("click", (e) => { if (e.target !== bubbleX) openChat(); });
    if (bubbleX) bubbleX.addEventListener("click", (e) => { e.stopPropagation(); bubble.classList.remove("show"); });

    // auto-show greeting bubble after a few seconds (once per session)
    if (bubble && !sessionStorage.getItem("chatGreeted")) {
      setTimeout(() => { if (!chat.classList.contains("open")) bubble.classList.add("show"); }, 3500);
      sessionStorage.setItem("chatGreeted", "1");
    }

    function buildText() {
      const name = (nameEl.value || "").trim();
      const msg = (msgEl.value || "").trim();
      return (name ? `Hi Jisan, I'm ${name}. ` : "Hi Jisan! ") + msg;
    }

    // Send via WhatsApp (form submit — works on click + Enter)
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!msgEl.value.trim()) { msgEl.focus(); return toast("Please type a message first.", false); }
      const num = CHAT_CONFIG.whatsapp.replace(/[^0-9]/g, "");
      const url = "https://wa.me/" + num + "?text=" + encodeURIComponent(buildText());
      window.open(url, "_blank", "noopener");
      toast("Opening WhatsApp…");
      form.reset();
    });
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function boot() {
    document.body.style.overflow = "hidden"; // during loader
    initLoader();
    initTheme();
    initNavbar();
    initMobileMenu();
    initScrollProgress();
    initCursor();
    initHeroName();
    initTyping();
    initReveal();
    initFilters();
    initModal();
    initGitHub();
    initTilt();
    initMagnetic();
    initForm();
    initBackToTop();
    initYear();
    initParallax();
    initParticles();
    initChat();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

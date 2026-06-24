/* =============================================================
   MD JISAN AHMED — PORTFOLIO  ·  app.js
   RESPONSIBILITY: everything except the particle canvas.
   - Loader (sessionStorage)        - Custom cursor
   - Theme toggle (localStorage)    - Navbar scroll/hide-show
   - Mobile menu                    - Scroll progress bar
   - Hero name letter animation     - Typing role cycle
   - IntersectionObserver reveals   - Count-up numbers
   - Skill bar fill                 - Project filter + tilt
   - Achievement slide-ins          - Copy email
   - Contact form submit            - Back to top
   ============================================================= */

(function () {
  "use strict";

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     === LOADER (show once per session) ===
     ========================================================= */
  function initLoader() {
    const loader = $("#loader");
    if (!loader) return;

    if (sessionStorage.getItem("loaderShown")) {
      // Skip on subsequent navigations within the session
      loader.remove();
      return;
    }

    // Hide after the bar fills (~1.8s)
    window.addEventListener("load", function () {
      setTimeout(function () {
        loader.classList.add("is-done");
        sessionStorage.setItem("loaderShown", "1");
        setTimeout(() => loader.remove(), 700);
      }, 1800);
    });
    // Fallback if 'load' already fired
    setTimeout(function () {
      if (document.body.contains(loader) && !loader.classList.contains("is-done")) {
        loader.classList.add("is-done");
        sessionStorage.setItem("loaderShown", "1");
        setTimeout(() => loader.remove(), 700);
      }
    }, 3000);
  }

  /* =========================================================
     === THEME TOGGLE (localStorage) ===
     ========================================================= */
  function initTheme() {
    const toggle = $("#theme-toggle");
    const root = document.documentElement;
    const saved = localStorage.getItem("theme") || "dark";
    root.setAttribute("data-theme", saved);
    setToggleIcon(saved);

    if (!toggle) return;
    toggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      setToggleIcon(next);
    });

    function setToggleIcon(theme) {
      const icon = toggle ? toggle.querySelector("i") : null;
      if (!icon) return;
      icon.className = theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }
  }

  /* =========================================================
     === NAVBAR: frosted on scroll + hide-on-down/show-on-up ===
     ========================================================= */
  function initNavbar() {
    const navbar = $("#navbar");
    if (!navbar) return;
    let lastY = window.scrollY;

    window.addEventListener("scroll", function () {
      const y = window.scrollY;

      // frosted glass after slight scroll
      navbar.classList.toggle("is-scrolled", y > 30);

      // hide on scroll down, reveal on scroll up (ignore tiny moves)
      if (Math.abs(y - lastY) > 6) {
        if (y > lastY && y > 200) navbar.classList.add("is-hidden");
        else navbar.classList.remove("is-hidden");
        lastY = y;
      }
    }, { passive: true });
  }

  /* =========================================================
     === MOBILE MENU ===
     ========================================================= */
  function initMobileMenu() {
    const burger = $("#hamburger");
    const menu = $("#mobile-menu");
    if (!burger || !menu) return;

    function close() {
      burger.classList.remove("is-open");
      menu.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    burger.addEventListener("click", function () {
      const open = menu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".mobile-menu__links a", menu).forEach((a) => a.addEventListener("click", close));
  }

  /* =========================================================
     === SCROLL PROGRESS BAR (top 2px line) ===
     ========================================================= */
  function initScrollProgress() {
    const bar = $("#scroll-progress");
    if (!bar) return;
    window.addEventListener("scroll", function () {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = pct + "%";
    }, { passive: true });
  }

  /* =========================================================
     === CUSTOM CURSOR (dot + spring-follow ring) ===
     ========================================================= */
  function initCursor() {
    const dot = $("#cursor-dot");
    const ring = $("#cursor-ring");
    if (!dot || !ring) return;

    // Only on fine pointers
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      dot.style.display = "none";
      ring.style.display = "none";
      return;
    }
    document.body.classList.add("has-cursor");

    let mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });

    // spring follow for the ring
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    }
    loop();

    // ring grows over interactive elements
    const interactive = "a, button, input, textarea, .project-card, .filter, .icon-btn, [data-tilt]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(interactive)) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(interactive)) ring.classList.remove("is-hover");
    });
  }

  /* =========================================================
     === HERO NAME: animate letters in one by one ===
     ========================================================= */
  function initHeroName() {
    const lines = $$(".hero__line");
    let delay = 0;
    lines.forEach(function (line) {
      const text = line.getAttribute("data-text") || "";
      line.textContent = "";
      text.split("").forEach(function (ch) {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch === " " ? "\u00A0" : ch;
        span.style.animationDelay = delay + "ms";
        if (!reduceMotion) {
          // trigger animation
          requestAnimationFrame(() => span.classList.add("in"));
        } else {
          span.classList.add("in");
        }
        line.appendChild(span);
        delay += 55;
      });
    });
  }

  /* =========================================================
     === TYPING ROLE CYCLE ===
     ========================================================= */
  function initTyping() {
    const el = $("#typed");
    if (!el) return;
    const words = ["Frontend Developer", "CSE Student", "Football Champion", "UI/UX Designer"];
    let wi = 0, ci = 0, deleting = false;

    function tick() {
      const word = words[wi];
      if (!deleting) {
        el.textContent = word.slice(0, ++ci);
        if (ci === word.length) {
          deleting = true;
          return setTimeout(tick, 1400); // hold before deleting
        }
      } else {
        el.textContent = word.slice(0, --ci);
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
        }
      }
      setTimeout(tick, deleting ? 55 : 95);
    }
    tick();
  }

  /* =========================================================
     === INTERSECTION OBSERVER: reveals + bars + count-up + slides ===
     ========================================================= */
  function initObservers() {
    if (!("IntersectionObserver" in window)) {
      // graceful fallback: show everything
      $$(".reveal, .slide-left, .slide-right").forEach((el) => el.classList.add("in"));
      $$(".bar").forEach(fillBar);
      $$("[data-count]").forEach((el) => (el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "")));
      return;
    }

    const io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        el.classList.add("in");

        if (el.classList.contains("bar")) fillBar(el);
        if (el.hasAttribute("data-count")) countUp(el);
        // also fill bars / count nested inside revealed containers
        $$(".bar", el).forEach(fillBar);
        $$("[data-count]", el).forEach(countUp);

        obs.unobserve(el);
      });
    }, { threshold: 0.12 });

    $$(".reveal, .slide-left, .slide-right, .bar, [data-count]").forEach((el) => io.observe(el));
  }

  function fillBar(bar) {
    const fill = bar.querySelector(".bar__fill");
    const level = bar.getAttribute("data-level");
    if (fill && level) fill.style.width = level + "%";
  }

  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    const target = parseFloat(el.getAttribute("data-count")) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const dur = 1400;
    const start = performance.now();

    function frame(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    if (reduceMotion) { el.textContent = target + suffix; return; }
    requestAnimationFrame(frame);
  }

  /* =========================================================
     === PROJECT FILTER TABS ===
     ========================================================= */
  function initFilters() {
    const filters = $$(".filter");
    const cards = $$(".project-card");
    if (!filters.length) return;

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const f = btn.getAttribute("data-filter");
        cards.forEach(function (card) {
          const cat = card.getAttribute("data-category");
          const show = f === "all" || cat === f;
          card.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* =========================================================
     === PROJECT CARD 3D TILT (mousemove perspective) ===
     ========================================================= */
  function initTilt() {
    if (reduceMotion) return;
    const cards = $$("[data-tilt]");
    const MAX = 8; // degrees

    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;  // 0..1
        const py = (e.clientY - r.top) / r.height;  // 0..1
        const ry = (px - 0.5) * 2 * MAX;            // rotateY
        const rx = (0.5 - py) * 2 * MAX;            // rotateX
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* =========================================================
     === COPY EMAIL ===
     ========================================================= */
  function initCopyEmail() {
    const btn = $("#copy-email");
    const feedback = $("#copy-feedback");
    if (!btn) return;
    const email = "mdjisanahmeddorjoy@gmail.com";

    btn.addEventListener("click", function () {
      const done = () => {
        if (feedback) {
          feedback.classList.add("show");
          setTimeout(() => feedback.classList.remove("show"), 1600);
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(fallback);
      } else {
        fallback();
      }
      function fallback() {
        const ta = document.createElement("textarea");
        ta.value = email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

  /* =========================================================
     === CONTACT FORM (spinner -> success checkmark) ===
     ========================================================= */
  function initForm() {
    const form = $("#contact-form");
    const btn = $("#submit-btn");
    if (!form || !btn) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      btn.classList.add("is-loading");
      btn.disabled = true;

      // Simulated send (no backend) — swap for real endpoint later
      setTimeout(function () {
        btn.classList.remove("is-loading");
        btn.classList.add("is-success");
        setTimeout(function () {
          btn.classList.remove("is-success");
          btn.disabled = false;
          form.reset();
        }, 2200);
      }, 1500);
    });
  }

  /* =========================================================
     === BACK TO TOP (appears after 400px) ===
     ========================================================= */
  function initBackToTop() {
    const btn = $("#back-to-top");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* =========================================================
     === BOOT ===
     ========================================================= */
  function boot() {
    initLoader();
    initTheme();
    initNavbar();
    initMobileMenu();
    initScrollProgress();
    initCursor();
    initHeroName();
    initTyping();
    initObservers();
    initFilters();
    initTilt();
    initCopyEmail();
    initForm();
    initBackToTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

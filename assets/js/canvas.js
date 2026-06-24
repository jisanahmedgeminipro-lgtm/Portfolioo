/* =============================================================
   MD JISAN AHMED — PORTFOLIO  ·  canvas.js
   RESPONSIBILITY: the hero particle system ONLY. Nothing else.
   Sparse (~50) slow-moving indigo/cyan particles. Connecting
   lines appear only when two particles are within 100px.
   ============================================================= */

(function () {
  "use strict";

  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Respect reduced-motion: skip the animation entirely.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // === CONFIG (sparse + slow, per spec) ===
  const COLORS = ["#4f46e5", "#06b6d4"]; // indigo + cyan
  const PARTICLE_COUNT = 50;
  const LINK_DISTANCE = 100; // px proximity for connecting lines
  const MAX_SPEED = 0.25;    // slow drift

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let rafId = null;

  // === SIZING (handles retina via devicePixelRatio) ===
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // === PARTICLE FACTORY ===
  function makeParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * MAX_SPEED * 2,
      vy: (Math.random() - 0.5) * MAX_SPEED * 2,
      r: Math.random() * 1.6 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function seed() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(makeParticle());
  }

  // === DRAW LOOP ===
  function draw() {
    ctx.clearRect(0, 0, width, height);

    // move + render dots
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // wrap around edges for an endless field
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.7;
      ctx.fill();
    }

    // connecting lines only under proximity threshold
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINK_DISTANCE) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "#4f46e5";
          // fade line with distance
          ctx.globalAlpha = (1 - dist / LINK_DISTANCE) * 0.18;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(draw);
  }

  // === INIT ===
  function init() {
    resize();
    seed();
    if (!reduceMotion) {
      draw();
    } else {
      // draw a single static frame
      draw();
      if (rafId) cancelAnimationFrame(rafId);
    }
  }

  // Debounced resize
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      resize();
      seed();
    }, 200);
  });

  // Pause when hero is off-screen to save CPU
  const hero = document.getElementById("hero");
  if (hero && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!rafId && !reduceMotion) draw();
        } else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    });
    io.observe(hero);
  }

  init();
})();

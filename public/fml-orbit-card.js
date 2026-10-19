/* Lab search orbit card (GSAP 3.12.5): tiles orbit the stat line on an ellipse, spaced by arc length. */
(() => {
  const card = document.getElementById("loc-card");
  if (!card) return;
  const ICON_COUNT = 10;  // 6, 8 or 10. Tiles 7–10 (book, lightbulb, chart, flask) are placeholders.
  if (!window.gsap || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const START = [198, 270, 306, 22, 95, 133, 234, 345, 58, 168];
    card.querySelectorAll(".loc-pos").forEach((p, i) => p.classList.toggle("off", i >= ICON_COUNT));
    card.querySelectorAll(".loc-orbit").forEach((el, i) => {
      const a = START[i] * Math.PI / 180;
      el.style.transform = `translate(calc(${(Math.cos(a) * 330).toFixed(1)} * var(--u)), calc(${(Math.sin(a) * 126).toFixed(1)} * var(--u)))`;
    });
    return;
  }

  const tiles = [...card.querySelectorAll(".loc-pos")].map((pos, i) => {
    const push = pos.querySelector(".loc-push"), float = pos.querySelector(".loc-float"), tile = pos.querySelector(".loc-tile"), icon = tile.querySelector("svg");
    return {
      pos, tile, icon, move: tile.dataset.move, ring: pos.querySelector(".loc-orbit"),
      x: gsap.quickTo(push, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(push, "y", { duration: 0.9, ease: "power3.out" }),
      r: gsap.quickTo(push, "rotation", { duration: 1.1, ease: "power3.out" }),
      float
    };
  });

  /* ---------- Orbit around the centred line ----------
     The tiles travel a soft ellipse sized from the text itself, so they always clear it,
     with a touch of depth: tiles grow a little as they pass in front (bottom) and shrink behind (top). */
  const line = document.getElementById("loc-line");
  // Even spacing: tiles are placed by distance travelled along the oval (arc length), not by angle,
  // so the gaps between neighbours stay the same at the sides and at the top and bottom.
  let ARC = [], ARC_LEN = 1;
  const buildArc = () => {
    ARC = [0]; let len = 0, px = RX, py = 0;
    for (let j = 1; j <= 720; j++) {
      const t = j / 720 * Math.PI * 2, x = Math.cos(t) * RX, y = Math.sin(t) * RY;
      len += Math.hypot(x - px, y - py); ARC.push(len); px = x; py = y;
    }
    ARC_LEN = len;
  };
  const angleAt = (f) => {                  // fraction of the way round (0–1) → angle in radians
    const target = (((f % 1) + 1) % 1) * ARC_LEN;
    let lo = 0, hi = 720;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; ARC[mid] < target ? (lo = mid) : (hi = mid); }
    const seg = ARC[hi] - ARC[lo] || 1;
    return (lo + (target - ARC[lo]) / seg) / 720 * Math.PI * 2;
  };
  let START = [], SHOWN = 10;
  const WANDER = 2;                                              // design px each tile drifts off its lane
  const orbit = { angle: 0, speed: 7 };                          // degrees, degrees per second
  const packEls = [...card.querySelectorAll(".loc-orbit")];
  let clock = 0, RX = 320, RY = 126;
  const fit = () => {                                            // ellipse = text half-size + a clear margin
    const k = card.clientWidth / 1002;
    const hw = line.offsetWidth / k / 2, hh = line.offsetHeight / k / 2;
    RX = Math.min(hw + 150, 470);
    RY = Math.min(Math.max((hh + 38) / 0.62, 120), 132);   // roomier oval, still clear of the text and the card edges
  };
  const refit = () => { fit(); buildArc(); };
  refit(); document.fonts && document.fonts.ready.then(refit);
  addEventListener("resize", refit);
  let onScreen = true;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(card);
  gsap.ticker.add((time, dt) => {
    if (!onScreen) return;
    const step = dt / 1000;
    orbit.angle += orbit.speed * step;
    clock += step * (0.35 + orbit.speed / 14);
    const k = card.clientWidth / 1002;
    packEls.forEach((el, i) => {
      if (i >= SHOWN) return;
      const a = angleAt(START[i] + orbit.angle / 360);
      const wx = Math.sin(clock * (0.62 + i * 0.07) + i * 1.3) * WANDER;
      const wy = Math.sin(clock * (0.81 + i * 0.05) + i * 2.1) * WANDER;
      const x = Math.cos(a) * RX + wx, y = Math.sin(a) * RY + wy;
      gsap.set(el, { x: x * k, y: y * k, scale: 1 + Math.sin(a) * 0.08, zIndex: Math.sin(a) > 0 ? 2 : 0 });
    });
  });
  // Spread however many tiles are showing evenly around the oval (the original six come first)
  const layout = (n) => {
    SHOWN = n;
    START = packEls.map((_, i) => 0.55 + i / n);   // equal shares of the oval's length
    card.querySelectorAll(".loc-pos").forEach((p, i) => p.classList.toggle("off", i >= n));
  };
  layout(ICON_COUNT);

  const setSpeed = (v, d = 0.8) => gsap.to(orbit, { speed: v, duration: d, ease: "power2.out", overwrite: true });

  /* ---------- Idle drift: each tile on its own slow, out-of-phase loop ---------- */
  const unit = () => card.clientWidth / 1002;
  tiles.forEach((t, i) => {
    const k = unit();
    gsap.to(t.float, { y: (i % 2 ? 1.5 : -1.5) * k, rotation: i % 2 ? 4 : -4,
      duration: 2.6 + i * 0.45, ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.3 });
  });

  /* ---------- Cursor nudge: tiles ease away from the pointer and tilt ---------- */
  const RADIUS = 120, PUSH = 26; // design px
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect(), k = unit();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    tiles.forEach((t) => {
      const b = t.ring.getBoundingClientRect();   // where the tile actually is on the ring right now
      const cx = b.left - r.left + b.width / 2, cy = b.top - r.top + b.height / 2;
      const dx = cx - mx, dy = cy - my, d = Math.hypot(dx, dy) || 1;
      const f = Math.max(0, 1 - d / (RADIUS * k));          // 1 at the pointer, 0 at the edge of the field
      const s = f * f * PUSH * k;                            // ease the falloff so it feels soft
      t.x((dx / d) * s); t.y((dy / d) * s); t.r((dx / d) * f * 14);
      gsap.to(t.tile, { "--glow": f * 0.55, duration: 0.4, overwrite: "auto" });
    });
  });
  card.addEventListener("pointerenter", () => setSpeed(3));
  card.addEventListener("pointerleave", () => {
    setSpeed(9, 1.6);
    tiles.forEach((t) => { t.x(0); t.y(0); t.r(0); gsap.to(t.tile, { "--glow": 0, duration: 0.6 }); });
  });

  /* ---------- Hover a tile: the box lifts and gives a small tilt; the icon inside never moves on its own ---------- */
  tiles.forEach((t, i) => {
    const dir = i % 2 ? 1 : -1;
    t.tile.addEventListener("pointerenter", () => {
      gsap.to(t.tile, { scale: 1.18, duration: 0.45, ease: "back.out(2.5)" });
      gsap.timeline({ overwrite: false })
        .to(t.tile, { rotation: 10 * dir, duration: 0.2, ease: "power2.out" })
        .to(t.tile, { rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
      setSpeed(0.6, 0.5);
    });
    t.tile.addEventListener("pointerleave", () => {
      gsap.to(t.tile, { scale: 1, duration: 0.5, ease: "power3.out" });
      setSpeed(3);
    });
  });
})();

// Cattlelog rocket stat cards, ported from the results-card and overview-stats handoffs (index.html).
// Used twice on the case study: Overview (data-ids="clo", flies right to left) and Impact (ids "clr",
// flies left to right). Timings, eases and sizes unchanged. Plays once when the card scrolls into view; afterwards the
// plume keeps slowly rippling while the rocket holds still. Reduced motion shows the final frame.
import { gsap } from "gsap";

export default function mountResultsCard(card) {
  const $ = (s) => card.querySelector(s);
  const ids = card.dataset.ids || "clr";
  const rocket = $(`#${ids}-rocket`), glow = $(`#${ids}-nozGlow`), turb = $(`#${ids}-turb`);
  const blobs = [...card.querySelectorAll(".clr-blob")], N = blobs.length;
  const stats = card.querySelectorAll(".clr-stat"), dividers = card.querySelectorAll(".clr-div");
  // Flight path from the handoffs: left to right with the plume off the left edge, or mirrored.
  const leftward = card.dataset.dir === "left";
  const END = leftward ? { x: 740, y: 300 } : { x: 1420, y: 300 };
  const START = leftward ? { x: 2420, y: 380 } : { x: -260, y: 380 };
  const NOZ = leftward ? [158, 19] : [-158, 19];   // nozzle offset from the rocket centre (after its rotation and scale)
  const TAIL_X = leftward ? 2380 : -220;           // the plume runs back off the edge behind the rocket
  const back = leftward ? 1 : -1;                  // direction from the nozzle toward the tail
  const s = { p: 0, w: 0 };          // p: flight progress, w: idle wobble phase
  // Mouse stirring: each blob carries an offset the cursor pushes around, and `stir` turns up the
  // turbulence; both ease back to rest, so the plume swirls like smoke and then settles.
  const disp = $(`#${ids}-disp`);
  const off = blobs.map(() => ({ x: 0, y: 0 }));
  const base = blobs.map(() => ({ x: 0, y: 0, r: 0 }));   // each blob's un-pushed centre and reach
  let stir = 0;
  const draw = () => {
    // Hover: once it has landed the rocket bobs gently (about a 3s cycle) with a slight tilt, eased in
    // over the end of the flight so it never jumps. The nozzle, and so the plume, follows the bob.
    const landed = Math.max(0, Math.min(1, (s.p - 0.85) / 0.15));
    const bob = Math.sin(s.w * 1.4) * 18 * landed, tilt = Math.sin(s.w * 1.4 - 0.9) * 2.2 * landed;
    const x = START.x + (END.x - START.x) * s.p, y = START.y + (END.y - START.y) * s.p + bob;
    rocket.setAttribute("transform", `translate(${x} ${y}) rotate(${tilt.toFixed(3)})`);
    const nx = x + NOZ[0], ny = y + NOZ[1];
    glow.setAttribute("cx", nx); glow.setAttribute("cy", ny);
    const len = Math.max(0, (TAIL_X - nx) * back);
    blobs.forEach((b, i) => {
      const t = i / (N - 1);
      const bx = nx + back * t * len, by = ny + t * 120 + Math.sin(s.w + i * .9) * 10 * t;
      const ry = (26 + Math.pow(t, 1.15) * 190) * (1 + Math.sin(s.w * 1.3 + i) * .04);
      const rx = Math.max(30, len / N * 1.15 + ry * .6);
      base[i].x = bx; base[i].y = by; base[i].r = Math.max(rx, ry);
      b.setAttribute("cx", bx + off[i].x); b.setAttribute("cy", by + off[i].y);
      b.setAttribute("rx", rx); b.setAttribute("ry", ry);
      b.setAttribute("opacity", (1 - t * .45).toFixed(2));
    });
    disp.setAttribute("scale", (90 + stir * 60).toFixed(2));
    turb.setAttribute("seed", 3);
    // Full precision: rounding to 4 decimals left only ~16 steps, so the swirl jumped instead of flowing.
    turb.setAttribute("baseFrequency", `${(0.006 + Math.sin(s.w * .7) * .0008).toFixed(7)} ${(0.012 + Math.cos(s.w * .5) * .0015).toFixed(7)}`);
  };
  const tl = gsap.timeline({ paused: true });
  tl.set(s, { p: 0, w: 0 }).call(draw)
    .set([stats, dividers], { opacity: 0, y: 24 })
    .to(s, { p: 1, duration: 1.9, ease: "power3.out", onUpdate: draw }, .1)
    .to(s, { w: 6, duration: 2.6, ease: "none", onUpdate: draw }, 0)
    // stats come in right away (handoff had them wait 1.3s for the rocket)
    .to(stats, { opacity: 1, y: 0, duration: .35, stagger: .05, ease: "power3.out" }, .2)
    .to(dividers, { opacity: 1, y: 0, duration: .3 }, .25);

  // After the flight the plume keeps breathing slowly; the rocket itself holds still.
  // The breathing pauses while the card is off screen.
  let idle = null, onScreen = true;
  tl.eventCallback("onComplete", () => {
    idle = gsap.to(s, { w: "+=60", duration: 40, ease: "none", repeat: -1, onUpdate: draw });
    if (!onScreen) idle.pause();
  });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { tl.progress(1); return; }
  tl.seek(0.001, false);   // hold the opening frame until it scrolls into view

  /* ---------- Mouse over the plume: it behaves like smoke ----------
     Resting: the smoke gently parts around the cursor and holds there.
     Swiping through: the trail tears. Soft holes open along the cursor's path and billow out as they
     fill back in (an SVG mask over the plume), the nearby smoke is dragged along the swipe and keeps
     drifting before it eases home, and the turbulence swirls harder for a moment.
     Nothing springs back or overshoots; every motion is damped. */
  const svg = card.querySelector("svg");
  const NS = "http://www.w3.org/2000/svg";
  const plume = $(`#${ids}-plume`);
  const defs = svg.querySelector("defs");
  const hole = document.createElementNS(NS, "radialGradient");
  hole.id = `${ids}-hole`;
  hole.innerHTML = '<stop offset="0" stop-color="#000" stop-opacity="1"/><stop offset=".55" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/>';
  const mask = document.createElementNS(NS, "mask");
  mask.id = `${ids}-tear`;
  mask.setAttribute("maskUnits", "userSpaceOnUse");
  mask.setAttribute("x", "-600"); mask.setAttribute("y", "-600"); mask.setAttribute("width", "3400"); mask.setAttribute("height", "2300");
  mask.innerHTML = '<rect x="-600" y="-600" width="3400" height="2300" fill="#fff"/>';
  const holes = document.createElementNS(NS, "g");
  mask.appendChild(holes);
  defs.append(hole, mask);
  const wrap = document.createElementNS(NS, "g");
  wrap.setAttribute("mask", `url(#${ids}-tear)`);
  plume.before(wrap); wrap.appendChild(plume);

  const vel = blobs.map(() => ({ x: 0, y: 0 }));   // drift each blob picks up from a swipe
  const cuts = [];                                  // live holes: { el, r, a, vx, vy }
  let settling = false, pointer = null;
  const settle = () => {
    let moving = stir > 0.01 || pointer !== null || cuts.length > 0;
    off.forEach((o, i) => {
      let tx = 0, ty = 0;
      if (pointer) {
        const reach = base[i].r + 30;
        const dx = base[i].x - pointer.x, dy = base[i].y - pointer.y, d = Math.hypot(dx, dy);
        if (d < reach) {
          const f = 1 - d / reach, push = 16 * f * f;
          tx = d > 1 ? dx / d * push : 0;
          ty = d > 1 ? dy / d * push : -push;
        }
      }
      const v = vel[i];
      o.x += v.x; o.y += v.y;                         // keep drifting after the swipe…
      v.x *= 0.9; v.y *= 0.9;                         // …losing speed like smoke in still air
      o.x += (tx - o.x) * 0.035; o.y += (ty - o.y) * 0.035;   // then ease home, no overshoot
      o.x = Math.max(-80, Math.min(80, o.x)); o.y = Math.max(-55, Math.min(55, o.y));
      if (Math.abs(o.x - tx) + Math.abs(o.y - ty) + Math.abs(v.x) + Math.abs(v.y) > 0.3) moving = true;
      else if (!pointer) { o.x = 0; o.y = 0; v.x = 0; v.y = 0; }
    });
    for (let k = cuts.length - 1; k >= 0; k--) {     // holes billow outward and fill back in
      const c = cuts[k];
      c.a *= 0.95; c.r += 0.9;
      c.x += c.vx; c.y += c.vy; c.vx *= 0.92; c.vy *= 0.92;
      if (c.a < 0.02) { c.el.remove(); cuts.splice(k, 1); continue; }
      c.el.setAttribute("cx", c.x.toFixed(1)); c.el.setAttribute("cy", c.y.toFixed(1));
      c.el.setAttribute("r", c.r.toFixed(1)); c.el.setAttribute("opacity", c.a.toFixed(3));
    }
    stir *= 0.95;
    draw();
    if (!moving) { stir = 0; settling = false; gsap.ticker.remove(settle); }
  };
  const wake = () => { if (!settling) { settling = true; gsap.ticker.add(settle); } };
  const onTrail = (p) => base.some((b) => Math.hypot(b.x - p.x, b.y - p.y) < b.r * 0.9);
  const handleMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    if (pointer) {
      const mx = p.x - pointer.x, my = p.y - pointer.y, speed = Math.hypot(mx, my);
      stir = Math.min(0.5, stir + speed * 0.002);
      // drag the smoke the cursor passes through along with the swipe
      blobs.forEach((_, i) => {
        const reach = base[i].r + 20, d = Math.hypot(base[i].x + off[i].x - p.x, base[i].y + off[i].y - p.y);
        if (d < reach) { const f = 1 - d / reach; vel[i].x += mx * 0.045 * f; vel[i].y += my * 0.045 * f; }
      });
      // a fast swipe through the trail tears a soft hole that follows the swipe a little
      if (speed > 8 && onTrail(p) && cuts.length < 30) {
        const el = document.createElementNS(NS, "circle");
        el.setAttribute("fill", `url(#${ids}-hole)`);
        holes.appendChild(el);
        cuts.push({ el, x: p.x, y: p.y, r: 24 + Math.min(30, speed * 0.7), a: Math.min(0.6, 0.3 + speed * 0.012), vx: mx * 0.12, vy: my * 0.12 });
      }
    }
    pointer = p;
    wake();
  };
  card.addEventListener("pointermove", handleMove);
  card.addEventListener("pointerleave", () => { pointer = null; wake(); });

  let played = false;
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (idle) { onScreen ? idle.resume() : idle.pause(); return; }
    if (!played && e.intersectionRatio >= .35) { played = true; tl.play(0); }
  }, { threshold: [0, .35] }).observe(card);
}

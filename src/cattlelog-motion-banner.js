// Cattlelog banner motion, ported from the Cattlelog motion handoff (banner-demo.html).
// Timings, eases, sizes and colours are unchanged; only the demo switcher, replay button, notes,
// window.__seek and direction B are left out. Plays once when it scrolls into view, then idles on the logo.
import { gsap } from "gsap";
import MARKUP from "./cattlelog-motion-markup.js";

// "c" (Comet → Dashboard) is the pick; "a" (Launch → Dashboard) is the alternate.
export const CATTLELOG_BANNER_DIRECTION = "c";

const F = "/figma-projects/cl-banner/fig/";

export default function mountCattlelogBanner(banner, direction = CATTLELOG_BANNER_DIRECTION) {
  banner.innerHTML = MARKUP;
  const $ = (s, r = banner) => r.querySelector(s);
  const $$ = (s, r = banner) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const observers = [];

  /* Banner scale for the Figma-px UI blocks */
  const setPx = () => banner.style.setProperty("--px", banner.clientWidth / 4341);
  const pxObserver = new ResizeObserver(setPx);
  pxObserver.observe(banner); setPx();
  observers.push(pxObserver);

  /* ---------- UI builders (values from Figma 11594:15639 / 11588:19621) ---------- */
  const G = ["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F"];
  const HP = [13,56,32,13,8,5,2,2,2,2,2,2,2];   // Y. Frid (purple)
  const HT = [16,72,24,8,5,3,2,2,2,2,2,2,2];    // M. Butner (teal)

  const legend = (tName) => `
    <div class="legend">
      <div class="lg p"><div class="nm"><img src="${F}1f65b.svg" alt="">Y. Frid</div><div class="av"><b>3.2</b><span>AVG GPA</span></div></div>
      <div class="lg t"><div class="nm"><img src="${F}73841.svg" alt="">${tName}</div><div class="av"><b>3.2</b><span>AVG GPA</span></div></div>
    </div>`;

  const gradeCard = () => `
    <div class="card grade">
      <div class="hd"><h3>Grade Distributions</h3><div class="more">View More Distributions<img src="${F}78a4d.svg" alt=""></div></div>
      <img src="${F}3ceb0.svg" alt="" style="width:660px;height:1px">
      <div class="blank"><img src="${F}ae806.svg" alt=""><b>No Professors Added</b></div>
      ${legend("M. Butner")}
      <div class="chart">
        <div class="yax"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
        <img class="gridimg" src="${F}0d526.svg" alt="">
        <div class="groups">${G.map((g, i) => `<div class="grp"><div class="bar p" style="height:${HP[i]}px"></div><div class="bar t" style="height:${HT[i]}px"></div><i>${g}</i></div>`).join("")}</div>
        <div class="tip" style="left:55px;top:2px"><b>Grade A</b>
          <div class="r"><span><img src="${F}73510.svg" alt="">Y. Frid</span><em>35%</em></div>
          <div class="r t"><span><img src="${F}3eb8c.svg" alt="">M. Butner</span><em>45%</em></div>
        </div>
      </div>
    </div>`;

  const PP = [[24,103.75],[206,83.75],[387,73.75],[569,103.75]];
  const PT = [[24,54.75],[206,74.75],[387,84.75],[569,54.75]];
  const pts = (a) => a.map(p => p.join(",")).join(" ");
  const dots = (a, c) => a.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="#fff" stroke="${c}" stroke-width="1.2"/>`).join("");
  const gpaCard = () => `
    <div class="card gpacard">
      <div class="hd"><h3>GPA Trends</h3><div class="more">View More Trends<img src="${F}78a4d.svg" alt=""></div></div>
      <img src="${F}3ceb0.svg" alt="" style="width:660px;height:1px">
      <div class="blank"><img src="${F}ae806.svg" alt=""><b>No Professors Added</b></div>
      ${legend("M.Butner")}
      <div class="gpa">
        <div class="yax" style="height:172px"><span>4.0</span><span>3.0</span><span>2.0</span><span>1.0</span><span>0.0</span></div>
        <img class="gridimg" src="${F}0d526.svg" alt="">
        <svg width="620" height="160" viewBox="0 0 620 160">
          <g class="ln t"><polyline points="${pts(PT)}" fill="none" stroke="#2D7E67" stroke-width="1.2"/>${dots(PT, "#2D7E67")}</g>
          <g class="ln p"><polyline points="${pts(PP)}" fill="none" stroke="#7C3AED" stroke-width="1.2"/>${dots(PP, "#7C3AED")}</g>
        </svg>
        ${["FQ24","WQ25","SQ25","FQ25"].map((l, i) => `<span class="xl" style="left:${40 + PP[i][0]}px">${l}</span>`).join("")}
        <div class="tip" style="left:79px;top:10px"><b>FQ24</b>
          <div class="r"><span><img src="${F}73510.svg" alt="">Y. Frid</span><em>3.5</em></div>
          <div class="r t"><span><img src="${F}3eb8c.svg" alt="">M. Butner</span><em>4.7</em></div>
        </div>
      </div>
    </div>`;

  const PROFS = [["Matthew Butner","4.7","#38863a"],["Zhaojun Bai","3.5","#e7c756"],["Yelena Frid","1.9","#cf473a"]];
  const profList = (folds = true) => `
    <div class="profs">
      <div class="ph"><img src="${F}c3f12.svg" alt="">Winter 2026 Professors</div>
      ${PROFS.map(([n, r, c]) => `<div class="prow"><div class="pb" style="background:${c}">${r}</div><div class="pmid"><b>${n}</b><div class="tags"><span>Tough Grader</span><span>Attendance Mandatory</span></div></div><div class="pacts"><img src="${F}0bc99.svg" alt=""><img src="${F}fd89e.svg" alt=""></div></div>`).join("")}
      <div class="prev"><img src="${F}54102.svg" alt="">## previous quarters</div>
      ${folds ? `<div class="fold"><img src="${F}00870.svg" alt="">Professor Timeline</div><div class="fold"><img src="${F}00870.svg" alt="">Prerequisites</div>` : ""}
    </div>`;

  const NAV = [["abc35","Compare",20.7,19],["60c42","Grades",20,15],["aa38c","Blog",19,19],["a0d72","Reviews",17.5,17.5]];
  const screen = () => `
    <div class="screen">
      <div class="dash">
        <div class="logo"><img src="${F}66cf0.svg" alt="" style="width:40px;height:36.87px"><div class="wm"><span>davis</span><span>cattlelog</span></div></div>
        <nav class="nav">${NAV.map(([f, t, w, h]) => `<a><span class="ic"><img src="${F}${f}.svg" alt="" style="width:${w}px;height:${h}px"></span>${t}</a>`).join("")}</nav>
      </div>
      <div class="course">
        <div class="back st"><img src="${F}e9284.svg" alt="">Back to Courses</div>
        <div class="titlerow st"><div class="badge">4.7</div><div><h2>CDM 003</h2><p>Media Archaeology</p></div></div>
        <p class="desc st">Evolution of media technologies and practices beginning in the 19th century as they relate to contemporary digital arts practices. Special focus on the reconstruction of the social and artistic possibilities of lost and obsolete media technologies.</p>
        <div class="btns st"><div class="btn">Compare Course</div><div class="btn solid">Review Course</div></div>
        <div class="chips st">
          <div class="ge"><img src="${F}d564b.svg" alt="">AH</div><div class="ge"><img src="${F}12595.svg" alt="">SE</div>
          <div class="ge"><img src="${F}5bd15.svg" alt="">VL</div><div class="ge"><img src="${F}aa0c6.svg" alt="">WE</div>
          <img class="sep" src="${F}b6a70.svg" alt=""><div class="qtr">WQ26</div><img class="sep" src="${F}b6a70.svg" alt=""><span class="units">4 units</span>
        </div>
        <div class="live st"><div class="ge"><img src="${F}7ff1f.svg" alt="">Live Enrollment:</div><span><b style="color:#cf473a">0</b> OPEN</span><img class="sep" src="${F}b6a70.svg" alt=""><span><b>60</b> WAITLIST</span></div>
      </div>
      <div class="body">
        <div class="search st"><img src="${F}dfadb.svg" alt=""></div>
        <div class="col">${gradeCard()}${gpaCard()}</div>
        <div class="col">${profList()}</div>
      </div>
    </div>`;

  const cursorSvg = () => `<svg class="cur" width="26" height="30" viewBox="0 0 26 30" aria-hidden="true"><path d="M3 2l19 13.5-8.6 1.4 4.9 9.6-3.6 1.8-4.8-9.7L3 24.5z" fill="#181818" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`;
  /* Stats dashboard (shared by A and C): dashbar, course page snippet, empty-state cards */
  const snipScreen = () => screen().replace('<div class="screen">', '<div class="screen snip">').replace(/<\/div>\s*$/, cursorSvg() + "</div>");

  const put = (id, h) => { $("#" + id).innerHTML = `<div class="mv">${h}</div>`; return $("#" + id + " > .mv"); };

  /* ---------- Shared helpers ---------- */
  const NOSE = -31;                         // the drawing's nose points ~31° above the x-axis
  function placeShip(g, x, y, ang, k = 1.25) {
    const cx = 90 * k, cy = 80 * k;
    g.setAttribute("transform", `translate(${x - cx} ${y - cy}) rotate(${ang - NOSE} ${cx} ${cy})`);
  }
  const lineLen = (pl) => { const p = pl.getAttribute("points").split(" ").map(s => s.split(",").map(Number)); let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i-1][0], p[i][1] - p[i-1][1]); return L; };

  /* Chart sub-timelines: purple first, then "compare" adds teal */
  function barsIn(root, cls, stagger = .03) {
    return gsap.fromTo($$(".bar." + cls, root), { scaleY: 0 }, { scaleY: 1, duration: .55, ease: "back.out(1.6)", stagger });
  }
  function lineIn(root, cls, d = 1.1) {
    const g = $(".ln." + cls, root), pl = $("polyline", g), L = lineLen(pl);
    const tl = gsap.timeline();
    tl.set(g, { opacity: 1 })
      .fromTo(pl, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: "power2.inOut" })
      .fromTo($$("circle", g), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: .3, stagger: .25, ease: "back.out(3)" }, "<.1");
    return tl;
  }
  function resetCard(root) {
    gsap.set($$(".bar", root), { scaleY: 0 });
    gsap.set($$(".lg.t", root), { opacity: 0, scale: .85, transformOrigin: "0 50%" });
    gsap.set($$(".tip", root), { opacity: 0, scale: .9 });
    gsap.set($$(".tip .r.t", root), { display: "none" });
    gsap.set($$(".ln", root), { opacity: 0 });
  }
  function compareIn(root) {
    const tl = gsap.timeline();
    tl.to($$(".lg.t", root), { opacity: 1, scale: 1, duration: .45, ease: "back.out(2)" })
      .set($$(".tip .r.t", root), { display: "flex" }, "<")
      .fromTo($$(".tip .r.t", root), { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: .3 }, "<.1");
    return tl;
  }

  const GX = (i) => 40 + (620 / 13) * i + 620 / 26;              // centre of grade group i in the chart
  const TIPS = { "A+": [0, 8, 10], A: [1, 35, 45], "A-": [2, 20, 15], "B+": [3, 8, 5] };
  function setGradeTip(card, g) {
    const [i, p, t] = TIPS[g], tip = $(".tip", card), em = $$(".tip em", card);
    $("b", tip).textContent = "Grade " + g; em[0].textContent = p + "%"; em[1].textContent = t + "%";
    $$(".grp", card).forEach((el, j) => el.style.opacity = j === i ? 1 : .35);
  }
  function countUp(els, to = 3.2, d = .6) {
    const o = { v: 0 };
    return gsap.to(o, { v: to, duration: d, ease: "power2.out", onStart: () => els.forEach(e => e.textContent = "0.0"), onUpdate: () => els.forEach(e => e.textContent = o.v.toFixed(1)) });
  }
  /* Cursor helper: Figma-px position of an element's centre inside the screen */
  function at(scr, el, dx = 0, dy = 0) {
    const s = $(".screen", scr).getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / 1440;
    return { x: (r.left + r.width / 2 - s.left) / k + dx, y: (r.top + r.height / 2 - s.top) / k + dy };
  }
  function resetStats(scr) {
    const g = $(".grade", scr), v = $(".gpacard", scr);
    resetCard(g); resetCard(v);
    $$(".lg .av b", scr).forEach(e => e.textContent = "0.0");
    $$(".grp", g).forEach(e => e.style.opacity = 1);
    $("b", $(".tip", g)).textContent = "Grade A"; $$(".tip em", g)[0].textContent = "35%"; $$(".tip em", g)[1].textContent = "45%";
    gsap.set($(".tip", g), { left: 55 }); gsap.set($(".tip", v), { left: 79 }); $("b", $(".tip", v)).textContent = "FQ24";
    gsap.set($$(".st, .card, .profs > *", scr), { opacity: 0, y: 14 });
    gsap.set($(".cur", scr), { opacity: 0, x: 900, y: 420 });
    gsap.set($$(".pacts img", scr), { scale: 1 });
    // start on the empty state
    gsap.set($$(".blank", scr), { opacity: 1 });
    gsap.set($$(".legend, .chart, .gpa", scr), { opacity: 0 });
  }
  function dashSeq(tl, scr, t0) {
    const g = $(".grade", scr), v = $(".gpacard", scr), cur = $(".cur", scr), adds = $$(".pacts img", scr);
    const addFrid = adds[4], addButner = adds[0];   // the "+" on each professor row
    const avP = [$(".lg.p .av b", g), $(".lg.p .av b", v)], avT = [$(".lg.t .av b", g), $(".lg.t .av b", v)];
    // Slower than the handoff demo so each step can be read: T() stretches the gaps between steps
    // by PACE, and HOLD keeps the finished page up before it drops away.
    const PACE = 1.8, HOLD = 1.6;
    const T = (s) => t0 + s * PACE;
    const move = (el, dx, dy, t, d = .28) => tl.to(cur, { x: () => at(scr, el, dx, dy).x, y: () => at(scr, el, dx, dy).y, duration: d * 1.6, ease: "power2.inOut" }, t);
    const press = (el, t) => tl.to(el, { scale: .75, duration: .1, yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, t);
    // Empty state first
    tl.to($$(".card, .profs > *", scr), { opacity: 1, y: 0, duration: .35, stagger: .04, ease: "power2.out" }, t0)
      .to(cur, { opacity: 1, duration: .15 }, T(.15));
    // "+" on Yelena Frid → her data fills the empty cards
    move(addFrid, 4, 4, T(.18));
    press(addFrid, T(.48));
    tl.to($$(".blank", scr), { opacity: 0, duration: .2 }, T(.58))
      .to($$(".legend, .chart, .gpa", scr), { opacity: 1, duration: .25 }, T(.6))
      .add(barsIn(g, "p", .02), T(.62)).add(lineIn(v, "p", .7), T(.62)).add(countUp(avP, 3.2, .6), T(.62))
      .to($$(".tip", scr), { opacity: 1, scale: 1, duration: .25, ease: "back.out(2)" }, T(.9));
    // "+" on Matthew Butner → compare
    move(addButner, 4, 4, T(.95));
    press(addButner, T(1.25));
    tl.add(compareIn(g), T(1.35)).add(barsIn(g, "t", .02), T(1.37)).add(countUp(avT, 3.2, .6), T(1.37))
      .add(compareIn(v), T(1.37)).add(lineIn(v, "t", .7), T(1.4));
    // Hover one grade so the tooltip numbers change
    move($$(".grp", g)[2], 0, -30, T(1.9), .26);
    tl.call(() => setGradeTip(g, "A-"), null, T(2.16)).to($(".tip", g), { left: GX(2) - 56.5, duration: .25, ease: "power2.out" }, T(2.16))
      .to(cur, { opacity: 0, duration: .25 }, T(2.45));
    return T(2.65) + HOLD;
  }

  /* ---------- Impact: a quick glow on the logo, light streaks and star confetti from its rim ---------- */
  const STAR = "M0 -10C1.2 -1.2 1.2 -1.2 10 0C1.2 1.2 1.2 1.2 0 10C-1.2 1.2 -1.2 1.2 -10 0C-1.2 -1.2 -1.2 -1.2 0 -10Z";
  const HITCOL = ["#ffffff", "#9CD1F4", "#FFC363", "#ffffff", "#C0DCF1"];
  function buildHit(k) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "layer hit"); svg.setAttribute("viewBox", "0 0 4341 2241"); svg.setAttribute("aria-hidden", "true");
    let h = `<g class="hit-o">`;
    for (let i = 0; i < 12; i++) h += `<line class="sk" x1="0" y1="0" x2="0" y2="0" stroke="#fff" stroke-width="9" stroke-linecap="round"/>`;
    for (let i = 0; i < 24; i++) h += `<path class="sp" d="${STAR}" fill="${HITCOL[i % 5]}"/>`;
    svg.innerHTML = h + "</g>";
    $("#clm-" + k + " .cen").before(svg);
    return { svg };
  }
  const HITS = {};
  /* Emblem box in banner units: centre and half-size (ignores transforms) */
  function emBox(em) {
    const u = banner.clientWidth / 4341, cen = em.parentElement.getBoundingClientRect(), bb = banner.getBoundingClientRect();
    return { x: (cen.left - bb.left + em.offsetLeft + em.offsetWidth / 2) / u, y: (cen.top - bb.top + em.offsetTop + em.offsetHeight / 2) / u,
             w: em.offsetWidth / 2 / u, h: em.offsetHeight / 2 / u };
  }
  function hitFx(k, em) {
    const H = HITS[k] || (HITS[k] = buildHit(k));
    const o = $(".hit-o", H.svg), sk = $$(".sk", H.svg), sp = $$(".sp", H.svg);
    let bx = null; const box = () => bx || (bx = emBox(em));
    // points on an ellipse just outside the logo
    const ex = (a, pad) => Math.cos(a) * (box().w + pad), ey = (a, pad) => Math.sin(a) * (box().h + pad * .55);
    const A = (i, n) => i / n * 6.283 + .26;
    const glow = (r, a) => `drop-shadow(0 0 ${r}px rgba(156,209,244,${a}))`;
    const tl = gsap.timeline();
    tl.call(() => {
        const b = box();
        o.setAttribute("transform", `translate(${b.x} ${b.y})`);
      })
      .fromTo(em, { filter: glow(0, 0) }, { filter: () => glow(banner.clientWidth / 4341 * 80, .9), duration: .2, immediateRender: false }, 0)
      .to(em, { filter: () => glow(0, 0), duration: .45, ease: "sine.out" }, .2)
      // light streaks shooting out from the rim of the logo
      .fromTo(sk, { attr: { x1: (i) => ex(A(i, 12), 0), y1: (i) => ey(A(i, 12), 0), x2: (i) => ex(A(i, 12), 0), y2: (i) => ey(A(i, 12), 0) }, opacity: 1 }, {
        attr: { x1: (i) => ex(A(i, 12), 140), y1: (i) => ey(A(i, 12), 140), x2: (i) => ex(A(i, 12), 300), y2: (i) => ey(A(i, 12), 300) },
        opacity: 0, duration: .5, ease: "power3.out", immediateRender: false }, 0)
      // star confetti that drifts out all around it
      .fromTo(sp, { x: (i) => ex(A(i, 24), -60), y: (i) => ey(A(i, 24), -60), scale: 0, rotation: 0, opacity: 1, transformOrigin: "50% 50%" }, {
        x: (i) => ex(A(i, 24) + (i % 3) * .08, 120 + (i * 97) % 260), y: (i) => ey(A(i, 24) + (i % 3) * .08, 120 + (i * 61) % 260),
        scale: (i) => 1.3 + (i % 4) * .8, rotation: (i) => (i % 2 ? 1 : -1) * 120, duration: .95, ease: "power3.out", immediateRender: false }, 0)
      .to(sp, { opacity: 0, scale: 0, duration: .3, stagger: { each: .01, from: "random" } }, .5);
    return tl;
  }

  /* ---------- Logo idle: the logo rests in the middle while a few small stars glint around it ----------
     Nothing moves position; each glint just appears and fades at a new spot on a ring round the logo. */
  function logoIdle(k, em) {
    let tl = null;
    const stop = () => { tl && tl.kill(); tl = null; };
    const start = () => {
      stop();
      const H = HITS[k], o = $(".hit-o", H.svg), sp = $$(".sp", H.svg).slice(0, 4), b = emBox(em);
      o.setAttribute("transform", `translate(${b.x} ${b.y})`);
      const pos = () => { const a = Math.random() * 6.283, pad = 70 + Math.random() * 170; return [Math.cos(a) * (b.w + pad), Math.sin(a) * (b.h + pad * .6)]; };
      tl = gsap.timeline({ repeat: -1, repeatRefresh: true, delay: .3 });
      sp.forEach((el, i) => {
        tl.add(() => { const [x, y] = pos(); gsap.set(el, { x, y, rotation: 0 }); }, i * .55)
          .fromTo(el, { scale: 0, opacity: 1 }, { scale: () => 2.6 + Math.random() * 2, rotation: 90, duration: .45, ease: "back.out(2)" }, i * .55)
          .to(el, { scale: 0, opacity: 0, rotation: 180, duration: .45, ease: "power2.in" }, i * .55 + .6);
      });
      tl.to({}, { duration: .6 });
    };
    const pause = () => tl && tl.pause();
    const resume = () => tl && tl.resume();
    return { start, stop, pause, resume };
  }

  /* Emblem tucks into the dashbar logo slot of a screen placed at (X, Y) with scale S */
  function tuck(tl, em, X, Y, S, e, t, d) {
    const u = () => banner.clientWidth / 4341, b = () => banner.getBoundingClientRect();
    tl.to(em, { scale: S / e, duration: d, ease: "power2.inOut", transformOrigin: "0 0",
      x: () => (X + 180 * S) * u() - (em.getBoundingClientRect().left - b().left),
      y: () => (Y + 11.56 * S) * u() - (em.getBoundingClientRect().top - b().top) }, t);
  }
  const SX = 298, SY = 140, SS = 2.6;   // website snippet placement in both A and C

  /* ---------- A · Launch → Dashboard ---------- */
  function buildA() {
    const trail = $("#clm-A-trail"), ship = $("#clm-A-ship"), L = trail.getTotalLength();
    const f = { s: L };
    const draw = () => {
      const s = Math.max(0, Math.min(L, f.s));
      const p = trail.getPointAtLength(s), q = trail.getPointAtLength(Math.max(0, s - 6));
      placeShip(ship, p.x, p.y, Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI, 1);
      trail.style.strokeDasharray = `0 ${s} ${L - s} ${L}`;
    };
    const scr = put("clm-A-screen", snipScreen()), em = $("#clm-A-emblem"), cow = $("img", em), wm = $$(".wm span", em);
    const tl = gsap.timeline({ paused: true });
    tl.set(f, { s: L }).call(draw).set([ship, trail], { opacity: 1 })
      .set(scr, { y: 900, opacity: 1 }).set($(".logo", scr), { opacity: 0 })
      .set(em, { opacity: 1, scale: 1, x: 0, y: 0, filter: "none" })
      .set(cow, { scale: 0, rotation: -12, transformOrigin: "50% 80%" }).set(wm, { opacity: 0, y: 20 })
      .call(() => resetStats(scr));
    tl.to(f, { s: 0, duration: 1.1, ease: "power1.inOut", onUpdate: draw }, .05)
      .to(ship, { opacity: 0, duration: .1 }, 1.15)
      .add(hitFx("A", em), 1.15)
      .to(cow, { scale: 1, rotation: 0, duration: .4, ease: "back.out(2.2)" }, 1.13)
      .to(wm, { opacity: 1, y: 0, duration: .28, stagger: .05, ease: "power3.out" }, 1.24)
      .to(trail, { opacity: 0, duration: .3 }, 1.6);
    tuck(tl, em, SX, SY, SS, 12, 1.7, .62);
    tl.to(scr, { y: 0, duration: .64, ease: "power2.inOut" }, 1.7)
      .to(em, { opacity: 0, duration: .12 }, 2.3).to($(".logo", scr), { opacity: 1, duration: .12 }, 2.3);
    const end = dashSeq(tl, scr, 2.34);
    // Back out to the logo: the page drops away and the logo grows back out of the dashbar
    tl.set(em, { opacity: 1 }, end).set($(".logo", scr), { opacity: 0 }, end)
      .to(em, { x: 0, y: 0, scale: 1, duration: 1.1, ease: "power2.inOut" }, end)
      .to(scr, { y: 900, duration: 1, ease: "power2.inOut" }, end);
    const fin = end + 1.1;
    return { tl, idle: logoIdle("A", em), final: () => { tl.pause(); tl.seek(fin, false); } };
  }

  /* ---------- C · Comet search → Dashboard ---------- */
  function buildC() {
    const pill = $("#clm-C-pill"), q = $("#clm-C-q"), go = $("#clm-C-go"), ship = $("#clm-C-ship"), tail = $("#clm-C-tail"), tg = $("#clm-C-tailg");
    const em = $("#clm-C-emblem"), cow = $("img", em), wm = $$(".wm span", em), scr = put("clm-C-screen", snipScreen());
    const A = [-150, -120];
    const c = { p: 0 };
    let B = null;
    const landing = () => {   // centre of the cow, in banner units (ignores the pop-in transform)
      const u = banner.clientWidth / 4341, cen = em.parentElement.getBoundingClientRect(), bb = banner.getBoundingClientRect();
      return [(cen.left - bb.left + em.offsetLeft + cow.offsetLeft + cow.offsetWidth / 2) / u, (cen.top - bb.top + em.offsetTop + cow.offsetTop + cow.offsetHeight * .55) / u];
    };
    const draw = () => {
      if (!B) B = landing();
      const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
      const x = A[0] + (B[0] - A[0]) * c.p, y = A[1] + (B[1] - A[1]) * c.p;
      placeShip(ship, x, y, ang * 180 / Math.PI, 1.4);
      const len = 900 * Math.min(1, c.p * 3), ux = Math.cos(ang), uy = Math.sin(ang);
      const x0 = x - ux * len, y0 = y - uy * len;
      tail.setAttribute("x1", x0); tail.setAttribute("y1", y0); tail.setAttribute("x2", x - ux * 60); tail.setAttribute("y2", y - uy * 60);
      tg.setAttribute("x1", x0); tg.setAttribute("y1", y0); tg.setAttribute("x2", x); tg.setAttribute("y2", y);
    };
    const landingObserver = new ResizeObserver(() => { B = null; });
    landingObserver.observe(banner);
    observers.push(landingObserver);
    const typed = { n: 0 }, TXT = "CDM 003";
    const type = () => { const n = Math.round(typed.n); q.classList.toggle("ph", n === 0); q.innerHTML = (n ? TXT.slice(0, n) : "Search a course") + (n ? '<span class="caret"></span>' : ""); };
    const u = () => banner.clientWidth / 4341;
    const tl = gsap.timeline({ paused: true });
    tl.set(typed, { n: 0 }).call(type).set(c, { p: 0 })
      .set(pill, { opacity: 0, scale: .9, y: 0 }).set(go, { opacity: 0, scale: .6 })
      .set([ship, tail], { opacity: 0 })
      .set(em, { opacity: 1, x: 0, y: 0, scale: 1, filter: "none" })
      .set(cow, { scale: 0, rotation: -12, transformOrigin: "50% 80%" }).set(wm, { opacity: 0, y: 20 })
      .set(scr, { y: 900, opacity: 1 }).set($(".logo", scr), { opacity: 0 })
      .call(() => resetStats(scr));

    tl.to(pill, { opacity: 1, scale: 1, duration: .3, ease: "back.out(1.6)" }, .05)
      .to(typed, { n: TXT.length, duration: .42, ease: "steps(7)", onUpdate: type }, .28)
      .to(go, { opacity: 1, scale: 1, duration: .22, ease: "back.out(2.5)" }, .7)
      .to(go, { scale: .9, duration: .07, yoyo: true, repeat: 1 }, .95)
      .to(pill, { opacity: 0, scale: .96, y: () => 40 * u(), duration: .22, ease: "power2.in" }, 1.08)
      // Comet streak straight into the cow
      .set([ship, tail], { opacity: 1 }, 1.12).call(draw, null, 1.12)
      .to(c, { p: 1, duration: .4, ease: "power1.in", onUpdate: draw }, 1.12)
      .to([ship, tail], { opacity: 0, duration: .1 }, 1.52)
      .add(hitFx("C", em), 1.52)
      .to(cow, { scale: 1, rotation: 0, duration: .4, ease: "back.out(2.4)" }, 1.52)
      .to(wm, { opacity: 1, y: 0, duration: .28, stagger: .05, ease: "power3.out" }, 1.62);
    // Logo tucks into the dashbar as the dashboard rises
    tuck(tl, em, SX, SY, SS, 10, 2.05, .62);
    tl.to(scr, { y: 0, duration: .64, ease: "power2.inOut" }, 2.05)
      .to(em, { opacity: 0, duration: .12 }, 2.65).to($(".logo", scr), { opacity: 1, duration: .12 }, 2.65);
    const end = dashSeq(tl, scr, 2.69);
    // Back out to the logo: the page drops away and the logo grows back out of the dashbar
    tl.set(em, { opacity: 1 }, end).set($(".logo", scr), { opacity: 0 }, end)
      .to(em, { x: 0, y: 0, scale: 1, duration: 1.1, ease: "power2.inOut" }, end)
      .to(scr, { y: 900, duration: 1, ease: "power2.inOut" }, end);
    const fin = end + 1.1;
    return { tl, idle: logoIdle("C", em), final: () => { tl.pause(); tl.seek(fin, false); } };
  }

  /* ---------- Run: once on scroll into view, then idle on the logo ---------- */
  const key = direction === "a" ? "A" : "C";
  $("#clm-" + (key === "A" ? "C" : "A")).remove();
  $("#clm-" + key).classList.add("on");
  const scene = key === "A" ? buildA() : buildC();
  let played = false;
  let idling = false;
  let onScreen = false;

  if (reduce) {
    scene.final();
  } else {
    scene.tl.seek(0.01, false).pause();   // hold the opening frame (empty sky) until it scrolls into view
    scene.tl.eventCallback("onComplete", () => { idling = true; scene.idle.start(); if (!onScreen) scene.idle.pause(); });
  }

  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    banner.classList.toggle("is-offscreen", !onScreen);
    if (reduce) return;
    if (idling) { onScreen ? scene.idle.resume() : scene.idle.pause(); return; }
    if (!played && entry.intersectionRatio >= 0.4) {
      played = true;
      fontsReady.then(() => scene.tl.restart());
    }
  }, { threshold: [0, 0.4] });
  visibility.observe(banner);

  // Once it has finished and is idling on the logo, hovering with a mouse plays it again from the start.
  const replay = (e) => {
    if (e.pointerType !== "mouse" || reduce || !idling) return;
    idling = false;
    scene.idle.stop();
    scene.tl.restart();
  };
  banner.addEventListener("pointerenter", replay);

  return () => {
    banner.removeEventListener("pointerenter", replay);
    visibility.disconnect();
    observers.forEach((o) => o.disconnect());
    scene.idle.stop();
    scene.tl.kill();
  };
}

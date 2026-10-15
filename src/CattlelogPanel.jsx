import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import BANNER_MARKUP, { CATTLELOG_LOGO } from "./cattlelog-banner-markup.js";

gsap.registerPlugin(useGSAP);

// Cattlelog panel: the banner from cattlelog-banner/banner.html (markup, sizes and every animation
// timing/easing unchanged) inside the same card wrapper as the FindMyLab panel, with its caption below.
export default function CattlelogPanel() {
  const linkRef = useRef(null);
  const bannerRef = useRef(null);

  useGSAP(() => {
    const banner = bannerRef.current;
    const link = linkRef.current;
    if (!banner || !link || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined; // rest state is the static design

    const $ = (s) => banner.querySelector(s);
    const $$ = (s) => [...banner.querySelectorAll(s)];
    const floats = $$(".float");
    gsap.set(floats, { "--shadow": 0 });

    /* ---------- Cursor parallax (same system as FindMyLab) ---------- */
    const movers = [];
    for (const [cls, amp] of Object.entries({ "depth-0": 3, "depth-1": 6, "depth-2": 4, float: 10 })) {
      $$("." + cls).forEach((el) => {
        el.style.willChange = "transform";
        movers.push({ amp, x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power2.out" }), y: gsap.quickTo(el, "y", { duration: 1.4, ease: "power2.out" }) });
      });
    }
    const handleMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = banner.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5, k = banner.clientWidth / 1100;
      movers.forEach((m) => { m.x(-nx * m.amp * k); m.y(-ny * m.amp * k); });
    };

    /* ---------- Paper plane flight ----------
       One progress value drives both the plane (riding the path) and the trail (drawn behind it). */
    const trail = $("#cl-trail"), plane = $("#cl-plane");
    const L = trail.getTotalLength();
    const PIVOT = [140, 106];     // plane body center in its own coordinates
    const NOSE_OFFSET = 4.2;      // the drawing points ~4° above horizontal
    const flight = { s: 0 };      // distance from the landing spot; L = start of the loop
    function drawFlight() {
      const s = Math.max(0, Math.min(L, flight.s));
      const p = trail.getPointAtLength(s);
      const q = trail.getPointAtLength(Math.max(0, s - 6));
      let ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI - NOSE_OFFSET;
      // settle to the resting angle over the final stretch
      const settle = Math.min(1, s / 120);
      ang = ang * settle;
      plane.setAttribute("transform", `translate(${p.x - PIVOT[0]} ${p.y - PIVOT[1]}) rotate(${ang} ${PIVOT[0]} ${PIVOT[1]})`);
      trail.style.strokeDasharray = `0 ${s} ${L - s} ${L}`;
    }
    drawFlight();

    /* ---------- Loops pause while the banner is off screen ---------- */
    let onScreen = true;
    let ambient;
    let zeroG = [];
    const syncLoops = () => {
      banner.classList.toggle("is-offscreen", !onScreen);
      [ambient, ...zeroG].forEach((t) => t && (onScreen ? t.resume() : t.pause()));
    };
    const visibility = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; syncLoops(); });
    visibility.observe(banner);

    /* ---------- Ambient silk drift ---------- */
    const grad = $("#cl-grad");
    function startAmbient() {
      ambient && ambient.kill();
      ambient = gsap.timeline();
      // The silk slowly drifts while hovered
      ambient.add(gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } }).to(grad, { xPercent: -2, yPercent: 1.5, duration: 5.5 }), 0);
    }
    function stopAmbient() {
      ambient && ambient.kill();
      ambient = null;
      gsap.to(grad, { xPercent: 0, yPercent: 0, duration: 1.6, ease: "power2.out" });
    }

    /* ---------- Space extras ---------- */
    const shootStar = $("#cl-shootStar");
    const slots = $$(".slot");
    function startSpace() {
      banner.classList.add("is-hover");
      // A single shooting star streaks down across the top right
      gsap.fromTo(shootStar, { x: 4100, y: 60, rotation: -22.6, opacity: 0, svgOrigin: "0 0" },
        { keyframes: [{ opacity: 1, duration: 0.15 }, { x: 2900, y: 560, duration: 0.85, ease: "power1.in" }, { opacity: 0, duration: 0.25 }], delay: 0.5 });
      // Zero gravity: each floating piece drifts on its own slow loop
      zeroG.forEach((t) => t.kill());
      zeroG = slots.map((el, i) => gsap.to(el, { y: (i % 2 ? 1 : -1) * 12, rotation: (i % 2 ? -0.8 : 0.8), duration: 2.4 + i * 0.35, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.3 + i * 0.15 }));
    }
    function stopSpace() {
      banner.classList.remove("is-hover");
      zeroG.forEach((t) => t.kill()); zeroG = [];
      gsap.to(slots, { y: 0, rotation: 0, duration: 1, ease: "power2.out" });
      gsap.to(shootStar, { opacity: 0, duration: 0.2 });
    }

    /* ---------- Hover ---------- */
    const bars = $$(".bar"), gpas = $$(".gpaNum"), counts = $$(".count"), cow = $("#cl-cow"), logoCow = $("#cl-logo svg");
    const arrow = $(".stat .arrow"), site = $("#cl-site");
    let tl;
    let active = false;

    function enter() {
      active = true;
      tl && tl.kill();
      gsap.killTweensOf([flight, bars, cow, logoCow]);
      tl = gsap.timeline();

      // Plane loops in from the top of the banner and lands on the chart
      flight.s = L; drawFlight();
      tl.to(flight, { s: 0, duration: 1.9, ease: "power2.inOut", onUpdate: drawFlight }, 0);

      // Chart bars grow in pairs as the plane lands
      tl.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: "back.out(1.5)", stagger: { each: 0.06 } }, 1.15);
      gpas.forEach((el) => {
        const o = { v: 0 };
        tl.fromTo(o, { v: 0 }, { v: 3.2, duration: 0.9, ease: "expo.out", onUpdate: () => (el.textContent = o.v.toFixed(1)) }, 1.15);
      });

      // Stats count up
      counts.forEach((el, i) => {
        const to = +el.dataset.to, suf = el.dataset.suffix, o = { v: 0 };
        tl.fromTo(o, { v: 0 }, { v: to, duration: 1, ease: "expo.out", onUpdate: () => (el.textContent = Math.round(o.v) + suf) }, 0.15 + i * 0.1);
      });

      // Growth arrow nudges up-right once the count lands
      tl.fromTo(arrow, { scale: 0.6, x: -6, y: 6 }, { scale: 1, x: 0, y: 0, duration: 0.7, ease: "back.out(3)" }, 0.9);

      // The 404 cow shakes its head ("don't have a cow")
      tl.to(cow, { keyframes: [
        { rotation: -9, y: -4, duration: 0.12 }, { rotation: 8, duration: 0.14 }, { rotation: -5, duration: 0.14 },
        { rotation: 3, duration: 0.14 }, { rotation: 0, y: 0, duration: 0.3, ease: "power2.out" },
      ], ease: "sine.inOut" }, 0.35);

      // Logo cow gives a small nod
      tl.to(logoCow, { keyframes: [{ rotation: -6, duration: 0.25 }, { rotation: 0, duration: 0.6, ease: "back.out(2)" }], ease: "power2.out" }, 0.2);

      // Floating pieces lift, the course page eases forward
      tl.to(floats, { yPercent: -1.6, "--shadow": 0.35, duration: 1, ease: "power2.out", stagger: 0.05 }, 0);
      tl.to(site, { scale: 1.004, transformOrigin: "50% 100%", duration: 1.2, ease: "power2.out" }, 0);
      startAmbient();
      startSpace();
      syncLoops();
    }

    function leave() {
      active = false;
      tl && tl.kill();
      stopAmbient();
      stopSpace();
      // Whatever is mid-flight glides home
      gsap.to(flight, { s: 0, duration: Math.min(0.8, 0.25 + flight.s / L), ease: "power2.out", onUpdate: drawFlight });
      gsap.to(bars, { scaleY: 1, duration: 0.4, ease: "power2.out" });
      gpas.forEach((el) => (el.textContent = "3.2"));
      counts.forEach((el) => (el.textContent = el.dataset.to + el.dataset.suffix));
      gsap.to([cow, logoCow], { rotation: 0, y: 0, duration: 0.4, ease: "power2.out" });
      gsap.to(floats, { yPercent: 0, "--shadow": 0, duration: 0.9, ease: "power2.out" });
      gsap.to(site, { scale: 1, duration: 0.9, ease: "power2.out" });
      movers.forEach((m) => { m.x(0); m.y(0); });
    }

    // The banner sits inside the link to the case study, so (like the FindMyLab panel) it plays on
    // hover or keyboard focus, and on touch the first tap plays it and a second tap opens the page.
    let lastPointer = "mouse";
    const notePointer = (e) => { lastPointer = e.pointerType; };
    const handleClick = (e) => { if (lastPointer === "touch" && !active) { e.preventDefault(); enter(); } };
    const handleOutsideTap = (e) => { if (e.pointerType === "touch" && active && !link.contains(e.target)) leave(); };
    const handleFocus = () => { if (link.matches(":focus-visible")) enter(); };

    banner.addEventListener("mouseenter", enter);
    banner.addEventListener("mouseleave", leave);
    banner.addEventListener("pointermove", handleMove);
    link.addEventListener("pointerdown", notePointer);
    link.addEventListener("click", handleClick);
    link.addEventListener("focus", handleFocus);
    link.addEventListener("blur", leave);
    document.addEventListener("pointerdown", handleOutsideTap);

    return () => {
      visibility.disconnect();
      banner.removeEventListener("mouseenter", enter);
      banner.removeEventListener("mouseleave", leave);
      banner.removeEventListener("pointermove", handleMove);
      link.removeEventListener("pointerdown", notePointer);
      link.removeEventListener("click", handleClick);
      link.removeEventListener("focus", handleFocus);
      link.removeEventListener("blur", leave);
      document.removeEventListener("pointerdown", handleOutsideTap);
    };
  }, { scope: bannerRef });

  return (
    <a ref={linkRef} className="project-link fml-panel cl-panel" href="/cattlelog" aria-label="View Cattlelog project: helping 5000+ students find grade data faster">
      <div className="fml-panel__card">
        <div className="cl-panel__frame">
          <div
            ref={bannerRef}
            className="clb"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: BANNER_MARKUP }}
          />
        </div>
        <div className="fml-panel__caption">
          <p className="fml-panel__title cl-panel__title">
            <span dangerouslySetInnerHTML={{ __html: CATTLELOG_LOGO }} style={{ display: "contents" }} />
            Cattlelog <span>• 2026</span>
          </p>
          <p className="fml-panel__subtitle">helping 5000+ students find grade data faster</p>
        </div>
      </div>
    </a>
  );
}

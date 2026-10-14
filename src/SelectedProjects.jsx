import React, { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const assets = "/figma-projects/";
const WAVE_WIDTH = 832;
const WAVE_HEIGHT = 535;
const WAVE_SHAPE = "M0 219L37.5 214.5C75 210 150 201 225 225.5C300 250 375 308 450 326.7C525 345.3 600 324.7 675 322.5C750 320.3 825 336.7 862.5 344.8L900 353";
const REVEAL_COLORS = {
  findmylab: "#2568ff",
  cattlelog: "#1c45af",
};

function WaveRevealCard({ cardClassName = "", cover, coverCaption, revealColor, body, footer, tabIndex, ariaLabel }) {
  const cardRef = useRef(null);
  const pathRef = useRef(null);
  const shapeRef = useRef(null);
  const textRef = useRef(null);
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const maskId = `wave-reveal-mask-${instanceId}`;

  useEffect(() => {
    const card = cardRef.current;
    const path = pathRef.current;
    const shape = shapeRef.current;
    const text = textRef.current;
    if (!card || !path || !shape || !text) return undefined;
    const focusTarget = card.closest("a") || card;

    const motion = {
      SPEED: 1.7,
      BOUNCE: 0.42,
      SPRING_FREQ: 12,
      SPRING_KICK: 5.5,
      STAGGER: 0.01,
      TEXT_POP: 55,
      RISE: 0.34,
      SAMPLES: 11,
      OVERSHOOT: 0.6,
      PUNCH: 0.012,
      RIPPLE: 0.03,
      RIPPLE_WAVES: 1.8,
      RIPPLE_LENGTH: 1.6,
    };
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = prefersReducedMotion ? 0.01 : 1 / motion.SPEED;
    const sourceWidth = Number(shape.dataset.width);
    const sourceHeight = Number(shape.dataset.height);
    const shapeLength = shape.getTotalLength();
    const yAt = (normalizedX) => {
      let low = 0;
      let high = shapeLength;
      for (let index = 0; index < 22; index += 1) {
        const middle = (low + high) / 2;
        if (shape.getPointAtLength(middle).x / sourceWidth < normalizedX) low = middle;
        else high = middle;
      }
      return Math.max(0.01, shape.getPointAtLength(high).y / sourceHeight - motion.RISE);
    };
    const step = 1 / (motion.SAMPLES - 1);
    const extension = 0.06;
    const sampled = Array.from({ length: motion.SAMPLES }, (_, index) => {
      const x = index * step;
      return { x, y: yAt(x) };
    });
    const rest = [
      { x: -extension, y: Math.max(0.01, sampled[0].y - ((sampled[1].y - sampled[0].y) / step) * extension) },
      ...sampled,
      { x: 1 + extension, y: Math.max(0.01, sampled[motion.SAMPLES - 1].y + ((sampled[motion.SAMPLES - 1].y - sampled[motion.SAMPLES - 2].y) / step) * extension) },
    ];
    const hiddenY = 1.1;
    const points = rest.map((point) => ({ x: point.x, rest: point.y, y: hiddenY }));
    const ripple = { amplitude: 0, phase: 0 };
    let timeline;

    const pathData = (renderPoints) => {
      let value = `M${renderPoints[0].x},${renderPoints[0].y}`;
      for (let index = 0; index < renderPoints.length - 1; index += 1) {
        const previous = renderPoints[index - 1] || renderPoints[index];
        const current = renderPoints[index];
        const next = renderPoints[index + 1];
        const after = renderPoints[index + 2] || next;
        value += ` C${(current.x + (next.x - previous.x) / 6).toFixed(1)},${(current.y + (next.y - previous.y) / 6).toFixed(1)}`;
        value += ` ${(next.x - (after.x - current.x) / 6).toFixed(1)},${(next.y - (after.y - current.y) / 6).toFixed(1)}`;
        value += ` ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
      }
      return `${value} L${renderPoints[renderPoints.length - 1].x},${WAVE_HEIGHT * 1.5} L${renderPoints[0].x},${WAVE_HEIGHT * 1.5} Z`;
    };
    const pointHeight = (point) => {
      if (point.y >= point.rest) return point.y;
      const cap = point.rest * motion.OVERSHOOT;
      return point.rest - cap * Math.tanh((point.rest - point.y) / cap);
    };
    const render = () => {
      path.setAttribute("d", pathData(points.map((point) => {
        const room = 0.3 + 0.7 * Math.min(1, point.rest / 0.15);
        const wave = ripple.amplitude * motion.RIPPLE * room * Math.sin(ripple.phase - point.x * motion.RIPPLE_LENGTH * Math.PI * 2);
        return { x: point.x * WAVE_WIDTH, y: Math.max(0.004, pointHeight(point) + wave) * WAVE_HEIGHT };
      })));
    };
    const spring = (damping = motion.BOUNCE, frequency = motion.SPRING_FREQ, kick = motion.SPRING_KICK) => {
      const dampedFrequency = frequency * Math.sqrt(1 - damping * damping);
      const offset = (damping * frequency - kick) / dampedFrequency;
      const raw = (time) => 1 - Math.exp(-damping * frequency * time) * (Math.cos(dampedFrequency * time) + offset * Math.sin(dampedFrequency * time));
      const correction = 1 - raw(1);
      return (time) => raw(time) + correction * time * time * (3 - 2 * time);
    };
    const rise = () => {
      timeline?.kill();
      timeline = gsap.timeline({ onUpdate: render })
        .to(points, {
          y: (_index, point) => point.rest,
          duration: 0.9 * speed,
          ease: spring(),
          stagger: { each: motion.STAGGER * speed, from: "center" },
        }, 0)
        .fromTo(text, { y: motion.TEXT_POP, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.8 * speed,
          ease: spring(motion.BOUNCE, 11, 3.5),
          overwrite: true,
        }, 0.1 * speed)
        .to(card, { scale: 1 + motion.PUNCH, duration: 0.12 * speed, ease: "sine.out" }, 0.15 * speed)
        .to(card, { scale: 1, duration: 0.6 * speed, ease: spring(0.55, 10, 1), overwrite: "auto" }, 0.27 * speed)
        .set(ripple, { phase: 0 }, 0.25 * speed)
        .to(ripple, { amplitude: 1, duration: 0.1 * speed, ease: "sine.out" }, 0.25 * speed)
        .to(ripple, { amplitude: 0, duration: 0.8 * speed, ease: "sine.inOut" }, 0.35 * speed)
        .to(ripple, { phase: motion.RIPPLE_WAVES * Math.PI * 2, duration: 0.95 * speed, ease: "none" }, 0.25 * speed);
    };
    const recede = () => {
      if (card.matches(":hover") || focusTarget.matches(":focus")) return;
      timeline?.kill();
      timeline = gsap.timeline({ onUpdate: render })
        .to(points, {
          y: hiddenY,
          duration: 0.4 * speed,
          ease: "power3.out",
          stagger: { each: 0.012 * speed, from: "edges" },
        }, 0)
        .to(text, { y: motion.TEXT_POP * 0.6, opacity: 0, duration: 0.25 * speed, ease: "power2.in", overwrite: true }, 0)
        .to(card, { scale: 1, duration: 0.2 * speed, ease: "power2.out" }, 0)
        .to(ripple, { amplitude: 0, duration: 0.1 * speed }, 0);
    };
    const handlePointerLeave = recede;
    const handleBlur = recede;

    gsap.set(text, { y: motion.TEXT_POP, opacity: 0 });
    render();
    card.addEventListener("pointerenter", rise);
    card.addEventListener("pointerleave", handlePointerLeave);
    focusTarget.addEventListener("focus", rise);
    focusTarget.addEventListener("blur", handleBlur);

    return () => {
      timeline?.kill();
      card.removeEventListener("pointerenter", rise);
      card.removeEventListener("pointerleave", handlePointerLeave);
      focusTarget.removeEventListener("focus", rise);
      focusTarget.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Jelly hover: flicking the pointer across the card stretches it along the direction of travel
  // (and squeezes it across), then a spring lets it wobble back. Reading-pace movement adds no
  // energy, so the card stays still while someone reads; playful movement makes it squish.
  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const jellyTarget = card.closest(".project-link") || card;

    const JELLY = {
      STRETCH: 0.035, // 3.5% longer along the movement whenever the card is being played with
      SPEED_FLOOR: 0.35, // px/ms below this counts as reading, adds no energy
      SPEED_RANGE: 0.6, // px/ms above the floor to reach full energy; anything faster looks the same
      SPEED_CAP: 2, // px/ms; faster readings are clipped so they can't spike anything
      RISE: 0.06, // energy builds gradually...
      SETTLE: 0.04, // ...and drains gradually
      AXIS_EASE: 0.08, // per frame: the stretch axis turns at a steady rate, however fast the pointer is
      STIFFNESS: 0.07, // soft spring
      DAMPING: 0.9, // a gentle settle on release
    };
    const clamp01 = (value) => Math.min(1, Math.max(0, value));

    let frame = 0;
    let inside = false;
    let last = null;
    let travelled = 0; // pointer distance since the previous frame
    let lastFrame = 0;
    let speed = 0;
    let energy = 0;
    // Axes are stored as doubled angles (cos 2θ, sin 2θ) so left and right share one axis
    // and whipping back and forth never spins the stretch around.
    let moveX = 1;
    let moveY = 0;
    let axisX = 1;
    let axisY = 0;
    let stretch = 0;
    let stretchVelocity = 0;

    const tick = (now) => {
      // Measure speed once per frame from the distance travelled, so it reads the same on any
      // mouse, however often it reports; a resting pointer reads as zero and energy drains.
      const dt = lastFrame ? Math.min(64, Math.max(1, now - lastFrame)) : 16;
      lastFrame = now;
      speed = speed * 0.88 + Math.min(travelled / dt, JELLY.SPEED_CAP) * 0.12;
      travelled = 0;
      const targetEnergy = inside ? clamp01((speed - JELLY.SPEED_FLOOR) / JELLY.SPEED_RANGE) : 0;
      energy += (targetEnergy - energy) * (targetEnergy > energy ? JELLY.RISE : JELLY.SETTLE);

      axisX += (moveX - axisX) * JELLY.AXIS_EASE;
      axisY += (moveY - axisY) * JELLY.AXIS_EASE;

      // Same stretch at any playful speed: energy only decides how "on" the effect is.
      stretchVelocity = (stretchVelocity + (energy * JELLY.STRETCH - stretch) * JELLY.STIFFNESS) * JELLY.DAMPING;
      stretch += stretchVelocity;

      // Stretch along the axis and squeeze across it, keeping the area constant.
      const angle = (Math.atan2(axisY, axisX) / 2) * (180 / Math.PI);
      const along = 1 + stretch;
      jellyTarget.style.transform = `rotate(${angle.toFixed(2)}deg) scale(${along.toFixed(4)}, ${(1 / along).toFixed(4)}) rotate(${(-angle).toFixed(2)}deg)`;

      const settled = !inside && energy < 0.001 && Math.abs(stretch) < 0.0004 && Math.abs(stretchVelocity) < 0.0004;
      if (settled) {
        jellyTarget.style.transform = "";
        lastFrame = 0;
        speed = 0;
        energy = 0;
        stretch = 0;
        stretchVelocity = 0;
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => { if (!frame) frame = requestAnimationFrame(tick); };

    const handleMove = (event) => {
      if (event.pointerType === "touch") return;
      if (last) {
        const dx = event.clientX - last.x;
        const dy = event.clientY - last.y;
        const distance = Math.hypot(dx, dy);
        travelled += distance;
        // Note the latest movement axis; the frame loop eases toward it at a steady rate.
        if (distance > 2) {
          const doubled = 2 * Math.atan2(dy, dx);
          moveX = moveX * 0.6 + Math.cos(doubled) * 0.4;
          moveY = moveY * 0.6 + Math.sin(doubled) * 0.4;
        }
      }
      last = { x: event.clientX, y: event.clientY };
      inside = true;
      start();
    };
    const handleLeave = () => {
      inside = false;
      last = null;
      start();
    };

    card.addEventListener("pointermove", handleMove);
    card.addEventListener("pointerleave", handleLeave);
    return () => {
      cancelAnimationFrame(frame);
      card.removeEventListener("pointermove", handleMove);
      card.removeEventListener("pointerleave", handleLeave);
      jellyTarget.style.transform = "";
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`project-card wave-reveal-card ${cardClassName}`}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
    >
      <div className="wave-reveal-card__cover">
        {cover}
        {coverCaption}
      </div>
      <svg className="wave-reveal-card__svg" viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <path ref={shapeRef} fill="none" data-width="900" data-height="600" d={WAVE_SHAPE} />
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={WAVE_WIDTH} height={WAVE_HEIGHT}>
            <path ref={pathRef} fill="#fff" d={`M-40,590 L872,590 L872,800 L-40,800 Z`} />
          </mask>
        </defs>
        <rect width={WAVE_WIDTH} height={WAVE_HEIGHT} fill={revealColor} mask={`url(#${maskId})`} />
      </svg>
      <div ref={textRef} className="wave-reveal-card__text">
        <div className="wave-reveal-card__body">
          <p>{body}</p>
        </div>
        <div className="wave-reveal-card__footer">{footer}</div>
      </div>
    </div>
  );
}

function CattlelogVisual() {
  return (
    <WaveRevealCard
      cardClassName="project-card--cattlelog"
      cover={(
        <div className="cattlelog-collage" aria-hidden="true">
          <img className="cattlelog-part cattlelog-part--2" src={`${assets}cattlelog-part-2.png`} alt="" />
          <img className="cattlelog-part cattlelog-part--1" src={`${assets}cattlelog-part-1.png`} alt="" />
        </div>
      )}
      coverCaption={<p className="project-card__caption"><strong>Cattlelog</strong> <span>business 2 consumers</span></p>}
      revealColor={REVEAL_COLORS.cattlelog}
      body="Cattlelog is a platform that helps students find courses and professor reviews at UC Davis"
      footer={<><strong>Cattlelog</strong> business 2 consumers</>}
    />
  );
}

const panelAssets = `${assets}fml-panel/`;

// FindMyLab panel, built from Figma (portfolio-2026, node 440:45). Every measurement is in
// Figma pixels times --u (the panel width / 4533), so the whole panel scales as one piece.
const SEARCH_PHRASE = "Neuroscience and Linguistics";

// Each stat card sits in a slot that owns its Figma position. The slot is what closes the gap
// between the cards (yPercent), so the card itself is free to lift and parallax.
function StatChip({ slotClassName, className, label, value, tag }) {
  return (
    <div className={`fml-panel__slot ${slotClassName}`}>
      <div className={`fml-panel__chip ${className}`}>
        <p className="fml-panel__chip-label">{label}</p>
        <div className="fml-panel__chip-row">
          {/* An invisible copy of the final number reserves its width while the count runs. */}
          <p className="fml-panel__chip-value">
            <span className="fml-panel__count-ghost">{value}</span>
            <span className="fml-panel__count" data-final={parseInt(value, 10)}>{value}</span>
          </p>
          <div className="fml-panel__chip-tag">
            <img src={`${panelAssets}icon-sparkle.svg`} width="48" height="48" alt="" />
            <p>{tag}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Keystroke timing for the search bar: 24–46ms per key, a beat around spaces, a touch longer
// on capitals, and a short pause after the first word.
function typingDelays(phrase) {
  return [...phrase].map((char, index) => {
    let delay = gsap.utils.random(24, 46) / 1000;
    if (char === " ") delay += 0.018;
    if (index > 0 && phrase[index - 1] === " ") delay += 0.03;
    if (char !== " " && char === char.toUpperCase()) delay += 0.02;
    if (phrase.slice(0, index) === "Neuroscience") delay += 0.07;
    return delay;
  });
}

function FindMyLabPanel() {
  const linkRef = useRef(null);
  const bannerRef = useRef(null);

  useGSAP(() => {
    const banner = bannerRef.current;
    const link = linkRef.current;
    if (!banner || !link || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const q = (selector) => banner.querySelector(selector);
    const waveLeft = q(".fml-panel__blob-top");
    const waveRight = q(".fml-panel__blob-bottom");
    const magnifier = q(".fml-panel__magnifier");
    const eraser = q(".fml-panel__microscope");
    const books = q(".fml-panel__books");
    const flask = q(".fml-panel__flask");
    const site = q(".fml-panel__visual");
    const search = q(".fml-panel__search");
    const typed = q(".fml-panel__typed");
    const caret = q(".fml-panel__caret");
    const majorLabel = q(".fml-panel__major-label");
    const chip = q(".fml-panel__major-pill");
    const brain = q(".fml-panel__major-pill img");
    const button = q(".fml-panel__search-button");
    const searchIcon = q(".fml-panel__search-button img");
    const slotUsers = q(".fml-panel__slot--users");
    const slotSignups = q(".fml-panel__slot--signups");
    const cardUsers = q(".fml-panel__chip--users");
    const cardSignups = q(".fml-panel__chip--signups");
    const photo = q(".fml-panel__photo");
    const counts = [...banner.querySelectorAll(".fml-panel__count")];
    const sparkles = [...banner.querySelectorAll(".fml-panel__chip-tag img")];
    const doodles = [magnifier, eraser, books, flask];
    const lifted = [search, cardUsers, cardSignups, photo];

    // Sizes in the spec are for a ~1100px-wide banner; scale them with the real one.
    const bannerScale = () => banner.offsetWidth / 1100;
    const restShadow = (f) => `0 ${4 * f}px ${14 * f}px rgba(20, 60, 110, 0.06)`;
    const liftShadow = (f) => `0 ${30 * f}px ${80 * f}px rgba(20, 60, 110, 0.12)`;
    const noShadow = "0 0px 0px rgba(20, 60, 110, 0)";

    // Rest state: the stat cards sit 40px apart around their Figma midpoint, and the photo waits off to the side.
    gsap.set(slotUsers, { yPercent: 82.53 });
    gsap.set(slotSignups, { yPercent: -82.53 });
    gsap.set(photo, { xPercent: 18, scale: 0.98, autoAlpha: 0, transformOrigin: "right center" });
    gsap.set(site, { transformOrigin: "50% 100%" });
    gsap.set([waveLeft, waveRight, ...doodles, searchIcon], { transformOrigin: "50% 50%" });

    // Cursor parallax: each layer drifts opposite the cursor by up to this many px (at 1100px).
    const parallaxLayers = [
      { els: [waveLeft, waveRight], max: 3 },
      { els: [eraser, books], max: 6 }, // the magnifier and flask touch the edge, so they only tilt
      { els: [site], max: 4 },
      { els: [search, cardUsers, cardSignups, photo], max: 10 },
    ].flatMap(({ els, max }) => els.map((el) => ({
      max,
      x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power2.out" }),
      y: gsap.quickTo(el, "y", { duration: 1.4, ease: "power2.out" }),
    })));

    let active = false;
    let midTyping = false;
    let enterTl = null;
    let typingTl = null;
    let leaveTl = null;
    let loops = [];

    const setCount = (el, value) => { el.textContent = `${Math.round(value)}+`; };

    const startTyping = () => {
      midTyping = true;
      const delays = typingDelays(SEARCH_PHRASE);
      typingTl = gsap.timeline()
        .to([typed, majorLabel, chip], { autoAlpha: 0, duration: 0.14, ease: "power2.in" })
        .call(() => {
          typed.textContent = "";
          gsap.set(typed, { autoAlpha: 1 });
          gsap.set(caret, { autoAlpha: 1 });
        });
      let time = typingTl.duration();
      delays.forEach((delay, index) => {
        time += delay;
        typingTl.call(() => { typed.textContent = SEARCH_PHRASE.slice(0, index + 1); }, null, time);
      });
      typingTl
        .call(() => { midTyping = false; caret.classList.add("is-blinking"); }, null, time)
        .fromTo(majorLabel, { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, time)
        .fromTo(chip, { autoAlpha: 0, y: 6, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.2)" }, time + 0.05)
        .fromTo(brain, { scale: 0.85 }, { scale: 1, duration: 0.6, ease: "back.out(2)" }, time + 0.05);
      const press = time + 0.55;
      typingTl
        .call(() => { caret.classList.remove("is-blinking"); gsap.set(caret, { autoAlpha: 0 }); }, null, press)
        .to(button, { scale: 0.96, duration: 0.1 }, press)
        .to(button, { scale: 1, duration: 0.5, ease: "back.out(2)" }, press + 0.1)
        .to(searchIcon, { rotation: -14, scale: 1.08, duration: 0.14, ease: "sine.inOut" }, press)
        .to(searchIcon, { rotation: 10, duration: 0.16, ease: "sine.inOut" })
        .to(searchIcon, { rotation: -5, scale: 1.04, duration: 0.16, ease: "sine.inOut" })
        .to(searchIcon, { rotation: 0, scale: 1, duration: 0.4, ease: "power3.out" });
    };

    const stopEverything = () => {
      enterTl?.kill();
      typingTl?.kill();
      leaveTl?.kill();
      loops.forEach((tween) => tween.kill());
      loops = [];
    };

    const enter = () => {
      if (active) return;
      active = true;
      stopEverything(); // re-entering mid-animation starts the hover sequence fresh
      const f = bannerScale();
      const counters = counts.map((el) => ({ el, value: 0, final: Number(el.dataset.final) }));
      counters.forEach(({ el }) => setCount(el, 0));

      enterTl = gsap.timeline()
        // Stat cards close up and the photo slides in.
        .to([slotUsers, slotSignups], { yPercent: 0, duration: 0.8, ease: "power2.inOut" }, 0)
        .to(photo, { xPercent: 0, scale: 1, duration: 0.9, ease: "expo.out" }, 0.18)
        .to(photo, { autoAlpha: 1, duration: 0.4 }, 0.18)
        // Counts and sparkles.
        .to(counters, { value: (_i, c) => c.final, duration: 1, ease: "expo.out", stagger: 0.1, onUpdate() { this.targets().forEach((c) => setCount(c.el, c.value)); } }, 0.1)
        .fromTo(sparkles, { scale: 0.7, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)", stagger: 0.1 }, 0.25)
        // Foreground lift and the site screenshot breathing in.
        .to(lifted, { yPercent: -1.6, boxShadow: liftShadow(f), duration: 1, ease: "power2.out", stagger: 0.05 }, 0)
        .to(site, { scale: 1.004, duration: 1.2, ease: "power2.out" }, 0)
        // Background: waves grow so their clipped edges stay out of frame; doodles tilt.
        .to([waveLeft, waveRight], { scale: 1.045, duration: 1.6, ease: "power2.out" }, 0)
        .to(doodles, { rotation: (i) => (i % 2 ? -4 : 4), duration: 1.4, ease: "power2.out", stagger: 0.05 }, 0);

      const loop = { repeat: -1, yoyo: true, ease: "sine.inOut" };
      loops = [
        gsap.to(waveLeft, { xPercent: 1.1, yPercent: -0.9, rotation: 0.7, duration: 4.2, ...loop }),
        gsap.to(waveRight, { xPercent: -1, yPercent: 1.1, rotation: -0.6, duration: 5, delay: 0.4, ...loop }),
        gsap.to(books, { yPercent: -0.9, duration: 2.6, ...loop }),
        gsap.to(eraser, { yPercent: 0.9, duration: 3.1, ...loop }),
      ];
      startTyping();
    };

    const leave = () => {
      if (!active) return;
      active = false;
      const wasTyping = midTyping;
      stopEverything();
      midTyping = false;
      const f = bannerScale();

      // Search bar: full phrase back, caret hidden, nothing left mid-motion.
      typed.textContent = SEARCH_PHRASE;
      caret.classList.remove("is-blinking");
      gsap.set(caret, { autoAlpha: 0 });
      gsap.to([typed, majorLabel, chip], { autoAlpha: 1, y: 0, scale: 1, duration: wasTyping ? 0.35 : 0.2 });
      gsap.to(brain, { scale: 1, duration: 0.3 });
      gsap.to(button, { scale: 1, duration: 0.3 });
      gsap.to(searchIcon, { rotation: 0, scale: 1, duration: 0.3 });
      counts.forEach((el) => setCount(el, Number(el.dataset.final)));
      gsap.to(sparkles, { scale: 1, rotation: 0, duration: 0.4 });
      parallaxLayers.forEach(({ x, y }) => { x(0); y(0); });

      leaveTl = gsap.timeline()
        .to(photo, { xPercent: 18, scale: 0.98, duration: 0.5, ease: "power2.inOut" }, 0)
        .to(photo, { autoAlpha: 0, duration: 0.3 }, 0.08)
        .to(slotUsers, { yPercent: 82.53, duration: 0.75, ease: "power2.inOut" }, 0.14)
        .to(slotSignups, { yPercent: -82.53, duration: 0.75, ease: "power2.inOut" }, 0.14)
        .to([waveLeft, waveRight], { scale: 1, xPercent: 0, yPercent: 0, rotation: 0, duration: 1.4, ease: "power2.out" }, 0)
        .to(doodles, { rotation: 0, yPercent: 0, duration: 1.2, ease: "power2.out" }, 0)
        .to(search, { yPercent: 0, boxShadow: restShadow(f), duration: 0.9, ease: "power2.out" }, 0)
        .to([cardUsers, cardSignups, photo], { yPercent: 0, boxShadow: noShadow, duration: 0.9, ease: "power2.out" }, 0)
        .to(site, { scale: 1, duration: 1.2, ease: "power2.out" }, 0);
    };

    const handleMove = (event) => {
      if (event.pointerType !== "mouse" || !active) return;
      const rect = banner.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      const f = bannerScale();
      parallaxLayers.forEach(({ max, x, y }) => { x(-nx * max * f); y(-ny * max * f); });
    };

    // Touch: the first tap plays the animation instead of following the link; a second tap opens it.
    let lastPointer = "mouse";
    const notePointer = (event) => { lastPointer = event.pointerType; };
    const handleClick = (event) => {
      if (lastPointer === "touch" && !active) {
        event.preventDefault();
        enter();
      }
    };
    const handleOutsideTap = (event) => {
      if (event.pointerType === "touch" && active && !link.contains(event.target)) leave();
    };
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
      stopEverything();
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
    <a ref={linkRef} className="project-link fml-panel" href="/findmylab2026" aria-label="View FindMyLab project: designing a platform for UC Davis students to find labs">
      <div className="fml-panel__card">
      <div ref={bannerRef} className="fml-panel__banner" aria-hidden="true">
        <div className="fml-panel__magnifier">
          <img src={`${panelAssets}magnifier.svg`} width="620.287" height="779.624" alt="" />
        </div>
        <div className="fml-panel__rotated fml-panel__flask">
          <div><img src={`${panelAssets}icon-flask.svg`} width="405" height="405" alt="" /></div>
        </div>
        <div className="fml-panel__skewed fml-panel__blob-top">
          <div><img src={`${panelAssets}blob-top.svg`} width="7934.37" height="1391.79" alt="" /></div>
        </div>
        <div className="fml-panel__skewed fml-panel__books">
          <div><img src={`${panelAssets}icon-books.svg`} width="301.845" height="347.623" alt="" /></div>
        </div>
        <div className="fml-panel__skewed fml-panel__blob-bottom">
          <div><img src={`${panelAssets}blob-bottom.svg`} width="6013" height="1588.65" alt="" /></div>
        </div>
        <div className="fml-panel__visual">
          <img src={`${panelAssets}visual-left.png`} width="1680" height="1374" alt="" />
        </div>
        <div className="fml-panel__rotated fml-panel__microscope">
          <div><img src={`${panelAssets}icon-microscope.svg`} width="621" height="621" alt="" /></div>
        </div>
        <StatChip slotClassName="fml-panel__slot--users" className="fml-panel__chip--users" label="Users" value="1000+" tag="Early Traction" />
        <div className="fml-panel__photo">
          <img src={`${panelAssets}team-photo.png`} width="882" height="474" alt="" />
        </div>
        <StatChip slotClassName="fml-panel__slot--signups" className="fml-panel__chip--signups" label="Signups" value="100+" tag="Before Launch" />
        <div className="fml-panel__search">
          <div className="fml-panel__search-query">
            {/* The invisible full phrase keeps the box at its final width while the text is typed. */}
            <p className="fml-panel__search-text">
              <span className="fml-panel__search-ghost">{SEARCH_PHRASE}</span>
              <span className="fml-panel__search-live">
                <span className="fml-panel__typed">{SEARCH_PHRASE}</span>
                <span className="fml-panel__caret" />
              </span>
            </p>
            <div className="fml-panel__divider">
              <div><img src={`${panelAssets}divider.svg`} width="100" height="3" alt="" /></div>
            </div>
            <div className="fml-panel__major">
              <p className="fml-panel__major-label">Major</p>
              <div className="fml-panel__major-pill">
                <img src={`${panelAssets}icon-major.svg`} width="30.75" height="30.75" alt="" />
                <p>Cognitive Science</p>
              </div>
            </div>
          </div>
          <div className="fml-panel__search-button">
            <img src={`${panelAssets}icon-search.svg`} width="30" height="30" alt="" />
            <p>Search</p>
          </div>
        </div>
      </div>
      <div className="fml-panel__caption">
        <p className="fml-panel__title">FindMyLab <span>• 2025</span></p>
        <p className="fml-panel__subtitle">designing a platform for UC Davis students to find labs</p>
      </div>
      </div>
    </a>
  );
}

export default function SelectedProjects() {
  return (
    <section className="selected-projects" aria-labelledby="selected-projects-title">
      <div className="selected-projects__inner">
        <header className="selected-projects__heading">
          <h2 id="selected-projects-title">Selected <strong>Projects</strong></h2>
          <p>Designing thoughtful products and services that solve real problems for the communities they serve.</p>
        </header>
        <div className="selected-projects__list">
          <div className="selected-projects__row selected-projects__row--panel">
            <FindMyLabPanel />
          </div>
          <div className="selected-projects__row selected-projects__row--cattlelog">
            <div className="project-aside project-aside--cattlelog" aria-hidden="true">
              <div className="project-aside__dark" />
              <div className="project-aside__pale" />
            </div>
            <a className="project-link" href="/cattlelog" aria-label="View Cattlelog project">
              <CattlelogVisual />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
import React, { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";

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

export default function SelectedProjects() {
  return (
    <section className="selected-projects" aria-labelledby="selected-projects-title">
      <div className="selected-projects__inner">
        <header className="selected-projects__heading">
          <h2 id="selected-projects-title">Selected <strong>Projects</strong></h2>
          <p>Designing thoughtful products and services that solve real problems for the communities they serve.</p>
        </header>
        <div className="selected-projects__list">
          <div className="selected-projects__row selected-projects__row--findmylab">
            <a className="project-link" href="/findmylab2026" aria-label="View FindMyLab project">
              <WaveRevealCard
                cardClassName="project-card--findmylab"
                cover={<img src={`${assets}findmylab-cover.png`} alt="" />}
                revealColor={REVEAL_COLORS.findmylab}
                body="FindMyLab is a platform that allows students to discover and match research labs more efficiently"
                footer={<><strong>FindMyLab</strong> business 2 consumers</>}
              />
            </a>
            <div className="project-aside project-aside--findmylab" aria-hidden="true">
              <div className="project-aside__blue" />
              <div className="project-aside__photo"><img src={`${assets}findmylab-screen.png`} alt="" /></div>
            </div>
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
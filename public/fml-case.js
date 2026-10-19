/* FindMyLab case study: demo videos and the help-guide walkthrough (GSAP 3.12.5 + MotionPathPlugin). */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Pause / play button in a media block's top-right corner ---------- */
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="3.6" height="14" rx="1.2"/><rect x="13.9" y="5" width="3.6" height="14" rx="1.2"/></svg>';
  const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.6v12.8c0 .8.9 1.3 1.6.8l9.6-6.4a1 1 0 0 0 0-1.6L9.6 4.8C8.9 4.3 8 4.8 8 5.6Z"/></svg>';
  const addToggle = (host, label, { play, pause }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "fml-toggle";
    const show = (paused) => {
      button.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
      button.setAttribute("aria-label", `${paused ? "Play" : "Pause"} ${label}`);
    };
    button.addEventListener("click", () => {
      const paused = button.dataset.paused === "true";
      button.dataset.paused = String(!paused);
      show(!paused);
      paused ? play() : pause();
    });
    button.dataset.paused = "false";
    show(false);
    host.append(button);
    return button;
  };

  /* ---------- Videos: play only while on screen (unless paused); with reduced motion, stay on the poster ---------- */
  document.querySelectorAll(".fml-video").forEach((video) => {
    const toggle = addToggle(video.closest(".fml-media"), "video", { play: () => video.play().catch(() => {}), pause: () => video.pause() });
    if (reduce) {
      video.removeAttribute("autoplay");
      video.pause();
      toggle.dataset.paused = "true";
      toggle.innerHTML = ICON_PLAY;
      toggle.setAttribute("aria-label", "Play video");
      return;
    }
    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && toggle.dataset.paused !== "true") video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.15 }).observe(video);
  });

  /* ---------- Help guide: the four steps play through on their own, and Next / back work too ---------- */
  const guide = document.getElementById("fml-guide");
  if (!guide) return;
  const modal = guide.querySelector(".gd-modal");
  const steps = [...modal.querySelectorAll(".gd-step")];
  const count = modal.querySelector(".gd-count");
  const next = modal.querySelector(".gd-next");
  const back = modal.querySelector(".gd-back");
  const STEPS = steps.length;
  let current = 1;

  const setStep = (n) => {
    current = n;
    modal.dataset.step = n;
    steps.forEach((step) => step.classList.toggle("is-current", Number(step.dataset.step) === n));
    count.textContent = `${n} of ${STEPS}`;
    next.textContent = n === STEPS ? "Exit" : "Next";
    next.setAttribute("aria-label", n === STEPS ? "Exit guide, back to step 1" : "Next step");
  };
  setStep(1);

  if (reduce || !window.gsap) {
    next.addEventListener("click", () => setStep(current % STEPS + 1));
    back.addEventListener("click", () => setStep(Math.max(1, current - 1)));
    return;
  }

  const motionPath = !!window.MotionPathPlugin;
  if (motionPath) gsap.registerPlugin(MotionPathPlugin);
  modal.classList.add("is-animated");

  const q = (step, selector) => [...steps[step - 1].querySelectorAll(selector)];
  const cursor = modal.querySelector(".gd-cursor");
  // Where the Next button's centre is, in the modal's own pixels (the modal scales with the page).
  const nextPoint = () => {
    const m = modal.getBoundingClientRect(), b = next.getBoundingClientRect();
    return { x: b.left - m.left + b.width * 0.55, y: b.top - m.top + b.height * 0.55 };
  };

  const tl = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: "power3.out" } });

  // Shared entrance and exit for each step: title and text slide in, the graphic settles.
  const enter = (n) => {
    tl.addLabel(`in${n}`).call(setStep, [n]);
    tl.fromTo(q(n, ".gd-title"), { autoAlpha: 0, x: 28 }, { autoAlpha: 1, x: 0, duration: 0.6 });
    tl.fromTo(q(n, ".gd-sheet, .gd-email"), { autoAlpha: 0, y: 18, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7 }, "<0.08");
    tl.fromTo(q(n, ".gd-body"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "<0.12");
  };
  const advance = (n) => {
    const hold = n === 3 ? 2.2 : 1.8;
    tl.fromTo(cursor, { autoAlpha: 0, x: () => nextPoint().x - 120, y: () => nextPoint().y - 70, scale: 1 },
      { autoAlpha: 1, x: () => nextPoint().x - 4, y: () => nextPoint().y - 4, duration: 0.85, ease: "power2.inOut" }, `+=${hold}`);
    tl.to(cursor, { scale: 0.82, duration: 0.12, ease: "power1.in" })
      .to(next, { scale: 0.92, duration: 0.12, ease: "power1.in" }, "<")
      .to([cursor, next], { scale: 1, duration: 0.35, ease: "back.out(3)" });
    tl.to(steps[n - 1].children, { autoAlpha: 0, x: -24, duration: 0.4, ease: "power2.in", stagger: 0.02 }, "<0.05")
      .to(cursor, { autoAlpha: 0, duration: 0.3 }, "<0.15");
  };

  /* Step 1: interests branch out into fields. Each arrow grows from "Interests" to its field. */
  tl.fromTo(modal, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.7 });
  enter(1);
  tl.fromTo(q(1, ".gd-chip--root"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.2)" }, "-=0.2");
  q(1, ".gd-arrow").forEach((arrow, i) => {
    const d = arrow.getAttribute("d");
    tl.fromTo(arrow, { autoAlpha: 0, attr: { d: d.replace(/L\s*[\d.]+\s+[\d.]+/, "L368 318") } },
      { autoAlpha: 1, attr: { d }, duration: 0.55, ease: "power2.out" }, i ? "<0.14" : "+=0.05");
  });
  tl.fromTo(q(1, ".gd-chip--leaf"), { autoAlpha: 0, scale: 0.7, x: -10 },
    { autoAlpha: 1, scale: 1, x: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.14 }, "<0.05");
  advance(1);

  /* Step 2: search ripples outward through the rings, then labs surface around it. */
  enter(2);
  tl.fromTo(q(2, ".gd-search"), { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" }, "-=0.25");
  tl.fromTo(q(2, ".gd-ring"), { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.7, stagger: { each: 0.14, from: "end" } }, "<0.15");
  tl.fromTo(q(2, ".gd-lab"), { autoAlpha: 0, scale: 0.8, y: 6 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(2)", stagger: 0.09 }, "-=0.35");
  tl.to(q(2, ".gd-search"), { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" }, "+=0.1");
  advance(2);

  /* Step 3: the email template comes up and a highlight passes over it. */
  enter(3);
  tl.fromTo(q(3, ".gd-email__shine"), { xPercent: -100 }, { xPercent: 100, duration: 1.2, ease: "power2.inOut" }, "+=0.15");
  advance(3);

  /* Step 4: the email flies along its dashed path from the inbox to the professor. */
  enter(4);
  tl.fromTo(q(4, ".gd-end"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.2)", stagger: 0.12 }, "-=0.25");
  const trail = q(4, ".gd-trail")[0];
  const plane = q(4, ".gd-plane")[0];
  const flight = q(4, ".gd-flight")[0];
  const length = trail.getTotalLength();
  gsap.set(trail, { strokeDasharray: length });
  tl.fromTo(trail, { strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.6, ease: "power1.inOut" }, "+=0.1");
  if (motionPath) {
    tl.fromTo(plane, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, "<");
    tl.to(plane, { motionPath: { path: flight, align: flight, alignOrigin: [0.5, 0.5], autoRotate: 45 }, duration: 1.6, ease: "power1.inOut" }, "<");
    tl.to(plane, { autoAlpha: 0, scale: 0.5, duration: 0.25, ease: "power2.in" }, "-=0.15");
  } else {
    tl.set(plane, { autoAlpha: 0 }, "<");
  }
  tl.to(q(4, ".gd-end--to"), { scale: 1.18, duration: 0.22, yoyo: true, repeat: 1, ease: "power1.inOut" }, "-=0.05");
  advance(4);
  // "Exit" closes the guide; it reopens at step 1 when the loop starts again.
  tl.to(modal, { autoAlpha: 0, scale: 0.96, duration: 0.45, ease: "power2.in" }, "-=0.2").to({}, { duration: 0.6 });

  /* Next / back jump straight to a step's entrance and keep playing from there. */
  const jump = (n) => {
    setStep(n);
    gsap.set(modal, { autoAlpha: 1, scale: 1 });
    gsap.set(cursor, { autoAlpha: 0 });
    // Stepping through by hand starts the walkthrough again if it was paused.
    if (userPaused()) guideToggle.click();
    tl.play(`in${n}`);
  };
  next.addEventListener("click", () => jump(current % STEPS + 1));
  back.addEventListener("click", () => jump(Math.max(1, current - 1)));

  // Played faster than it was authored, so the whole loop takes about 16 seconds.
  tl.timeScale(1.7);

  // Play only while on screen (unless paused); the modal's size follows the page, so re-measure after a resize.
  let started = false, onScreen = false;
  const guideToggle = addToggle(guide, "walkthrough", { play: () => onScreen && tl.play(), pause: () => tl.pause() });
  const userPaused = () => guideToggle.dataset.paused === "true";
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen && !userPaused()) { started = true; tl.play(); }
    else if (started) tl.pause();
  }, { threshold: 0.35 }).observe(guide);

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const time = tl.time(), playing = !tl.paused();
      tl.invalidate().time(time);
      if (!playing) tl.pause();
    }, 200);
  });
})();

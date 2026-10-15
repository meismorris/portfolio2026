(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { gsap } = window;

  // ---- Photocards: the photo flies out of the grid and becomes the first frame of a photobooth
  // strip; the strip then unrolls to reveal related photos from the same day (data-strip). ----
  const dialog = document.querySelector(".photocard");
  const card = dialog?.querySelector(".photocard__card");
  const framesEl = dialog?.querySelector(".photocard__frames");
  const backdrop = dialog?.querySelector(".photocard__backdrop");
  const cardEyebrow = dialog?.querySelector(".photocard__eyebrow");
  const cardTitle = dialog?.querySelector(".photocard__title");
  const cardNote = dialog?.querySelector(".photocard__note");
  const closeButton = dialog?.querySelector(".photocard__close");
  const textBits = dialog ? [cardEyebrow, cardTitle, cardNote] : [];
  const SINGLE_TILT = -2;
  const STRIP_TILT = -1;
  const CARD_RADIUS = "22px";
  let openTile = null;
  let busy = false;
  let timeline = null;
  let strip = null; // { frames, extras, collapsedClip, vertical }

  const makeFrame = (src, alt) => {
    const frame = document.createElement("div");
    frame.className = "photocard__frame";
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    frame.append(img);
    return frame;
  };

  // Line the strip's first frame up over the tile: scale and rotate around that frame's centre.
  const tileOffset = (tile) => {
    gsap.set(card, { x: 0, y: 0, scale: 1, rotation: 0 });
    const cardBox = card.getBoundingClientRect();
    const first = strip.frames[0].getBoundingClientRect();
    const from = tile.getBoundingClientRect();
    const originX = first.left - cardBox.left + first.width / 2;
    const originY = first.top - cardBox.top + first.height / 2;
    gsap.set(card, { transformOrigin: `${originX}px ${originY}px` });
    return {
      x: from.left + from.width / 2 - (first.left + first.width / 2),
      y: from.top + from.height / 2 - (first.top + first.height / 2),
      scale: from.width / first.width,
    };
  };

  // A clip that shows only the first frame (plus its white border), so the rest of the strip can unroll.
  const collapsedClip = () => {
    const cardBox = card.getBoundingClientRect();
    const first = strip.frames[0].getBoundingClientRect();
    return strip.vertical
      ? `inset(0px 0px ${Math.round(cardBox.bottom - first.bottom - 12)}px 0px round ${CARD_RADIUS})`
      : `inset(0px ${Math.round(cardBox.right - first.right - 12)}px 0px 0px round ${CARD_RADIUS})`;
  };
  const openClip = `inset(0px 0px 0px 0px round ${CARD_RADIUS})`;

  const open = (tile) => {
    if (openTile || busy || !dialog) return;
    openTile = tile;
    const img = tile.querySelector("img");
    const related = (tile.dataset.strip || "").split(";").map((entry) => entry.trim()).filter(Boolean)
      .map((entry) => { const [src, alt = ""] = entry.split("|"); return { src: src.trim(), alt: alt.trim() }; });
    const frames = [makeFrame(img.currentSrc || img.src, img.alt), ...related.map(({ src, alt }) => makeFrame(src, alt))];
    framesEl.replaceChildren(...frames);
    card.style.setProperty("--n", frames.length);
    cardEyebrow.textContent = tile.dataset.label || "morris’s photocard";
    cardTitle.textContent = tile.dataset.title;
    cardNote.textContent = tile.dataset.note;
    dialog.hidden = false;
    dialog.scrollTop = 0;
    document.documentElement.style.overflow = "hidden";
    closeButton.focus({ preventScroll: true });
    strip = { frames, extras: frames.slice(1), vertical: getComputedStyle(framesEl).flexDirection === "column" };
    const isStrip = strip.extras.length > 0;
    const restingTilt = isStrip ? STRIP_TILT : SINGLE_TILT;

    if (reduceMotion || !gsap) {
      if (gsap) gsap.set(card, { rotation: restingTilt });
      return;
    }

    busy = true;
    gsap.set(card, { clearProps: "clipPath" });
    const start = tileOffset(tile);
    if (isStrip) strip.collapsedClip = collapsedClip();
    gsap.set(tile, { autoAlpha: 0 });
    timeline?.kill();
    timeline = gsap.timeline({ onComplete: () => { busy = false; } })
      .fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0)
      // Travel and grow with a long, soft settle...
      .fromTo(card, { x: start.x, y: start.y, scale: start.scale }, { x: 0, y: 0, scale: 1, duration: 0.85, ease: "expo.out" }, 0)
      // ...while the tilt swings in with a gentle overshoot, like a card being tossed onto a table.
      .fromTo(card, { rotation: 3 }, { rotation: restingTilt, duration: 1.1, ease: "elastic.out(1, 0.75)" }, 0);

    let textAt = 0.3;
    if (isStrip) {
      const along = strip.vertical ? "y" : "x";
      timeline
        // Start with only the first frame showing, then unroll the rest of the strip...
        .set(card, { clipPath: strip.collapsedClip }, 0)
        .to(card, { clipPath: openClip, duration: 0.8, ease: "power3.inOut" }, 0.5)
        // ...as the related photos slide out from under the first one.
        .fromTo(strip.extras, { [along]: -48, autoAlpha: 0, scale: 0.94 }, { [along]: 0, autoAlpha: 1, scale: 1, duration: 0.75, ease: "power3.out", stagger: 0.12 }, 0.6)
        .set(card, { clearProps: "clipPath" }); // unclipped once open, so the close button can sit on the corner
      textAt = 1.05;
    }
    timeline
      .fromTo(textBits, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.06 }, textAt)
      .fromTo(closeButton, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, textAt + 0.1);
  };

  const close = () => {
    if (!openTile || (busy && !timeline?.isActive())) return;
    const tile = openTile;
    const finish = () => {
      dialog.hidden = true;
      document.documentElement.style.overflow = "";
      if (gsap) gsap.set(tile, { autoAlpha: 1 });
      if (gsap) gsap.set(card, { clearProps: "clipPath" });
      openTile = null;
      busy = false;
      tile.focus({ preventScroll: true });
    };
    if (reduceMotion || !gsap) { finish(); return; }

    busy = true;
    timeline?.kill();
    const isStrip = strip.extras.length > 0;
    const current = { x: gsap.getProperty(card, "x"), y: gsap.getProperty(card, "y"), scale: gsap.getProperty(card, "scale"), rotation: gsap.getProperty(card, "rotation") };
    const target = tileOffset(tile);
    gsap.set(card, current);
    timeline = gsap.timeline({ onComplete: finish })
      .to([...textBits, closeButton], { autoAlpha: 0, duration: 0.18, ease: "power1.in" }, 0);

    let flyAt = 0;
    if (isStrip) {
      const along = strip.vertical ? "y" : "x";
      timeline
        // Roll the strip back up behind the first frame...
        .to([...strip.extras].reverse(), { [along]: -40, autoAlpha: 0, duration: 0.32, ease: "power2.in", stagger: 0.05 }, 0.02)
        .fromTo(card, { clipPath: openClip }, { clipPath: strip.collapsedClip, duration: 0.42, ease: "power3.inOut" }, 0.06);
      flyAt = 0.4;
    }
    timeline
      // ...then send the photo home to its tile.
      .to(card, { x: target.x, y: target.y, scale: target.scale, rotation: 0, duration: 0.55, ease: "power3.inOut" }, flyAt)
      .to(backdrop, { autoAlpha: 0, duration: 0.45, ease: "power2.inOut" }, flyAt + 0.05)
      // Hand back to the real tile on the last frame so there's no flicker.
      .set(tile, { autoAlpha: 1 }, flyAt + 0.54);
  };

  document.querySelectorAll(".about-photo").forEach((tile) => {
    tile.addEventListener("click", () => open(tile));
  });
  closeButton?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  card?.addEventListener("click", (event) => { if (event.target !== closeButton) close(); });
  document.addEventListener("keydown", (event) => {
    if (!openTile) return;
    if (event.key === "Escape") close();
    if (event.key === "Tab") { event.preventDefault(); closeButton.focus(); } // the close button is the only stop
  });

  // ---- Photo tiles and the game card: a soft lift on hover (the art itself is never scaled) ----
  if (gsap && !reduceMotion) {
    document.querySelectorAll(".about-photo, .about-game").forEach((tile) => {
      const lift = (on) => gsap.to(tile, {
        y: on ? -4 : 0,
        boxShadow: on ? "0 16px 34px rgba(20, 60, 110, 0.16)" : "0 0px 0px rgba(20, 60, 110, 0)",
        duration: on ? 0.5 : 0.6,
        ease: "power3.out",
        overwrite: "auto",
      });
      tile.addEventListener("mouseenter", () => lift(true));
      tile.addEventListener("mouseleave", () => lift(false));
      tile.addEventListener("focus", () => lift(true));
      tile.addEventListener("blur", () => lift(false));
    });
  }

  // ---- "Now listening to": the record spins like a turntable while the card is hovered ----
  // One endless rotation whose playback speed (timeScale) eases up on hover and coasts down on leave.
  const music = document.querySelector(".about-music");
  const record = music?.querySelector(".about-music__record");
  if (gsap && music && record && !reduceMotion) {
    const spin = gsap.to(record, { rotation: "+=360", duration: 3, ease: "none", repeat: -1, paused: true });
    spin.timeScale(0);
    let speed = null;

    music.addEventListener("mouseenter", () => {
      speed?.kill();
      spin.play();
      speed = gsap.to(spin, { timeScale: 1, duration: 1.2, ease: "power2.out" });
    });
    music.addEventListener("mouseleave", () => {
      speed?.kill();
      speed = gsap.to(spin, { timeScale: 0, duration: 2, ease: "power2.out", onComplete: () => spin.pause() });
    });
  }
})();

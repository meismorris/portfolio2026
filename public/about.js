(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { gsap } = window;

  // ---- Photocards: a photo flies out of the grid into a polaroid-style card with its story ----
  const dialog = document.querySelector(".photocard");
  const card = dialog?.querySelector(".photocard__card");
  const backdrop = dialog?.querySelector(".photocard__backdrop");
  const cardPhoto = dialog?.querySelector(".photocard__photo img");
  const cardEyebrow = dialog?.querySelector(".photocard__eyebrow");
  const cardTitle = dialog?.querySelector(".photocard__title");
  const cardNote = dialog?.querySelector(".photocard__note");
  const closeButton = dialog?.querySelector(".photocard__close");
  const textBits = dialog ? [cardEyebrow, cardTitle, cardNote] : [];
  const RESTING_TILT = -2;
  let openTile = null;
  let busy = false;
  let timeline = null;

  // The card's offset and scale that line it up exactly over the tile it came from.
  const tileOffset = (tile) => {
    gsap.set(card, { x: 0, y: 0, scale: 1, rotation: 0 });
    const from = tile.getBoundingClientRect();
    const to = card.getBoundingClientRect();
    return {
      x: from.left + from.width / 2 - (to.left + to.width / 2),
      y: from.top + from.height / 2 - (to.top + to.height / 2),
      scale: from.width / to.width,
    };
  };

  const open = (tile) => {
    if (openTile || busy || !dialog) return;
    openTile = tile;
    const img = tile.querySelector("img");
    cardPhoto.src = img.currentSrc || img.src;
    cardPhoto.alt = img.alt;
    cardEyebrow.textContent = tile.dataset.label || "morris’s photocard";
    cardTitle.textContent = tile.dataset.title;
    cardNote.textContent = tile.dataset.note;
    dialog.hidden = false;
    document.documentElement.style.overflow = "hidden";
    closeButton.focus({ preventScroll: true });

    if (reduceMotion || !gsap) {
      if (gsap) gsap.set(card, { rotation: RESTING_TILT });
      return;
    }

    busy = true;
    const start = tileOffset(tile);
    gsap.set(tile, { autoAlpha: 0 });
    timeline?.kill();
    timeline = gsap.timeline({ onComplete: () => { busy = false; } })
      .fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0)
      // Travel and grow with a long, soft settle...
      .fromTo(card, { x: start.x, y: start.y, scale: start.scale }, { x: 0, y: 0, scale: 1, duration: 0.85, ease: "expo.out" }, 0)
      // ...while the tilt swings in with a gentle overshoot, like a card being tossed onto a table.
      .fromTo(card, { rotation: 3 }, { rotation: RESTING_TILT, duration: 1.1, ease: "elastic.out(1, 0.75)" }, 0)
      .fromTo(card, { boxShadow: "0 0px 0px rgba(20, 60, 110, 0)" }, { boxShadow: "0 30px 80px rgba(20, 60, 110, 0.2)", duration: 0.7, ease: "power2.out" }, 0.1)
      .fromTo(textBits, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.06 }, 0.3)
      .fromTo(closeButton, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, 0.4);
  };

  const close = () => {
    if (!openTile || (busy && !timeline?.isActive())) return;
    const tile = openTile;
    const finish = () => {
      dialog.hidden = true;
      document.documentElement.style.overflow = "";
      if (gsap) gsap.set(tile, { autoAlpha: 1 });
      openTile = null;
      busy = false;
      tile.focus({ preventScroll: true });
    };
    if (reduceMotion || !gsap) { finish(); return; }

    busy = true;
    timeline?.kill();
    const current = { x: gsap.getProperty(card, "x"), y: gsap.getProperty(card, "y"), scale: gsap.getProperty(card, "scale"), rotation: gsap.getProperty(card, "rotation") };
    const target = tileOffset(tile);
    gsap.set(card, current);
    timeline = gsap.timeline({ onComplete: finish })
      .to([...textBits, closeButton], { autoAlpha: 0, duration: 0.18, ease: "power1.in" }, 0)
      .to(card, { x: target.x, y: target.y, scale: target.scale, rotation: 0, duration: 0.55, ease: "power3.inOut" }, 0)
      .to(card, { boxShadow: "0 0px 0px rgba(20, 60, 110, 0)", duration: 0.45, ease: "power2.in" }, 0)
      .to(backdrop, { autoAlpha: 0, duration: 0.45, ease: "power2.inOut" }, 0.05)
      // Hand back to the real tile on the last frame so there's no flicker.
      .set(tile, { autoAlpha: 1 }, 0.54);
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

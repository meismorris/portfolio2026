// FindMyLab search banner (ported from search-banner-reference.html; GSAP 3.12.5 from the CDN).
(() => {
  const $ = (id) => document.getElementById("sbn-" + id);
  const banner = $("banner"), gallery = $("gallery"), row = $("row"), typed = $("typed"), caret = $("caret"),
        placeholder = $("placeholder"), pill = $("pill"), ripple = $("ripple");
  const QUERY = "neuroscience and linguistics";

  /* ---------- Result cards (content from the FindMyLab designs) ---------- */
  const ICONS = {
    book: '<svg viewBox="0 0 24 24" fill="none"><path d="M13 10C13.55 10 14 10.45 14 11C14 11.55 13.55 12 13 12H8C7.45 12 7 11.55 7 11C7 10.45 7.45 10 8 10H13ZM16 6C16.55 6 17 6.45 17 7C17 7.55 16.55 8 16 8H8C7.45 8 7 7.55 7 7C7 6.45 7.45 6 8 6H16Z" fill="#1F2937"/><path fill-rule="evenodd" clip-rule="evenodd" d="M17.6 1C18.01 1 18.36 1.01 18.67 1.02C18.98 1.03 19.3 1.12 19.63 1.27C20.12 1.52 20.48 1.88 20.73 2.37C20.88 2.7 20.96 3.02 20.98 3.33C21 3.64 21.01 4 21 4.4V17C21 17.55 20.55 18 20 18C19.64 18 19 18.45 19 19.5C19 20.55 19.64 21 20 21C20.55 21 21 21.45 21 22C21 22.55 20.55 23 20 23H6.5C5.53 23 4.6 22.58 3.91 21.85C3.26 21.12 2.93 20.15 3.02 19.17L3 19V7.6C2.99 6.64 3.01 5.85 3.05 5.22C3.09 4.61 3.24 4.02 3.49 3.46C3.92 2.61 4.61 1.92 5.46 1.49C6.01 1.24 6.61 1.09 7.22 1.05C7.85 1.02 8.64 1 9.6 1H17.6ZM6.5 18C5.67 18 5 18.67 5 19.5C5 20.33 5.67 21 6.5 21H17.3C16.91 20.04 16.91 18.96 17.3 18H6.5ZM9.6 3C8.6 3 7.92 3 7.38 3.04C6.86 3.09 6.58 3.17 6.37 3.27C5.9 3.51 5.51 3.9 5.27 4.37C5.17 4.57 5.09 4.87 5.04 5.38C5 5.92 5 6.6 5 7.6V16.34C5.45 16.11 5.95 16 6.5 16H19V4.4C19 4.04 18.99 3.67 18.96 3.31C18.9 3.18 18.83 3.1 18.73 3.05C18.65 3.04 18.59 3.03 18.5 3.02C18.3 3 18.04 3 17.6 3H9.6Z" fill="#1F2937"/></svg>',
    tube: '<svg viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.5583 1.99371C13.7959 1.65441 14.2636 1.57195 14.6029 1.80953L21.1561 6.39814C21.369 6.54723 21.4895 6.79594 21.4747 7.05545C21.4598 7.31496 21.3116 7.54825 21.083 7.67202L19.2724 8.65245L12.0739 18.933C11.5304 19.7091 10.7201 20.6462 9.6421 21.1331C8.49558 21.6509 7.14555 21.6137 5.71157 20.6097C4.27759 19.6056 3.78098 18.3497 3.8754 17.0952C3.96418 15.9157 4.56765 14.8337 5.11109 14.0576L13.5583 1.99371ZM14.3569 3.46844L9.5327 10.358C12 10.85 12.9 9.5 16.2932 10.292L18.1452 7.64705C18.212 7.55167 18.3001 7.47315 18.4025 7.41771L19.3016 6.93082L14.3569 3.46844Z" fill="#079726"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none"><path d="M10.0504 10.6066L2.97934 17.6777C2.19829 18.4587 2.19829 19.725 2.97934 20.5061C3.76038 21.2871 5.02671 21.2871 5.80776 20.5061L12.8788 13.435" stroke="#0075FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.0501 10.6066C9.20625 8.45363 9.37121 5.62865 11.1108 3.88914C12.8503 2.14962 16.0605 1.76782 17.8283 2.82848L14.7876 5.86915L14.505 8.98019L17.616 8.69758L20.6567 5.6569C21.7174 7.42467 21.3356 10.6349 19.596 12.3744C17.8565 14.1139 15.0315 14.2789 12.8785 13.435" stroke="#0075FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  const MARK = (filled) => `<svg class="mark" viewBox="0 0 24 24" fill="none"><path d="M17 2.87C18.1 2.87 19 3.77 19 4.87V19.87C19 20.64 18.17 21.12 17.5 20.74L12.99 18.16C12.38 17.81 11.62 17.81 11.01 18.16L6.5 20.74C5.83 21.12 5 20.64 5 19.87V4.87C5 3.77 5.9 2.87 7 2.87H17Z" fill="${filled ? "#0C3E6F" : "none"}" stroke="#0C3E6F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const MAIL = '<svg viewBox="0 0 16 16" fill="none"><path d="M14.67 4.67L8.67 8.48C8.47 8.6 8.24 8.67 8 8.67C7.77 8.67 7.54 8.6 7.33 8.48L1.33 4.67" stroke="white" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.33 2.67H2.67C1.93 2.67 1.33 3.26 1.33 4V12C1.33 12.74 1.93 13.33 2.67 13.33H13.33C14.07 13.33 14.67 12.74 14.67 12V4C14.67 3.26 14.07 2.67 13.33 2.67Z" stroke="white" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const LINK = '<svg viewBox="0 0 16 16" fill="none"><path d="M14 8.67V12.67C14 13.4 13.4 14 12.67 14H3.33C2.6 14 2 13.4 2 12.67V3.33C2 2.6 2.6 2 3.33 2H7.33" stroke="#1F2937" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2L8 8" stroke="#1F2937" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 2H14V6" stroke="#1F2937" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const LABS = [
    { icon: "book", tint: "#efe6f7", cat: "Cognitive Science", saved: true, title: "Language Learning Lab", prof: "Professor Katharine Graf Estes",
      tags: ["Attention", "Language", "ML"], desc: "Language Learning researches attention and perception, including how expectations and experience shape what we notice and remember." },
    { icon: "tube", tint: "#e4f6e6", cat: "Animal Science", saved: false, title: "Research in Animal Science", prof: "Professor Richard Blatchford",
      tags: ["Animal Welfare", "Agriculture"], desc: "Professor Richard Blatchford researches animal welfare and management in agriculture, including how housing and care affect poultry health and behavior." },
    { icon: "wrench", tint: "#e3f0fd", cat: "Mechanical and Aerospace Engineering", saved: false, title: "Applied Micro/Nano Electromagnetics Research Lab", prof: "Professor Ahmet Palazoglu",
      tags: ["Energy", "Data Science"], desc: "Palazoglu Research Lab researches ways to model, monitor, and control complex systems, including energy grids that rely on wind and solar power." }
  ];
  const cardHTML = (l) => `<div class="card"><div class="top"><div class="badge" style="background:${l.tint}">${ICONS[l.icon]}</div><div class="cat">${l.cat}</div>${MARK(l.saved)}</div>
    <h4>${l.title}</h4><div class="prof">${l.prof}</div><div class="tags">${l.tags.map(t => `<span>${t}</span>`).join("")}</div>
    <p class="desc">${l.desc}</p><div class="btns"><div class="btn dark">${MAIL}Contact</div><div class="btn light">${LINK}Website</div></div></div>`;

  // One endless strip: a set of six cards, written twice so the scroll can wrap with no seam.
  // The Language Learning card (best match) starts centred.
  const SET = [1, 2, 0, 1, 2, 0];
  const CARD_W = 390 * 0.6, CARD_H = 411 * 0.6, GAP = 20, STEP = CARD_W + GAP;
  const strip = document.createElement("div");
  strip.className = "grow";
  strip.style.top = `calc(118 * var(--u))`;
  strip.style.left = `calc(${502 - (2 * STEP + CARD_W / 2)} * var(--u))`;
  strip.style.paddingRight = `calc(${GAP} * var(--u))`;   // makes the strip exactly two sets wide, so -50% lands on the seam
  strip.innerHTML = [...SET, ...SET].map(i => cardHTML(LABS[i])).join("");
  gallery.appendChild(strip);
  const cards = [...strip.querySelectorAll(".card")];

  /* ---------- Rest state for people who turn off motion: the typed search, no gallery ---------- */
  if (!window.gsap || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typed.textContent = QUERY; placeholder.style.opacity = 0; caret.style.opacity = 0;
    gallery.style.display = "none";
    return;
  }

  // Every tween below lives in one gsap.context scoped to this banner, so the off-screen pause
  // (bottom of the file) touches only this banner's animations, not the rest of the page.
  const ctx = gsap.context(() => {}, banner);

  let intro, marquee, glide;
  // This banner's top-level animations, so the off-screen pause can hold exactly these
  // (ctx.getTweens() lists tweens only, never timelines like the intro).
  const own = new Set();
  const track = (animation) => { own.add(animation); return animation; };
  const u = () => banner.clientWidth / 1004;          // px per Figma px
  const PILL_SHIFT = () => (37 + pill.offsetWidth / u()) / 2; // keeps text centred before the pill appears
  const DOODLES = ["#sbn-mag", "#sbn-cap", "#sbn-books"];

  ctx.add(() => {
  /* ---------- Endless scroll: one linear tween on one element, wraps at half its width ---------- */
  marquee = track(gsap.fromTo(strip, { xPercent: 0 }, { xPercent: -50, duration: 6 * STEP / 32, ease: "none", repeat: -1, paused: true }));
  glide = (to, d) => ctx.add(() => track(gsap.to(marquee, { timeScale: to, duration: d, ease: "sine.inOut", overwrite: true })));

  /* ---------- Intro: type → search → results rise (~4s, plays once) ---------- */
  intro = track(gsap.timeline({ paused: true, defaults: { ease: "power3.out" } }));

  intro.call(() => { typed.textContent = ""; marquee.pause().progress(0).timeScale(0); })
    .set(row, { x: () => PILL_SHIFT() * u(), autoAlpha: 1, scale: 1, y: 0 })
    .set(pill, { autoAlpha: 0, scale: 0.6 })
    .set(placeholder, { autoAlpha: 1, y: 0 })
    .set(caret, { autoAlpha: 1 })
    .set(cards, { autoAlpha: 0, y: () => 300 * u() });

  // Caret blinks on the placeholder, then the query types in as the waves slide out
  intro.to(caret, { autoAlpha: 0, duration: 0.01, repeat: 3, yoyo: true, repeatDelay: 0.2 }, 0.05)
    .to(placeholder, { autoAlpha: 0, y: () => -14 * u(), duration: 0.3, ease: "power2.in" }, 0.6)
    .to("#sbn-waveL", { x: -240, y: -120, duration: 0.9, ease: "power3.inOut" }, 0.6)
    .to("#sbn-waveR", { x: 240, y: 160, duration: 0.9, ease: "power3.inOut" }, 0.65);
  const typeStart = 0.8, perChar = 0.034;
  [...QUERY].forEach((ch, i) => {
    intro.call(() => { typed.textContent = QUERY.slice(0, i + 1); }, null, typeStart + i * perChar + (i > 12 ? 0.06 : 0));
  });
  const typedEnd = typeStart + QUERY.length * perChar + 0.1;

  // Search pill springs in; the text slides left to make room
  intro.to(row, { x: 0, duration: 0.55, ease: "power3.inOut" }, typedEnd + 0.05)
    .to(pill, { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(2)" }, typedEnd + 0.12)
    .set(caret, { autoAlpha: 0 }, typedEnd + 0.4);

  // Press
  const press = typedEnd + 0.8;
  intro.to(pill, { scale: 0.9, duration: 0.1, ease: "power2.in" }, press)
    .to(pill, { scale: 1.06, duration: 0.18, ease: "power2.out" }, press + 0.1)
    .to(pill, { scale: 1, duration: 0.3 }, press + 0.28)
    .fromTo(ripple, { boxShadow: "0 0 0 0px rgba(255,255,255,0.9)" }, { boxShadow: () => `0 0 0 ${40 * u()}px rgba(255,255,255,0)`, duration: 0.55, ease: "power2.out" }, press + 0.1);

  // Search bar settles at the top like a results header; cards rise from below, left to right,
  // and the strip eases into its endless scroll as they land
  const spill = press + 0.3;
  intro.to(row, { y: () => -134 * u(), scale: 0.72, duration: 0.7, ease: "power3.inOut" }, spill)
    .to(DOODLES, { autoAlpha: 0, duration: 0.3 }, spill);
  cards.forEach((card, i) => {
    intro.to(card, { autoAlpha: 1, y: 0, duration: 1, ease: "power4.out" }, spill + 0.3 + Math.min(i, 5) * 0.09);
  });
  intro.call(() => { marquee.play(); glide(1, 1.6); }, null, spill + 0.6);

  });

  /* ---------- Hover (or tap) replays the search ---------- */
  let replaying = false;
  // ctx.add(null, fn) returns a context-safe function to call later (ctx.add(fn) would run it now)
  const replay = ctx.add(null, () => {
    if (replaying || intro.isActive()) return;
    replaying = true;
    glide(0, 0.4);
    track(gsap.timeline({ onComplete: () => { replaying = false; intro.restart(); } }))
      .to(cards, { y: () => 300 * u(), duration: 0.45, ease: "power3.in", stagger: 0.03 }, 0)
      .to(row, { autoAlpha: 0, duration: 0.25 }, 0.05)
      .to(["#sbn-waveL", "#sbn-waveR"], { x: 0, y: 0, duration: 0.6, ease: "power3.out" }, 0.2)
      .to(DOODLES, { autoAlpha: 1, duration: 0.4 }, 0.3)
      .set(row, { x: () => PILL_SHIFT() * u(), y: 0, scale: 1 }, 0.4)
      .set(pill, { autoAlpha: 0, scale: 0.6 }, 0.4)
      .call(() => { typed.textContent = ""; }, null, 0.4)
      .set(row, { autoAlpha: 1 }, 0.4)
      .fromTo(placeholder, { autoAlpha: 0, y: () => 10 * u() }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.45);
  });

  // Hover intent (same as the landing page banners): when scrolling slides the banner under a
  // cursor that isn't moving, wait for a real mouse move before replaying.
  let lastScroll = -Infinity, lastPos = null, waiting = false;
  addEventListener("scroll", () => { lastScroll = performance.now(); }, { passive: true });
  addEventListener("pointermove", (e) => {
    const moved = !lastPos || Math.hypot(e.clientX - lastPos.x, e.clientY - lastPos.y) > 3;
    lastPos = { x: e.clientX, y: e.clientY };
    if (waiting && moved && banner.matches(":hover")) { waiting = false; replay(); }
  }, { passive: true });
  banner.addEventListener("mouseenter", () => {
    if (performance.now() - lastScroll < 250) { waiting = true; return; }
    replay();
  });
  banner.addEventListener("mouseleave", () => { waiting = false; });
  banner.addEventListener("click", replay);

  // Recompute pixel-based values if the banner resizes
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { intro.invalidate(); }, 150); });

  // Start when the banner first comes into view; pause everything while it's off screen
  let started = false;
  let held = [];
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      // restart() rather than play(): the banner can sit off screen for a while before this runs,
      // and the intro must always begin from its first frame (the caret blink), not partway in.
      if (!started) { started = true; intro.restart(); }
      held.forEach((t) => t.resume());
      held = [];
    } else if (started) {
      own.forEach((a) => { if (a !== intro && a !== marquee && a.progress() === 1) own.delete(a); }); // drop finished replays/glides
      held = [...own].filter((a) => !a.paused());
      held.forEach((t) => t.pause());
    }
  }).observe(banner);
})();

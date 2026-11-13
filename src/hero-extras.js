// Hero extras ("Light A" from the Nov 2026 design handoff): 3 boiling stars + 4 still dots around the
// headline. Styles live in public/hero-animation.css ("Hero scribbles"); the strokes use the g-sky / g-lime /
// g-warm / g-ribbon gradients defined in the hidden <svg> at the top of <body> in public/index.html.
//
// The pieces mount in .framer-8ohpt5 (the hero's parent), not in the hero itself, which clips its overflow.
// A zero-size anchor is pinned to the headline centre; each piece sits at --dx/--dy from it (px at 1440 wide).

const PIECES = `<span class="hero-extra hero-extra--star" aria-hidden="true" style="--dx:-45px;--dy:-281px;--size:30px;--rot:2deg"><svg class="draw" aria-hidden="true" width="28" height="28" viewBox="0 0 60 60" style="overflow: visible"><path pathLength="1" d="M 30.5 6 C 31.4 19 30.6 33 29 54" fill="none" stroke="url(#g-sky)" stroke-width="10.7" stroke-linecap="round" style="animation-delay: 0.15s"></path><path pathLength="1" d="M 8 23 C 21 26.5 37 33 52.5 40" fill="none" stroke="url(#g-sky)" stroke-width="10.7" stroke-linecap="round" style="animation-delay: 0.27s"></path><path pathLength="1" d="M 50 15 C 40.5 27 24 39.5 9.5 46.5" fill="none" stroke="url(#g-sky)" stroke-width="10.7" stroke-linecap="round" style="animation-delay: 0.39s"></path></svg></span>
<span class="hero-extra hero-extra--dot" aria-hidden="true" style="--dx:-446px;--dy:-281px;--size:24px;--rot:-11deg"><svg class="draw" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" style="overflow: visible"><path pathLength="1" d="M 13 4 C 7 4 4 8 4 13 C 4 18 9 20.5 13 20 C 18 19.5 21 16 20 11 C 19 6 15.5 4 10 5.5" fill="none" stroke="url(#g-lime)" stroke-width="4.98" stroke-linecap="round" style="animation-delay: 0.24s"></path></svg></span>
<span class="hero-extra hero-extra--dot" aria-hidden="true" style="--dx:-580px;--dy:-81px;--size:24px;--rot:13deg"><svg class="draw" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" style="overflow: visible"><path pathLength="1" d="M 11 4.5 C 6 5 3.5 9 4 13.5 C 4.5 18 9 20.5 13.5 19.5 C 18 18.5 20.5 14.5 19.5 10 C 18.5 5.5 14 3.5 9 5.5" fill="none" stroke="url(#g-warm)" stroke-width="5.08" stroke-linecap="round" style="animation-delay: 0.33s"></path></svg></span>
<span class="hero-extra hero-extra--star" aria-hidden="true" style="--dx:593px;--dy:138px;--size:34px;--rot:19deg"><svg class="draw" aria-hidden="true" width="34" height="34" viewBox="0 0 60 60" style="overflow: visible"><path pathLength="1" d="M 30.5 6 C 31.4 19 30.6 33 29 54" fill="none" stroke="url(#g-ribbon)" stroke-width="8.92" stroke-linecap="round" style="animation-delay: 0.42s"></path><path pathLength="1" d="M 8 23 C 21 26.5 37 33 52.5 40" fill="none" stroke="url(#g-ribbon)" stroke-width="8.92" stroke-linecap="round" style="animation-delay: 0.54s"></path><path pathLength="1" d="M 50 15 C 40.5 27 24 39.5 9.5 46.5" fill="none" stroke="url(#g-ribbon)" stroke-width="8.92" stroke-linecap="round" style="animation-delay: 0.66s"></path></svg></span>
<span class="hero-extra hero-extra--dot" aria-hidden="true" style="--dx:-426px;--dy:228px;--size:21px;--rot:-4deg"><svg class="draw" aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" style="overflow: visible"><path pathLength="1" d="M 13 4 C 7 4 4 8 4 13 C 4 18 9 20.5 13 20 C 18 19.5 21 16 20 11 C 19 6 15.5 4 10 5.5" fill="none" stroke="url(#g-sky)" stroke-width="5.77" stroke-linecap="round" style="animation-delay: 0.51s"></path></svg></span>
<span class="hero-extra hero-extra--dot" aria-hidden="true" style="--dx:412px;--dy:246px;--size:23px;--rot:22deg"><svg class="draw" aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" style="overflow: visible"><path pathLength="1" d="M 11 4.5 C 6 5 3.5 9 4 13.5 C 4.5 18 9 20.5 13.5 19.5 C 18 18.5 20.5 14.5 19.5 10 C 18.5 5.5 14 3.5 9 5.5" fill="none" stroke="url(#g-lime)" stroke-width="5.16" stroke-linecap="round" style="animation-delay: 0.6s"></path></svg></span>
<span class="hero-extra hero-extra--star" aria-hidden="true" style="--dx:351px;--dy:-299px;--size:30px;--rot:-14deg"><svg class="draw" aria-hidden="true" width="28" height="28" viewBox="0 0 60 60" style="overflow: visible"><path pathLength="1" d="M 30.5 6 C 31.4 19 30.6 33 29 54" fill="none" stroke="url(#g-warm)" stroke-width="10.7" stroke-linecap="round" style="animation-delay: 0.7s"></path><path pathLength="1" d="M 8 23 C 21 26.5 37 33 52.5 40" fill="none" stroke="url(#g-warm)" stroke-width="10.7" stroke-linecap="round" style="animation-delay: 0.82s"></path><path pathLength="1" d="M 50 15 C 40.5 27 24 39.5 9.5 46.5" fill="none" stroke="url(#g-warm)" stroke-width="10.7" stroke-linecap="round" style="animation-delay: 0.94s"></path></svg></span>`;

const host = document.querySelector(".framer-8ohpt5");
const headline = document.querySelector("h1.hero-title");

if (host && headline) {
  const anchor = document.createElement("div");
  anchor.className = "hero-extras";
  anchor.setAttribute("aria-hidden", "true");
  anchor.innerHTML = PIECES;
  host.prepend(anchor);

  // Pin the anchor to the centre of the headline, relative to the anchor's positioned parent.
  const place = () => {
    const parent = anchor.offsetParent || anchor.parentElement;
    const a = parent.getBoundingClientRect();
    const r = headline.getBoundingClientRect();
    anchor.style.setProperty("--ax", `${r.left + r.width / 2 - a.left}px`);
    anchor.style.setProperty("--ay", `${r.top + r.height / 2 - a.top}px`);
  };
  place();
  window.addEventListener("resize", place);
  document.fonts?.ready.then(place);
  if ("ResizeObserver" in window) new ResizeObserver(place).observe(headline);

  // Star boil: 3 jittered frames swapped every 200ms with no tween, the same rhythm as the rays
  // (Ximws3R4.js cycles its 3 variants every 200ms). Dots stay still. No boil with reduced motion.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const jitter = (d, amount) => d.replace(/-?\d*\.?\d+/g, (n) => (+n + (rnd() - 0.5) * 2 * amount).toFixed(2));
    const paths = [...anchor.querySelectorAll(".hero-extra--star svg path")].map((path) => {
      const d = path.getAttribute("d");
      return { path, frames: [d, jitter(d, 3.6), jitter(d, 3.6)] };
    });
    let frame = 0;
    setInterval(() => {
      frame = (frame + 1) % 3;
      for (const { path, frames } of paths) path.setAttribute("d", frames[frame]);
    }, 200);
  }
}

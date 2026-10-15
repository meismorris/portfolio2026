// Page transition: a blue wave rises to cover the page when you follow an internal link, and on the
// next page it carries on upward, its wavy bottom edge revealing the new page. One continuous motion.
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FLAG = "pt-entering";
  const COVER_MS = 620;
  const REVEAL_MS = 760;
  const EASE_COVER = "cubic-bezier(.7, 0, .3, 1)";
  const EASE_REVEAL = "cubic-bezier(.65, 0, .35, 1)";

  const clearFlag = () => { try { sessionStorage.removeItem(FLAG); } catch (_) { /* storage unavailable */ } };
  if (reduceMotion) { clearFlag(); root.classList.remove(FLAG); return; }

  // A gentle, slightly uneven wave, two identical 1440-wide periods long so it can drift sideways
  // seamlessly (the curve leaves x=0 and arrives at x=1440 at the same angle). The bottom cap is the
  // same shape flipped in CSS.
  const WAVE_PATH = "M0 52 C180 6 420 6 640 46 C860 86 1260 98 1440 52 C1620 6 1860 6 2080 46 C2300 86 2700 98 2880 52 V100 H0 Z";
  const waveSvg = (edge) => `<svg class="pt-wave pt-wave--${edge}" viewBox="0 0 2880 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${WAVE_PATH}"/></svg>`;

  const overlay = document.createElement("div");
  overlay.className = "pt-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `<div class="pt-panel">${waveSvg("top")}<div class="pt-body"></div>${waveSvg("bottom")}</div>`;
  const panel = overlay.firstElementChild;
  const waves = overlay.querySelectorAll(".pt-wave");
  const mount = () => { if (!overlay.isConnected) document.body.append(overlay); };

  // Panel positions in px (the panel is one wave cap + a screen-tall body + one wave cap).
  const waveHeight = () => waves[0].getBoundingClientRect().height;
  const BELOW = () => `translateY(${window.innerHeight}px)`; // top wave just below the screen
  const COVERING = () => `translateY(${-waveHeight()}px)`; // body exactly fills the screen
  const ABOVE = () => `translateY(${-panel.offsetHeight}px)`; // the whole panel, bottom wave included, above the screen

  const drift = (duration, easing) => waves.forEach((wave) => wave.animate(
    [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }],
    { duration, easing },
  ));

  // ---- Arriving: if the previous page left under the wave, start covered and lift it away ----
  const reveal = () => {
    clearFlag();
    mount();
    panel.style.transform = COVERING();
    root.classList.remove(FLAG); // the static cover in the CSS hands over to the real panel
    requestAnimationFrame(() => requestAnimationFrame(() => {
      drift(REVEAL_MS, EASE_REVEAL);
      const lift = panel.animate([{ transform: COVERING() }, { transform: ABOVE() }], { duration: REVEAL_MS, easing: EASE_REVEAL, fill: "forwards" });
      lift.onfinish = () => { overlay.remove(); lift.cancel(); };
    }));
  };
  if (root.classList.contains(FLAG)) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", reveal, { once: true });
    else reveal();
  }

  // ---- Leaving: cover the page, then navigate ----
  let leaving = false;
  const isInternalPage = (link, event) => {
    if (!link || event.defaultPrevented || event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target && link.target !== "_self") return false;
    if (link.hasAttribute("download")) return false;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return false;
    const samePage = url.pathname.replace(/\.html$|\/$/, "") === location.pathname.replace(/\.html$|\/$/, "");
    if (samePage && (url.hash || url.search === location.search)) return false; // in-page jumps and reloads
    return true;
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (leaving || !isInternalPage(link, event)) return;
    event.preventDefault();
    leaving = true;
    const destination = link.href;
    mount();
    try { sessionStorage.setItem(FLAG, "1"); } catch (_) { /* the next page just won't animate in */ }
    drift(COVER_MS, EASE_COVER);
    const cover = panel.animate([{ transform: BELOW() }, { transform: COVERING() }], { duration: COVER_MS, easing: EASE_COVER, fill: "forwards" });
    cover.onfinish = () => { location.href = destination; };
  });

  // Coming back with the browser's back/forward cache: never leave the page covered.
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    leaving = false;
    clearFlag();
    root.classList.remove(FLAG);
    panel.getAnimations().forEach((animation) => animation.cancel());
    overlay.remove();
  });
})();

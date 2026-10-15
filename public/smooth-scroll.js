// Smooth scrolling (Lenis): mouse-wheel and trackpad scrolling eases to a stop instead of moving in
// steps. Touch keeps the native scroll. Reduced-motion visitors keep the browser's normal scrolling.
(() => {
  if (!window.Lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const lenis = new window.Lenis({
    lerp: 0.1,          // how quickly the page catches up to the wheel: lower = floatier, higher = snappier
    wheelMultiplier: 1, // keep the same distance per wheel notch as normal scrolling
    anchors: true,      // in-page #links glide too
  });
  window.lenis = lenis; // other scripts pause it (photocards) or scroll with it (case-study menu)

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
})();

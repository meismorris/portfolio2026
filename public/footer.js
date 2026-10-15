// Footer arrow: draws itself on (like the hero flower) the first time it scrolls into view, then idles
// in a steady stop-motion nudge toward the pills it points at. Reduced motion: shown fully drawn and still.
(() => {
  const arrow = document.querySelector(".footer-arrow");
  const path = arrow?.querySelector("path");
  if (!arrow || !path) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

  arrow.classList.add("is-ready"); // hidden (dash offset 1) until it comes into view

  const draw = () => {
    arrow.classList.add("is-drawn");
    path.addEventListener("transitionend", () => arrow.classList.add("is-boiling"), { once: true });
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    // A beat after the footer arrives, so the draw reads as a response rather than a pop.
    setTimeout(() => requestAnimationFrame(draw), 250);
  }, { threshold: 0.5 });
  observer.observe(arrow.closest(".footer-card") || arrow);
})();

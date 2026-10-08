// Draws the background ribbon in step with scroll: hidden at the top, fully drawn at the bottom.
// Only stroke-dashoffset changes (through --line-offset); nothing touches layout or scrolling.
const ribbon = document.querySelector(".scroll-ribbon");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (ribbon && !reduceMotion.matches) {
  const EASE = 0.12;
  let target = 1;
  let current = 1;
  let frame = 0;

  const measure = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1;
    target = 1 - progress;
  };

  const tick = () => {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.0005) current = target;
    ribbon.style.setProperty("--line-offset", current.toFixed(4));
    frame = current === target ? 0 : requestAnimationFrame(tick);
  };

  const update = () => {
    measure();
    if (!frame) frame = requestAnimationFrame(tick);
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  // The page grows as images and the projects section load in, so re-measure when its size changes.
  if ("ResizeObserver" in window) new ResizeObserver(update).observe(document.body);
  update();
}

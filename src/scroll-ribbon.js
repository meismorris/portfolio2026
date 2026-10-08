// Draws the background ribbon in step with scroll: hidden at the top, fully drawn at the bottom.
// Only stroke-dashoffset changes (through --line-offset); nothing touches layout or scrolling.
const ribbon = document.querySelector(".scroll-ribbon");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// On screens wider than the 1440px ribbon frame, the curve's start would sit out in the empty
// margin. Prepend a smooth lead-in so the line always emerges from the real left edge of the window.
const widePath = ribbon?.querySelector(".scroll-ribbon__path--wide");
const baseD = widePath?.getAttribute("d");
const START_Y = 260; // page y where the line enters, matching the 1440px design

const extendToEdge = () => {
  if (!widePath) return;
  widePath.setAttribute("d", baseD);
  const viewportWidth = document.documentElement.clientWidth;
  const frameLeft = (viewportWidth - Math.min(viewportWidth, 1440)) / 2;
  if (frameLeft < 1 || getComputedStyle(widePath).display === "none") return;
  const [sx, sy, c1x, c1y] = baseD.match(/-?\d+(\.\d+)?/g).slice(0, 4).map(Number);
  const toPath = widePath.getScreenCTM().inverse();
  const lead = new DOMPoint(-60, START_Y - window.scrollY).matrixTransform(toPath);
  // Second control mirrors the curve's first control around its start, so the join stays smooth.
  const leadIn = `M ${lead.x.toFixed(1)} ${lead.y.toFixed(1)} C ${((lead.x + sx) / 2).toFixed(1)} ${lead.y.toFixed(1)} ${2 * sx - c1x} ${2 * sy - c1y} ${sx} ${sy} `;
  widePath.setAttribute("d", leadIn + baseD.replace(/^M\s*-?[\d.]+\s+-?[\d.]+\s*/, ""));
};

if (ribbon) {
  // Re-fit whenever the window or the page height changes (the projects section loads in late).
  let fitTimer = 0;
  const scheduleFit = () => {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(extendToEdge, 120);
  };
  extendToEdge();
  window.addEventListener("resize", scheduleFit);
  if ("ResizeObserver" in window) new ResizeObserver(scheduleFit).observe(document.body);
}

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

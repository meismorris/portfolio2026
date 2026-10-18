// Hover intent for the project banners: when the page scrolls a banner underneath a cursor that
// isn't moving, the browser still reports a hover. That would launch a whole hover sequence while
// someone is just scrolling past, so a scroll-caused hover waits for the mouse to actually move.
const SCROLL_QUIET_MS = 250; // a hover this soon after a scroll counts as scroll-caused
const MOVE_PX = 3;           // how far the cursor must travel to count as a real move

export default function bindHoverIntent(el, onEnter, onLeave) {
  let lastScroll = -Infinity;
  let last = null;
  let inside = false;
  let waiting = false; // inside because of a scroll; play on the first real move
  let entered = false;

  const onScroll = () => { lastScroll = performance.now(); };
  const onWindowMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const moved = !last || Math.hypot(e.clientX - last.x, e.clientY - last.y) > MOVE_PX;
    last = { x: e.clientX, y: e.clientY };
    if (inside && waiting && moved) { waiting = false; entered = true; onEnter(); }
  };
  const handleEnter = () => {
    inside = true;
    if (performance.now() - lastScroll < SCROLL_QUIET_MS) { waiting = true; return; }
    entered = true;
    onEnter();
  };
  const handleLeave = () => {
    inside = false;
    waiting = false;
    if (!entered) return;
    entered = false;
    onLeave();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onWindowMove, { passive: true });
  el.addEventListener("mouseenter", handleEnter);
  el.addEventListener("mouseleave", handleLeave);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onWindowMove);
    el.removeEventListener("mouseenter", handleEnter);
    el.removeEventListener("mouseleave", handleLeave);
  };
}

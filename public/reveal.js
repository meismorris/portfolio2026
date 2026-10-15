// Light scroll reveal for the landing page, About and the footer (case studies have their own).
// Blocks fade in and rise 18px as they enter the view; siblings cascade 90ms apart.
(() => {
  window.__srLoaded = true;
  const root = document.documentElement;
  if (!root.classList.contains("sr-ready")) return;
  if (!("IntersectionObserver" in window)) { root.classList.remove("sr-ready"); return; }

  const SELECTOR = [
    ".footer-panel",
    ".selected-projects__heading", ".selected-projects__row",
    ".about-hero__title", ".about-pills", ".about-intro", ".about-section",
    ".about-gallery__col > *", ".about-game",
  ].join(",");
  const STAGGER_MS = 90;
  const seen = new WeakSet();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("sr-in");
      observer.unobserve(entry.target);
      // Drop the stagger delay once shown, so later hover transitions aren't delayed.
      setTimeout(() => entry.target.style.removeProperty("--sr-delay"), 1200);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  const scan = () => {
    const fresh = [...document.querySelectorAll(SELECTOR)].filter((el) => !seen.has(el));
    fresh.forEach((el) => {
      seen.add(el);
      const siblings = [...el.parentElement.children].filter((child) => child.matches(SELECTOR));
      el.style.setProperty("--sr-delay", `${Math.min(siblings.indexOf(el), 4) * STAGGER_MS}ms`);
      observer.observe(el);
    });
  };

  scan();
  // The landing page's projects section is rendered by React after load, so pick it up when it appears.
  const watcher = new MutationObserver(scan);
  watcher.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => { scan(); watcher.disconnect(); }, 8000);
})();

(() => {
  const pastelColors = ["#A9C3F5", "#A8D8B5", "#D7AFE6", "#F2B1A0"];
  const shuffledColors = [...pastelColors];

  for (let index = shuffledColors.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledColors[index], shuffledColors[randomIndex]] = [shuffledColors[randomIndex], shuffledColors[index]];
  }

  document.querySelectorAll(".project-facts dt").forEach((label, index) => {
    label.style.setProperty("--fact-accent", shuffledColors[index % shuffledColors.length]);
  });

  const tocLinks = [...document.querySelectorAll(".case-toc a[href^='#']")];
  const sections = tocLinks
    .map((link, index) => {
      const section = document.querySelector(link.getAttribute("href"));
      link.style.setProperty("--toc-accent", shuffledColors[index % shuffledColors.length]);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  // Each eyebrow takes the accent of the table-of-contents entry it falls under,
  // so follow-on sections (like the extra Design sections) share their entry's colour.
  document.querySelectorAll(".case-section .eyebrow").forEach((eyebrow) => {
    const host = eyebrow.closest(".case-section");
    const owner = sections.filter(({ section }) =>
      section === host || section.compareDocumentPosition(host) & Node.DOCUMENT_POSITION_FOLLOWING).pop();
    if (owner) eyebrow.style.setProperty("--eyebrow-accent", owner.link.style.getPropertyValue("--toc-accent"));
  });

  const setActive = (activeSection) => {
    sections.forEach(({ link, section }) => {
      if (section === activeSection) {
        link.setAttribute("aria-current", "location");
        link.style.color = link.style.getPropertyValue("--toc-accent");
      } else {
        link.removeAttribute("aria-current");
        link.style.removeProperty("color");
      }
    });
  };

  const centerSection = (section) => {
    const rect = section.getBoundingClientRect();
    const documentTop = rect.top + window.scrollY;
    const targetTop = documentTop + rect.height / 2 - window.innerHeight / 2;
    const maximumTop = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: Math.max(0, Math.min(targetTop, maximumTop)),
      behavior: "smooth",
    });
  };

  const activationLine = () => window.innerHeight * 0.36;
  const updateActive = () => {
    const line = activationLine();
    let activeSection = sections[0]?.section;
    for (const { section } of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= line) activeSection = section;
      else break;
    }
    // Short final sections never reach the line, so claim the last one at the bottom of the page.
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom && sections.length) activeSection = sections[sections.length - 1].section;
    if (activeSection) setActive(activeSection);
  };

  let observer;
  const observeActiveSection = () => {
    observer?.disconnect();
    const line = activationLine();
    const bottomInset = Math.max(0, window.innerHeight - line - 1);
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(() => updateActive(), {
        rootMargin: `-${line}px 0px -${bottomInset}px 0px`,
        threshold: 0,
      });
      sections.forEach(({ section }) => observer.observe(section));
    } else {
      document.addEventListener("scroll", updateActive, { passive: true });
    }
    updateActive();
  };

  const handleResize = () => {
    if (observer) observeActiveSection();
    else updateActive();
  };

  let scheduled = false;
  document.addEventListener("scroll", () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      updateActive();
      scheduled = false;
    });
  }, { passive: true });

  window.addEventListener("resize", handleResize, { passive: true });
  tocLinks.forEach((link) => link.addEventListener("click", (event) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (!section) return;
    event.preventDefault();
    history.pushState(null, "", link.hash);
    setActive(section);
    centerSection(section);
  }));
  observeActiveSection();

  const revealSelectors = [
    ".case-intro h1", ".project-facts", ".intro-summary > p", ".intro-metric", ".case-banner",
    ".section-intro", ".challenge-panel", ".insight-card", ".method-compare",
    ".design-visual", ".result-card", ".after-launch",
    ".feature-card", ".stat-card", ".before-after figure", ".placeholder--wide", ".slideshow", ".wipe",
  ];
  const revealTargets = [...document.querySelectorAll(revealSelectors.join(","))];

  if (document.documentElement.classList.contains("reveal-ready")) {
    // Stagger siblings that share a parent so card groups cascade in.
    revealTargets.forEach((element) => {
      const siblings = revealTargets.filter((other) => other.parentElement === element.parentElement);
      element.dataset.reveal = "";
      element.style.setProperty("--reveal-delay", `${siblings.indexOf(element) * 120}ms`);
    });

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
      revealTargets.forEach((element) => revealObserver.observe(element));

      // Blocks at the very end of the page may never reach the trigger line, so reveal them at the bottom.
      const revealRemaining = () => {
        if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 2) return;
        revealTargets.forEach((element) => element.classList.add("is-revealed"));
        document.removeEventListener("scroll", revealRemaining);
      };
      document.addEventListener("scroll", revealRemaining, { passive: true });
    } else {
      revealTargets.forEach((element) => element.classList.add("is-revealed"));
    }
  }

  document.querySelectorAll(".slideshow").forEach((show) => {
    const slides = [...show.querySelectorAll(".slideshow__slide")];
    const next = show.querySelector(".slideshow__next");
    let current = 0;

    const go = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === current);
        slide.classList.toggle("is-before", i < current);
        if (i === current) slide.removeAttribute("aria-hidden");
        else slide.setAttribute("aria-hidden", "true");
      });
      const upcoming = (current + 1) % slides.length;
      next.setAttribute("aria-label", `Show next visual, ${upcoming + 1} of ${slides.length}`);
    };

    next.addEventListener("click", () => {
      show.classList.add("is-interacted");
      go(current + 1);
    });
    go(0);
  });

  document.querySelectorAll(".wipe").forEach((wipe) => {
    const tabs = [...wipe.querySelectorAll(".wipe__tab")];
    const before = wipe.querySelector(".wipe__layer--before");
    const after = wipe.querySelector(".wipe__layer--after");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let touched = false;

    const show = (state) => {
      if (wipe.dataset.state === state) return;
      wipe.dataset.state = state;
      tabs.forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.target === state)));
      const [shown, hidden] = state === "after" ? [after, before] : [before, after];
      shown.removeAttribute("aria-hidden");
      hidden.setAttribute("aria-hidden", "true");
      if (!reduceMotion) wipe.classList.add("is-moving");
    };
    before.addEventListener("transitionend", (event) => {
      if (event.propertyName === "clip-path") wipe.classList.remove("is-moving");
    });

    tabs.forEach((tab) => tab.addEventListener("click", () => {
      touched = true;
      show(tab.dataset.target);
    }));

    // Play the change once when the comparison is properly in view.
    if (!reduceMotion && "IntersectionObserver" in window) {
      const introObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        introObserver.disconnect();
        setTimeout(() => { if (!touched) show("after"); }, 900);
      }, { threshold: 0.6 });
      introObserver.observe(wipe);
    }
  });

  document.querySelectorAll(".method-compare").forEach((compare) => {
    const tabs = [...compare.querySelectorAll(".method-compare__tab")];
    const slides = [...compare.querySelectorAll(".method-compare__slide")];
    const arrow = compare.querySelector(".method-compare__arrow");

    const show = (method) => {
      compare.dataset.method = method;
      compare.classList.add("is-interacted");
      tabs.forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.target === method)));
      slides.forEach((slide) => {
        if (slide.dataset.slide === method) slide.removeAttribute("aria-hidden");
        else slide.setAttribute("aria-hidden", "true");
      });
      arrow.setAttribute("aria-label", method === "ours" ? "Show the original method" : "Show the FindMyLab method");
    };

    tabs.forEach((tab) => tab.addEventListener("click", () => show(tab.dataset.target)));
    arrow.addEventListener("click", () => show(compare.dataset.method === "ours" ? "original" : "ours"));
  });
})();
import { inject } from "@vercel/analytics";
import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import Accent from "./framer/Ximws3R4.js";
import Flower from "./framer/N7n53oxvv.js";
import AnimatedText from "./framer/Animatedtextheading.js";
import AnimatedSVGUnderline from "./AnimatedSVGUnderline.jsx";
import SelectedProjects from "./SelectedProjects.jsx";
import "./scroll-ribbon.js";
import "./hero-extras.js";

// Every page loads this bundle, so this one call covers the whole site.
inject();

const accentSlot = document.querySelector(".framer-1xaff57-container");
const flowerSlot = document.querySelector(".framer-a9p31y-container");
const textPhrases = [
  [".framer-1dsbwvv-container", "a product designer who"],
  [".framer-ufaq8r-container", "codes, and designs 0→1"],
  [".framer-166h1p2-container", "consumer apps."],
];

if (accentSlot) {
  createRoot(accentSlot).render(React.createElement(Accent, { style: { width: "100%", height: "100%" } }));
}

// About page: the same boiling sunburst doodle next to "hey it's me".
const aboutAccentSlot = document.querySelector(".about-hero__accent");
if (aboutAccentSlot) {
  createRoot(aboutAccentSlot).render(React.createElement(Accent, { style: { width: "100%", height: "100%" } }));
}

if (flowerSlot) {
  createRoot(flowerSlot).render(React.createElement(Flower, { variant: "Animate", style: { width: "100%", height: "100%" } }));
}

// The page's HTML carries the headline as one plain sentence (.hero-text), so link previews, scrapers
// and readers that ignore CSS still get "…morris, a product designer who codes…" with its spaces.
// Here the styled greeting and animated lines are filled in, then the headline switches over to them.
const heroTitle = document.querySelector("h1.hero-title");
const heroGreeting = heroTitle?.querySelector(".hero-greeting");
if (heroGreeting) heroGreeting.textContent = "hey! i’m morris,";

for (const [selector, text] of textPhrases) {
  const slot = document.querySelector(selector);
  if (slot) {
    const root = createRoot(slot);
    flushSync(() => root.render(React.createElement(AnimatedText, {
      text,
      defaultColor: "#0f172a",
      font: {
        fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
        fontSize: "64px",
        letterSpacing: "-0.04em",
        lineHeight: "1em",
      },
      textAlign: "center",
      wrapText: true,
      padding: "0px",
      moveDistance: 14,
      rotationAngle: 12,
      style: { width: "100%" },
    })));
  }
}
if (heroTitle) {
  heroTitle.classList.add("is-split");
  heroTitle.querySelector(".hero-text")?.remove(); // the animated lines (with spaces between them) take over
}

const navLinks = document.querySelectorAll(".framer-1ygnspq > a, .case-navbar__links > a");
// The hero scribble palette (g-warm, g-sky, g-lime, g-ribbon in index.html), as left-to-right gradients.
const navUnderlineGradients = [
  ["#FFE38C", "#FFAC82", "#FF7D4D", "#FF6835"],
  ["#78B0FF", "#8FD0FF", "#A8E4F4", "#C3EEB4"],
  ["#B7D45A", "#C8D665", "#D2EC5C", "#D6E27C"],
  ["#B3BCFF", "#9CB4FD", "#86BDFC", "#93BDFB"],
];
for (const [index, link] of [...navLinks].entries()) {
  const linkText = (link.dataset.framerName || link.textContent || "Link").trim();
  const isCurrent = link.getAttribute("data-framer-page-link-current") === "true";
  const isCaseNavbar = link.closest(".case-navbar__links") !== null;

  createRoot(link).render(
    React.createElement(AnimatedSVGUnderline, {
      text: linkText,
      textColor: "#0f172a",
      underlineColor: navUnderlineGradients[index % navUnderlineGradients.length][1],
      underlineGradient: navUnderlineGradients[index % navUnderlineGradients.length],
      font: {
        fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
        fontSize: "24px", // type-scale.css sets the real size per screen width
        letterSpacing: "-0.04em",
        lineHeight: "1.2em",
      },
      strokeWidth: 3,
      gap: 4,
      isActive: isCurrent,
      animationTransition: { type: "tween", duration: 0.6, ease: "easeInOut" },
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: isCaseNavbar ? "auto" : "100%",
        height: isCaseNavbar ? "auto" : "100%",
      },
    })
  );
}

const projectsSection = document.querySelector(".framer-11oly4t");
if (projectsSection) {
  document.querySelector(".framer-10ff52h")?.remove();
  createRoot(projectsSection).render(React.createElement(SelectedProjects));
}

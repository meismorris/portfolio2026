import React from "react";
import { createRoot } from "react-dom/client";
import Accent from "./framer/Ximws3R4.js";
import Flower from "./framer/N7n53oxvv.js";
import AnimatedText from "./framer/Animatedtextheading.js";
import AnimatedSVGUnderline from "./AnimatedSVGUnderline.jsx";
import SelectedProjects from "./SelectedProjects.jsx";
import "./scroll-ribbon.js";

const accentSlot = document.querySelector(".framer-1xaff57-container");
const flowerSlot = document.querySelector(".framer-a9p31y-container");
const textPhrases = [
  [".framer-1dsbwvv-container", "a designer that turns"],
  [".framer-ufaq8r-container", "complexity into clean"],
  [".framer-166h1p2-container", "and intuitive interfaces."],
];

if (accentSlot) {
  createRoot(accentSlot).render(React.createElement(Accent, { style: { width: "100%", height: "100%" } }));
}

if (flowerSlot) {
  createRoot(flowerSlot).render(React.createElement(Flower, { variant: "Animate", style: { width: "100%", height: "100%" } }));
}

for (const [selector, text] of textPhrases) {
  const slot = document.querySelector(selector);
  if (slot) {
    createRoot(slot).render(React.createElement(AnimatedText, {
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
    }));
  }
}

const navLinks = document.querySelectorAll(".framer-1ygnspq > a, .case-navbar__links > a");
const navUnderlineColors = ["#E9A6AD", "#8FCFBA", "#9BBCE8"];
for (const [index, link] of [...navLinks].entries()) {
  const linkText = (link.dataset.framerName || link.textContent || "Link").trim();
  const isCurrent = link.getAttribute("data-framer-page-link-current") === "true";
  const isCaseNavbar = link.closest(".case-navbar__links") !== null;

  createRoot(link).render(
    React.createElement(AnimatedSVGUnderline, {
      text: linkText,
      textColor: "#0f172a",
      underlineColor: navUnderlineColors[index % navUnderlineColors.length],
      font: {
        fontFamily: '"Manrope", "Manrope Placeholder", sans-serif',
        fontSize: "24px",
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

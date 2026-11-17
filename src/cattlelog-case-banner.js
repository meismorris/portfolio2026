// Entry for public/cattlelog-banner.js: the animated pieces of the Cattlelog case study page
// (the banner at the top and the rocket stat cards in Overview and Impact).
import mountCattlelogBanner from "./cattlelog-motion-banner.js";
import mountResultsCard from "./cattlelog-results-card.js";

const banner = document.getElementById("cl-case-banner");
if (banner) mountCattlelogBanner(banner);

document.querySelectorAll(".clr-card").forEach(mountResultsCard);

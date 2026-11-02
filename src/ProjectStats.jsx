import React from "react";

const icons = "/figma-projects/card-stats/";

// The stats row under a project card's caption (Figma: "Stats" in 489:1349 and 717:173).
// Every number here is in Figma pixels; the CSS multiplies them by the card's scale.
export default function ProjectStats({ stats }) {
  return (
    <div className="project-stats">
      {stats.flatMap((stat, index) => [
        index > 0 && (
          <div className="project-stats__divider" key={`divider-${stat.icon}`}>
            <div><img src={`${icons}divider.svg`} width="483" height="5" alt="" /></div>
          </div>
        ),
        <div className="project-stat" key={stat.icon} style={{ "--w": stat.width }}>
          <div className="project-stat__tile" style={{ "--tint": stat.tint, "--pad": stat.pad }}>
            <div className={`project-stat__icon${stat.person ? " project-stat__icon--person" : ""}`} style={{ "--icon": stat.size }}>
              <img src={`${icons}${stat.icon}`} alt="" />
            </div>
          </div>
          <p className="project-stat__text">{stat.text}</p>
        </div>,
      ])}
    </div>
  );
}

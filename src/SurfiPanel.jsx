import React from "react";

/* SurfAI (2026): work in progress. Same card shell as FindMyLab (fml-panel__card / __banner / __caption),
   so it inherits the sizing, radius and caption type. Not a link yet: no case study page exists. */
export default function SurfiPanel() {
  return (
    <div className="fml-panel surfi-panel" role="group" aria-label="SurfAI, 2026, work in progress">
      <div className="fml-panel__card">
        <div className="fml-panel__banner surfi-panel__banner" aria-hidden="true">
          <div className="surfi-panel__glow" />
          <img className="surfi-panel__logo" src="/figma-projects/surfi-panel/surf-logo.svg" alt="" />
        </div>
        <div className="fml-panel__caption">
          <p className="fml-panel__title">SurfAI <span>• 2026</span> <em className="wip-badge">case study in progress</em></p>
          <p className="fml-panel__subtitle">Sped up team workflows with internal tools and a new site</p>
        </div>
      </div>
    </div>
  );
}

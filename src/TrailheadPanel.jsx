import React from "react";

/* Trailhead (2026): same card shell as FindMyLab (fml-panel__card / __banner / __caption).
   Banner: meadow flow-mesh; the "4 · On the trail" screen from Trailhead prototype v2 whose
   drawer slides up into "4b · Hike details" on hover; four widgets lifted from the prototype
   (two pills, a medal tile, a sunset card); and the Grove trees from "Hike logged motion",
   which slide in from the bottom corners on hover. */

const TREE = {
  pine: (c) => (
    <svg viewBox="0 0 22 30"><path fill={c} d="M11 0 19 11h-4l6 9H1l6-9H3z" /><rect x="9" y="20" width="4" height="9" rx="1.5" fill="#7A5232" /></svg>
  ),
  round: (c) => (
    <svg viewBox="0 0 22 28"><circle cx="11" cy="10" r="10" fill={c} /><rect x="9" y="17" width="4" height="10" rx="1.5" fill="#7A5232" /></svg>
  ),
  tall: (c) => (
    <svg viewBox="0 0 14 30"><ellipse cx="7" cy="11" rx="7" ry="11" fill={c} /><rect x="5.5" y="19" width="3" height="10" rx="1.2" fill="#7A5232" /></svg>
  ),
};

/* four trees per corner, biggest at the corner and stepping down as they move inward.
   x = distance from that corner, h = height (banner units, banner is 4339 wide); i = order from the corner */
const CORNER = [
  { k: "pine", x: 40, h: 420 },
  { k: "round", x: 250, h: 330 },
  { k: "tall", x: 430, h: 300 },
  { k: "pine", x: 570, h: 240 },
];
const LEFT = ["#2E6B4E", "#B4EE8C", "#009473", "#3E9B5F"];
const RIGHT = ["#3E9B5F", "#6CCB8E", "#2E6B4E", "#B4EE8C"];

function Corner({ side, colors }) {
  return (
    <div className={`trail-panel__corner trail-panel__corner--${side}`}>
      <svg className="trail-panel__hill" viewBox="0 0 1300 360" preserveAspectRatio="none">
        <path d="M0 40 C 300 30 620 120 900 230 C 1060 290 1180 330 1300 360 L0 360Z" />
      </svg>
      {CORNER.map((t, i) => (
        <span key={i} className="trail-panel__tree" style={{ "--x": t.x, "--h": t.h, "--i": i }}>
          {TREE[t.k](colors[i])}
        </span>
      ))}
    </div>
  );
}

export default function TrailheadPanel() {
  return (
    <div className="fml-panel trail-panel" role="group" aria-label="Trailhead, 2026">
      <div className="fml-panel__card">
        <div className="fml-panel__banner trail-panel__banner" aria-hidden="true">
          <Corner side="l" colors={LEFT} />
          <Corner side="r" colors={RIGHT} />

          <div className="trail-panel__phone">
            <img className="trail-panel__map" src="/figma-projects/trail-panel/hike-map.webp" alt="" />
            <img className="trail-panel__drawer" src="/figma-projects/trail-panel/hike-drawer.webp" alt="" />
          </div>

          {/* two pills */}
          <div className="trail-panel__w trail-panel__pill trail-panel__w--offline">
            <span className="trail-panel__dot trail-panel__dot--ok">
              <svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.3 4.3L19 7.5" /></svg>
            </span>
            <span><b>Works offline</b><span>East Ridge Loop · 24 MB</span></span>
          </div>

          <div className="trail-panel__w trail-panel__pill trail-panel__w--signal">
            <span className="trail-panel__dot trail-panel__dot--signal">
              <svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M13.3 17.9a1.3 1.3 0 1 1-2.6 0a1.3 1.3 0 0 1 2.6 0M8.3 14.2a5.2 5.2 0 0 1 7.4 0M5.5 11.4a9.2 9.2 0 0 1 13 0" /><path d="M3 3l18 18" /></g></svg>
            </span>
            <span><b>Signal drops 0.4 mi in</b><span>The map keeps working</span></span>
          </div>

          {/* a trail card */}
          <div className="trail-panel__w trail-panel__tile trail-panel__w--trail">
            <img className="trail-panel__photo" src="/figma-projects/trail-panel/photo-redwood.webp" alt="" />
            <b>East Ridge Loop</b>
            <span className="trail-panel__meta"><i className="trail-panel__diff" />Moderate · 5.2 mi · 2h 40m</span>
          </div>

          {/* a hike plan card */}
          <div className="trail-panel__w trail-panel__card trail-panel__w--plan">
            <span className="trail-panel__label">Hike plan</span>
            <div className="trail-panel__tl">
              <div className="is-done"><b>Steepest part</b><span>Mile 1.2</span></div>
              <div className="is-done"><b>Halfway bench</b><span>Mile 2.6</span></div>
              <div className="is-end"><b>Back at the trailhead</b><span>Mile 5.2</span></div>
            </div>
          </div>
        </div>
        <div className="fml-panel__caption">
          <p className="fml-panel__title">Trailhead <span>• 2026</span> <em className="wip-badge">Case study in progress</em></p>
          <p className="fml-panel__subtitle">kept hikers on track off-grid with offline trail maps</p>
        </div>
      </div>
    </div>
  );
}

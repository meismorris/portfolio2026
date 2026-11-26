/* sidequestingggg: scribble boil, letter hover, explorations grid and popup player (from the handoff). */
(() => {
  const page = document.querySelector(".sq");
  if (!page) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Idle "boil": every mark flips between 3 hand-jittered frames (~200ms), like a stop-motion line.
  const boil = [...page.querySelectorAll(".s path")].map((p) => {
    const vb = p.ownerSVGElement.viewBox.baseVal, amp = Math.max(vb.width, vb.height) * 0.012;
    const base = p.getAttribute("d");
    const frame = () => base.replace(/-?\d*\.?\d+/g, (n) => (+n + (Math.random() - 0.5) * 2 * amp).toFixed(2));
    return { p, frames: [base, frame(), frame()] };
  });
  // Keep every stroke ~5px on screen whatever size its svg is drawn at.
  const sizeStrokes = () => page.querySelectorAll("svg.s").forEach((svg) => {
    const unit = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    if (unit) svg.querySelectorAll("path").forEach((p) => (p.style.strokeWidth = (5 / unit).toFixed(2)));
  });
  sizeStrokes();
  addEventListener("resize", sizeStrokes);

  let f = 0;
  if (!reduce) setInterval(() => {
    if (document.hidden) return;
    f = (f + 1) % 3;
    boil.forEach(({ p, frames }) => p.setAttribute("d", frames[f]));
  }, 200);

  // Per-letter hover (same as the home page): a touched letter tilts up/down and takes a pastel colour,
  // holds while hovered, then eases back and fades to black when the cursor leaves.
  const word = page.querySelector(".word");
  const tints = ["#7fa6f2", "#a99bf0", "#9cc7f5", "#a9c94b", "#ef8faf"];
  word.innerHTML = [...word.textContent].map((c) => `<span class="ch">${c}</span>`).join("");
  word.querySelectorAll(".ch").forEach((ch) => {
    ch.addEventListener("pointerenter", () => {
      if (reduce) return;
      const em = parseFloat(getComputedStyle(ch).fontSize) / 64;
      const y = (Math.random() < 0.5 ? -1 : 1) * 14 * em;
      const r = (Math.random() < 0.5 ? -1 : 1) * 12;
      ch.style.transition = "transform .55s cubic-bezier(.2,.8,.3,1), color .35s ease";
      ch.style.transform = `translateY(${y}px) rotate(${r}deg)`;
      ch.style.color = tints[Math.floor(Math.random() * tints.length)];
    });
    ch.addEventListener("pointerleave", () => {
      ch.style.transition = "transform 1.4s cubic-bezier(.3,.7,.3,1), color 2s ease";
      ch.style.transform = "translateY(0) rotate(0)";
      ch.style.color = "";
    });
  });

  // ---------- explorations: edit this list ----------
  //  Each item becomes one box in the grid. Boxes are static previews; clicking opens the popup.
  //  embed: path to an interactive page (shown frozen in the box, live + interactive in the popup)
  //  video: path to an .mp4 (box shows a still frame at 0.6s, popup plays it with controls)
  //  title / desc: shown only in the popup, under the media
  const ITEMS = [
    { title: "Minecraft themed card :D", desc: "Saw the Ramp cards design and I wanted to make something similar heh", embed: "/sidequest-media/minecraft/card" },
    { title: "Portfolio hero drafts", desc: "Different iterations of my header before finalizing", video: "/sidequest-media/heroes/heroes.mp4?v=1" },
  ];
  const VIDS = ITEMS.filter((it) => it.video || it.embed);   // everything that opens in the popup

  const ICON = {
    play: '<svg class="fill" viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
    pause: '<svg class="fill" viewBox="0 0 24 24"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>',
    sound: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>',
    muted: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  };

  const grid = page.querySelector(".sq-grid");
  grid.innerHTML = ITEMS.map((it) => {
    const i = VIDS.indexOf(it);
    if (it.embed) return `
    <button class="tile" type="button" data-v="${i}" aria-label="${it.title}">
      <div class="thumb"><iframe src="${it.embed}" tabindex="-1" aria-hidden="true" loading="lazy" title=""></iframe></div>
    </button>`;
    if (it.video) return `
    <button class="tile" type="button" data-v="${i}" aria-label="${it.title}">
      <div class="thumb"><video src="${it.video}#t=0.6" muted playsinline preload="metadata"></video></div>
    </button>`;
    return '<div class="tile empty" aria-hidden="true"><div class="thumb"></div></div>';
  }).join("");
  grid.querySelectorAll("button.tile").forEach((t) => t.addEventListener("click", () => openPlayer(+t.dataset.v)));

  const dlg = document.querySelector("dialog.sq-player"), well = dlg.querySelector(".well");
  const $ = (id) => document.getElementById(id);
  const pv = $("pl-video"), playBtn = $("pl-play"), muteBtn = $("pl-mute"), bar = $("pl-bar"),
        fill = bar.querySelector("i"), timeEl = $("pl-time"), pf = $("pl-frame");
  let cur = 0, idleT;

  const fmt = (t) => (isFinite(t) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}` : "0:00");
  const sync = () => {
    playBtn.innerHTML = pv.paused ? ICON.play : ICON.pause;
    muteBtn.innerHTML = pv.muted ? ICON.muted : ICON.sound;
  };
  function show(i) {
    cur = (i + VIDS.length) % VIDS.length;
    const it = VIDS[cur];
    $("pl-title").textContent = it.title;
    $("pl-desc").textContent = it.desc;
    $("pl-count").textContent = `${cur + 1} / ${VIDS.length}`;
    well.classList.toggle("is-embed", !!it.embed);
    if (it.embed) { pv.pause(); pv.removeAttribute("src"); pv.load(); if (pf.getAttribute("src") !== it.embed) pf.src = it.embed; }
    else { pf.removeAttribute("src"); pv.src = it.video; pv.muted = true; pv.play().catch(() => {}); }
    sync(); wake();
  }
  if (VIDS.length < 2) dlg.querySelectorAll(".nav, .count").forEach((el) => (el.style.display = "none"));
  // The site's smooth scroll (Lenis) is paused while the popup is open so the page underneath stays put.
  function openPlayer(i) { dlg.showModal(); document.body.style.overflow = "hidden"; window.lenis?.stop(); show(i); }
  function closePlayer() { pv.pause(); dlg.close(); }
  dlg.addEventListener("close", () => { pv.pause(); pf.removeAttribute("src"); document.body.style.overflow = ""; window.lenis?.start(); });

  $("pl-close").onclick = closePlayer;
  dlg.querySelector(".prev").onclick = () => show(cur - 1);
  dlg.querySelector(".next").onclick = () => show(cur + 1);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) closePlayer(); });   // click the scrim to close
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(cur + 1);
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if ((e.key === " " && e.target === pv) || e.key === "k") { e.preventDefault(); toggle(); }
  });

  const toggle = () => (pv.paused ? pv.play().catch(() => {}) : pv.pause());
  playBtn.onclick = toggle; pv.onclick = toggle;
  muteBtn.onclick = () => { pv.muted = !pv.muted; sync(); };
  pv.addEventListener("play", sync); pv.addEventListener("pause", sync);
  pv.addEventListener("timeupdate", () => {
    fill.style.width = (pv.duration ? (pv.currentTime / pv.duration) * 100 : 0) + "%";
    timeEl.textContent = `${fmt(pv.currentTime)} / ${fmt(pv.duration)}`;
  });
  const seek = (e) => { const r = bar.getBoundingClientRect(); if (pv.duration) pv.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * pv.duration; };
  bar.addEventListener("pointerdown", (e) => { seek(e); bar.setPointerCapture(e.pointerId); bar.onpointermove = seek; });
  bar.addEventListener("pointerup", () => (bar.onpointermove = null));
  bar.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.stopPropagation(); pv.currentTime += e.key === "ArrowRight" ? 5 : -5; } });

  // Controls tuck away when the mouse rests on the video.
  function wake() { well.classList.remove("idle"); clearTimeout(idleT); idleT = setTimeout(() => !pv.paused && well.classList.add("idle"), 2000); }
  well.addEventListener("pointermove", wake);

  document.fonts.ready.then(() => { sizeStrokes(); page.classList.add("draw"); });
})();

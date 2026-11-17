import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { build } from "esbuild";

await build({
  entryPoints: ["src/hero-animation.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  outfile: "public/hero-animation.js",
});

// Cattlelog case study banner: its own small bundle, loaded only on /cattlelog.
await build({
  entryPoints: ["src/cattlelog-case-banner.js"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  outfile: "public/cattlelog-banner.js",
});

const bundle = await readFile("public/hero-animation.js");
const version = createHash("sha256").update(bundle).digest("hex").slice(0, 12);
const stylesheet = await readFile("public/hero-animation.css");
const stylesheetVersion = createHash("sha256").update(stylesheet).digest("hex").slice(0, 12);
const htmlPath = "public/index.html";
let html = await readFile(htmlPath, "utf8");
const scriptTag = `<script defer src="/hero-animation.js?v=${version}"></script>`;
const scriptPattern = /<script defer src="\/hero-animation\.js(?:\?v=[^"]*)?"><\/script>/;
const stylesheetTag = `<link rel="stylesheet" href="/hero-animation.css?v=${stylesheetVersion}">`;
const stylesheetPattern = /<link rel="stylesheet" href="\/hero-animation\.css(?:\?v=[^"]*)?">/;
const headEnd = html.indexOf("</head>");

if (scriptPattern.test(html)) {
  html = html.replace(scriptPattern, scriptTag);
} else {
  if (headEnd === -1) throw new Error("Could not find the page head in public/index.html");
  html = `${html.slice(0, headEnd)}${scriptTag}${html.slice(headEnd)}`;
}

if (stylesheetPattern.test(html)) {
  html = html.replace(stylesheetPattern, stylesheetTag);
} else {
  const updatedHeadEnd = html.indexOf("</head>");
  if (updatedHeadEnd === -1) throw new Error("Could not find the page head in public/index.html");
  html = `${html.slice(0, updatedHeadEnd)}${stylesheetTag}${html.slice(updatedHeadEnd)}`;
}

await writeFile(htmlPath, html);

// Cache-bust the case study banner's script and stylesheet on public/cattlelog.html.
const hashOf = async (f) => createHash("sha256").update(await readFile(f)).digest("hex").slice(0, 12);
const casePath = "public/cattlelog.html";
let caseHtml = await readFile(casePath, "utf8");
caseHtml = caseHtml
  .replace(/\/cattlelog-banner\.js(?:\?v=[^"]*)?"/, `/cattlelog-banner.js?v=${await hashOf("public/cattlelog-banner.js")}"`)
  .replace(/\/cattlelog-banner\.css(?:\?v=[^"]*)?"/, `/cattlelog-banner.css?v=${await hashOf("public/cattlelog-banner.css")}"`);
await writeFile(casePath, caseHtml);

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
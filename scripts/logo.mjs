// Fichiers du logo à partir de data/logo.json :
//   npm run logo  →  public/logo.svg (logo complet), public/logo-mark.svg (le coq), app/icon.svg (favicon),
//                    app/apple-icon.png (180 px) et un aperçu dans print/apercu-logo.png
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const L = JSON.parse(await readFile(path.join(ROOT, "data/logo.json"), "utf8"));
const m = L.mark;

const markInner = (red = L.red, beak = L.rice, eye = L.cream) =>
  `<path d="${m.comb}" fill="${red}"/><path d="${m.body}" fill="${red}"/><path d="${m.head}" fill="${red}"/><path d="${m.wattle}" fill="${red}"/><path d="${m.beak}" fill="${beak}"/>${eye ? `<path d="${m.eye}" fill="${eye}"/>` : ""}`;
const wordInner = (color = L.red) =>
  `<g fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">${L.word.map((d) => `<path d="${d}"/>`).join("")}</g><path d="${L.flame}" fill="${L.rice}"/>`;

// Logo complet : coq (hauteur 122) à gauche, MAILY + sous-titre à droite
const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 130" width="400" height="130">
<g transform="translate(-14 2)">${markInner()}</g>
<g transform="translate(98 22) scale(1.1)">${wordInner()}</g>
<text x="100" y="118" font-family="Inter, Arial, Helvetica, sans-serif" font-size="15.5" font-weight="600" letter-spacing="3.6" fill="#1A1A1A">RÔTISSERIE VIETNAMIENNE</text>
</svg>`;
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${L.markViewBox}">${markInner()}</svg>`;
// Favicon : le coq crème sur une pastille rouge
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="30" fill="${L.red}"/><g transform="translate(8 6) scale(0.94)">${markInner(L.cream, L.rice, L.red)}</g></svg>`;

await writeFile(path.join(ROOT, "public/logo.svg"), full);
await writeFile(path.join(ROOT, "public/logo-mark.svg"), mark);
await writeFile(path.join(ROOT, "app/icon.svg"), icon);
await sharp(Buffer.from(icon), { density: 300 }).resize(180).png().toFile(path.join(ROOT, "app/apple-icon.png"));
await mkdir(path.join(ROOT, "print"), { recursive: true });
await sharp(Buffer.from(full), { density: 300 }).flatten({ background: L.cream }).png().toFile(path.join(ROOT, "print/apercu-logo.png"));
console.log("logo prêt");

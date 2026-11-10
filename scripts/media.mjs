// Photos du site.
//   npm run media
//
// 1. Range les vraies photos de Maily récupérées sur Instagram (assets/raw/) dans assets/<catégorie>/
//    avec des noms lisibles, sans écraser un fichier déjà présent : vos propres photos restent prioritaires.
// 2. Prépare pour le web TOUTES les photos de assets/hero, plats, boutique et facade dans public/media/<catégorie>/
//    (next/image sert ensuite AVIF/WebP à la bonne taille) et note leurs dimensions dans data/media-sizes.json.
// 3. Refait l'image de partage public/og.jpg (1200 × 630).
//
// Pour ajouter une photo prise sur place : déposez-la sous le nom attendu (liste dans assets/A-PHOTOGRAPHIER.md),
// par ex. assets/plats/nems.jpg, puis relancez « npm run media » : le dessin de remplacement disparaît tout seul.
//
// Non utilisées comme photos : les affiches Instagram (carte, Fête de la musique, Réderie, traiteur). Leur contenu
// (prix, offre événements) est repris en vrai texte HTML dans data/carte.json et locales/*.json.
import { copyFile, mkdir, readdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CATS = ["hero", "plats", "boutique", "facade"];
const exists = (f) => access(f).then(() => true, () => false);

// [source dans assets/raw, catégorie, nom, recadrage éventuel]
const PICKS = [
  // Deux banh mi poulet et bœuf sur la table de la terrasse, ardoise « Banh Mì 5,50 € » derrière (mai 2025)
  ["maily_2025-05-14.jpg", "hero", "banh-mi-terrasse"],
  ["maily_2025-05-14.jpg", "plats", "banh-mi", { left: 0, top: 1000, width: 1250, height: 800 }],
  // Bo bun bœuf dans la vitrine (février 2026) : recadré sur le bol
  ["maily_2026-02-24.jpg", "plats", "bo-bun", { left: 300, top: 400, width: 1040, height: 1040 }],
  // Baguettes dorées et botte de coriandre sur le plan de travail (mars 2026, 640 px : à remplacer par une photo HD)
  ["maily_2026-03-17.jpg", "boutique", "baguettes-coriandre"],
];

for (const [file, cat, name, crop] of PICKS) {
  const out = path.join(ROOT, "assets", cat, `${name}.jpg`);
  await mkdir(path.dirname(out), { recursive: true });
  if (await exists(out)) continue;
  const src = path.join(ROOT, "assets/raw", file);
  if (crop) await sharp(src).extract(crop).jpeg({ quality: 95 }).toFile(out);
  else await copyFile(src, out);
}

const sizes = {};
for (const cat of CATS) {
  const dir = path.join(ROOT, "assets", cat);
  await mkdir(dir, { recursive: true });
  await mkdir(path.join(ROOT, "public/media", cat), { recursive: true });
  for (const f of (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))) {
    const name = f.replace(/\.\w+$/, "").toLowerCase();
    const max = cat === "hero" ? 2400 : 1600;
    const info = await sharp(path.join(dir, f))
      .rotate()
      .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(path.join(ROOT, "public/media", cat, `${name}.jpg`));
    sizes[`/media/${cat}/${name}.jpg`] = [info.width, info.height];
  }
}

// Image de partage (Open Graph) 1200 × 630 : la photo à droite, le logo et la promesse à gauche
const heroFile = (await readdir(path.join(ROOT, "assets/hero"))).find((f) => f.startsWith("hero.")) ?? "banh-mi-terrasse.jpg";
const photo = await sharp(path.join(ROOT, "assets/hero", heroFile)).rotate().resize(560, 630, { fit: "cover", position: "south" }).toBuffer();
const logo = await sharp(path.join(ROOT, "public/logo.svg"), { density: 220 }).resize({ width: 460 }).png().toBuffer();
const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="630">
  <text x="70" y="352" font-family="Georgia, serif" font-size="40" fill="#1A1A1A">Banh mi, bo bun, nems</text>
  <text x="70" y="398" font-family="Georgia, serif" font-size="40" fill="#1A1A1A">et rôtisserie maison</text>
  <rect x="70" y="430" width="64" height="6" rx="3" fill="#F2C14E"/>
  <text x="70" y="482" font-family="Arial, sans-serif" font-size="22" fill="#1A1A1A">17 rue de Beauvais · Amiens</text>
  <text x="70" y="516" font-family="Arial, sans-serif" font-size="22" fill="#B3261E">À emporter · Commande par WhatsApp</text>
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#FBF5EA" } })
  .composite([
    { input: photo, left: 640, top: 0 },
    { input: logo, left: 64, top: 110 },
    { input: text, left: 0, top: 0 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(ROOT, "public/og.jpg"));

await writeFile(path.join(ROOT, "data/media-sizes.json"), JSON.stringify(sizes, null, 1) + "\n");
console.log(`${Object.keys(sizes).length} photos prêtes`);

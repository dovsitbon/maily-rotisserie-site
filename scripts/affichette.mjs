// Affichette A5 imprimable (PDF) avec QR code vers le site, pour le comptoir ou la vitrine.
//   npm run affichette   →   print/affichette-maily-a5.pdf (+ aperçu PNG)
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const site = JSON.parse(await readFile(path.join(ROOT, "data/site.json"), "utf8"));
const url = `${site.url}/fr/commander`;

const hex = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const CREAM = hex("#FBF5EA");
const INK = hex("#1A1A1A");
const RED = hex("#B3261E");
const RICE = hex("#F2C14E");
const MUTED = hex("#4D4740");

const pdf = await PDFDocument.create();
pdf.setTitle("Maily Rôtisserie Vietnamienne : affichette A5");
pdf.setAuthor("Maily Rôtisserie Vietnamienne");
const W = 419.53;
const H = 595.28;
const page = pdf.addPage([W, H]);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const sans = await pdf.embedFont(StandardFonts.Helvetica);
const serif = await pdf.embedFont(StandardFonts.TimesRomanBold);

page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });

// Bandeau photo : les deux banh mi de la terrasse
const photoH = 175;
const photo = await sharp(path.join(ROOT, "assets/hero/banh-mi-terrasse.jpg")).resize(1260, Math.round((1260 * photoH) / W), { fit: "cover", position: "south" }).jpeg({ quality: 88 }).toBuffer();
page.drawImage(await pdf.embedJpg(photo), { x: 0, y: H - photoH, width: W, height: photoH });

// Logo (rasterisé : pdf-lib ne lit pas le SVG)
const logoW = 230;
const logo = await sharp(path.join(ROOT, "public/logo.svg"), { density: 400 }).resize(1200).png().toBuffer();
const logoImg = await pdf.embedPng(logo);
const logoH = (logoW * logoImg.height) / logoImg.width;
let y = H - photoH - 22 - logoH;
page.drawImage(logoImg, { x: (W - logoW) / 2, y, width: logoW, height: logoH });

const center = (text, font, size, yy, color = INK) => page.drawText(text, { x: (W - font.widthOfTextAtSize(text, size)) / 2, y: yy, size, font, color });

y -= 34;
center("Commandez avant de passer,", serif, 21, y);
y -= 22;
center("c'est prêt à votre arrivée.", serif, 21, y, RED);

const qrS = 108;
y -= 22 + qrS;
page.drawRectangle({ x: (W - qrS) / 2 - 10, y: y - 10, width: qrS + 20, height: qrS + 20, color: rgb(1, 1, 1), borderColor: RICE, borderWidth: 3 });
const qrPng = await QRCode.toBuffer(url, { margin: 0, width: 600, color: { dark: "#1A1A1A", light: "#FFFFFF" }, errorCorrectionLevel: "M" });
page.drawImage(await pdf.embedPng(qrPng), { x: (W - qrS) / 2, y, width: qrS, height: qrS });
y -= 26;
center("Scannez, choisissez, envoyez sur WhatsApp", bold, 9.5, y, RED);

y -= 26;
page.drawRectangle({ x: 28, y: y - 34, width: W - 56, height: 46, color: RED });
center("Banh mi dès 6 €  ·  Bo bun 8,50 €  ·  Nems 1 € pièce", bold, 10.5, y - 8, CREAM);
center("Poulet rôti sur commande  ·  Recettes poulet halal", sans, 9, y - 23, CREAM);

y -= 58;
center(`${site.address.street}, ${site.address.postalCode} ${site.address.city}  ·  ${site.phone}`, bold, 9, y);
y -= 13;
center("Du mardi au samedi · 10 h 30 – 14 h et 17 h – 19 h 30", sans, 8.5, y, MUTED);
y -= 12;
center(`Instagram ${site.instagramHandle}  ·  ${url.replace(/^https?:\/\//, "")}`, sans, 8.5, y, MUTED);

await mkdir(path.join(ROOT, "print"), { recursive: true });
const file = path.join(ROOT, "print/affichette-maily-a5.pdf");
await writeFile(file, await pdf.save());
console.log("affichette prête :", file, url);

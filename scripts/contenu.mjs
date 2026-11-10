// CONTENU.md : tous les textes et les prix du site (français), pour validation par Maily.
//   npm run contenu   (à relancer après chaque modification de locales/fr.json ou data/carte.json)
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = async (f) => JSON.parse(await readFile(path.join(ROOT, f), "utf8"));
const fr = await read("locales/fr.json");
const carte = await read("data/carte.json");
const site = await read("data/site.json");
const hours = await read("data/horaires.json");
const annonces = await read("data/annonces.json");

const eur = (n) => n.toFixed(2).replace(".", ",") + " €";
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const L = [];
const p = (...x) => L.push(...x);

p("# Maily Rôtisserie Vietnamienne : contenu du site, à valider", "");
p("> Tout ce qui est marqué **À VALIDER** ou **À REMPLIR** attend une réponse de Maily. Les prix viennent de la carte publiée sur Instagram le 21 mai 2026.", "");

p("## Titre de l'accueil (3 propositions)", "");
p(`1. **${fr.hero.title}** ← en ligne`, "2. Le banh mi qu'on attendait à Amiens.", "3. Rôti, croustillant, fait maison.", "");
p(`Sous-titre : ${fr.hero.sub}`, "", `Petite ligne : ${fr.hero.eyebrow.toUpperCase()}`, "");

p("## Coordonnées", "");
p(`- Adresse : ${site.address.street}, ${site.address.postalCode} ${site.address.city}`, `- Téléphone / WhatsApp : ${site.phone}`, `- Instagram : ${site.instagramHandle}`, `- E-mail : ${site.email || "**À REMPLIR**"}`, `- SIRET : ${site.legal.siret || "**À REMPLIR**"}`, `- Note Google : ${site.rating.value}/5 sur ${site.rating.count} avis (relevée le ${site.rating.checked})`, "");

p("## Horaires (**À VALIDER**)", "");
for (let i = 1; i <= 7; i++) p(`- ${DAYS[i - 1]} : ${hours.week[i].length ? hours.week[i].map(([a, b]) => `${a} – ${b}`).join(" et ") : "fermé"}`);
p("", `Fermetures prévues : ${hours.exceptions.map((e) => e.date).join(", ")} (**À VALIDER**)`, "");

p("## Bandeau d'infos", "", `- Par défaut : « ${annonces.default.fr} »`, ...annonces.items.map((a) => `- Du ${a.from} au ${a.to} : « ${a.fr} » (**À VALIDER**)`), "");

p("## Tuiles et services", "");
p(`Tuiles : ${Object.values(fr.tiles.items).join(" · ")}`, "");
for (const s of fr.services.items) p(`- **${s.title}** : ${s.text.replace("{count}", site.rating.count)}`);
p("");

p("## La carte et les prix", "", `Accroche : **${fr.carte.title}** ${fr.carte.intro}`, "");
for (const c of carte.categories) {
  p(`### ${fr.carte.tabs[c.id]}`, "");
  p("| Produit | Description | Prix |", "|---|---|---|");
  for (const id of c.items) {
    const it = carte.items[id];
    const price = it.price === null ? "**À REMPLIR** (prix au comptoir)" : `${it.from ? "à partir de " : ""}${eur(it.price)}${it.unit === "piece" ? " la pièce" : ""}`;
    const extra = [it.choices ? `parfums : ${it.choices.map((x) => fr.choices[x]).join(", ")}` : "", it.onOrder ? "sur commande, la veille (**À VALIDER**)" : "", it.tags.includes("halal") ? "poulet halal" : "", it.tags.includes("vege") ? "végétarien" : ""].filter(Boolean).join(" · ");
    p(`| ${fr.products[id].name} | ${fr.products[id].desc}${extra ? ` (${extra})` : ""} | ${price} |`);
  }
  p("");
}
p(`Note sous la carte : ${fr.carte.halalNote}`, "", "**À VALIDER** : boissons proposées et leurs prix, prix du liégeois, du crumble et du fondant, composition et prix exacts des formules, contenu des box saveur.", "");

p("## Blocs de l'accueil", "");
for (const b of fr.blocks) p(`### ${b.eyebrow}`, "", `**${b.title}**`, "", b.text, "", `Bouton : ${b.cta}`, "");
p("**À VALIDER** : les plateaux pour fêtes et bureaux (contenu, minimum de personnes, délai, prix).", "");

p("## Avis", "", `**${fr.reviews.title.replace("{count}", site.rating.count)}** ${fr.reviews.text}`, "", "Emplacements prévus pour de vrais avis Google (data/avis.json), **À REMPLIR** avec l'accord de Maily. Aucun avis inventé.", "");

p("## Infos pratiques", "", `**${fr.infos.title}**`, "", `Accès : ${fr.infos.accessText}`, "", "**À REMPLIR** : stationnement le plus proche, accès PMR.", "");

p("## FAQ (**À VALIDER**)", "");
for (const f of fr.faq.items) p(`**${f.q}**`, "", f.a, "");
p("**À VALIDER** : moyens de paiement acceptés (carte, espèces, tickets-restaurant).", "");

p("## Pages Google", "");
for (const id of ["banhMi", "boBun"]) {
  const pg = fr.pages[id];
  p(`### ${pg.eyebrow} (/fr/${pg.slug})`, "", `Titre Google : ${pg.metaTitle}`, "", `Description : ${pg.metaDescription}`, "", `**${pg.title}** ${pg.lead}`, "");
  for (const s of pg.sections) p(`- **${s.title}** : ${s.text}`);
  p("");
}

p("## Référencement", "", `- Titre de l'accueil : ${fr.meta.title}`, `- Description : ${fr.meta.description}`, `- Carte : ${fr.pages.carte.metaTitle}`, `- Commande : ${fr.pages.commander.metaTitle}`, "");

await writeFile(path.join(ROOT, "CONTENU.md"), L.join("\n"));
console.log("CONTENU.md prêt");

import { Photo } from "@/components/Photo";
import type { IllusName } from "@/components/Illus";
import { fill, type Dict, type Locale } from "@/lib/i18n";
import { minPrice, type CategoryId } from "@/lib/carte";
import { price } from "@/lib/format";
import { firstImg } from "@/lib/media";

// Tuiles de catégories juste après le hero : nom en capitales sur la photo (ou le dessin, en attendant la photo).
const TILES: { id: Exclude<CategoryId, "box">; photo: string[]; illus: IllusName }[] = [
  { id: "banh-mi", photo: ["/media/plats/banh-mi.jpg"], illus: "banhmi" },
  { id: "bo-bun", photo: ["/media/plats/bo-bun.jpg"], illus: "bowl" },
  { id: "nems", photo: ["/media/plats/nems.jpg"], illus: "nem" },
  { id: "rotisserie", photo: ["/media/plats/poulet-roti.jpg"], illus: "chicken" },
  { id: "menus", photo: ["/media/plats/formule.jpg"], illus: "tray" },
  { id: "desserts", photo: ["/media/plats/che.jpg"], illus: "glass" },
];

export function Tiles({ lang, d }: { lang: Locale; d: Dict }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {TILES.map((t) => {
        const min = minPrice(t.id);
        const photo = !!firstImg(t.photo);
        const dark = photo || t.id === "rotisserie";
        return (
          <li key={t.id}>
            <a href={`/${lang}#carte-${t.id}`} className="group relative block overflow-hidden rounded-2xl">
              <Photo paths={t.photo} alt="" illus={t.illus} tint={t.id === "rotisserie" ? "red" : "rice"} sizes="(min-width: 1024px) 16vw, (min-width: 768px) 32vw, 50vw" className="aspect-[4/5]" illusClassName="h-20 w-20 -translate-y-6" />
              <span className={`absolute inset-x-0 bottom-0 px-4 pt-12 pb-4 ${photo ? "bg-gradient-to-t from-ink/75 to-transparent text-cream" : dark ? "text-cream" : "text-ink"}`}>
                <span className="block text-[0.9375rem] font-semibold tracking-[0.12em] uppercase">{d.tiles.items[t.id]}</span>
                {min !== null && <span className="text-[0.8125rem] opacity-85">{fill(d.tiles.from, { price: price(min, lang) })}</span>}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Photo } from "@/components/Photo";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { useCart } from "@/lib/cart";
import { CATEGORIES, ITEMS, type CategoryId, type ItemId } from "@/lib/carte";
import { price } from "@/lib/format";
import { fill } from "@/lib/i18n";

/** Prix affiché en HTML : « 6,50 € », « à partir de 10,50 € », « 1,00 € la pièce » ou « Prix au comptoir ». */
export function PriceLabel({ id, className = "" }: { id: ItemId; className?: string }) {
  const { lang, d } = useLocale();
  const it = ITEMS[id];
  if (it.price === null) return <span className={`text-muted ${className}`}>{d.carte.counterPrice}</span>;
  const p = price(it.price, lang);
  return <span className={className}>{it.from ? fill(d.carte.from, { price: p }) : it.unit === "piece" ? fill(d.carte.perPiece, { price: p }) : p}</span>;
}

/** Carte produit complète : photo (ou dessin), nom, description, pastilles, prix, parfum et « Ajouter ». */
export function ProductCard({ id, wide = false }: { id: ItemId; wide?: boolean }) {
  const { d } = useLocale();
  const { add, qtyOf, ready } = useCart();
  const it = ITEMS[id];
  const p = d.products[id];
  const [choice, setChoice] = useState(it.choices?.[0] ?? "");
  const [flash, setFlash] = useState(false);
  const inCart = ready ? qtyOf(id) : 0;

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(false), 1200);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <article className={`group card flex bg-paper ring-1 ring-line ${wide ? "flex-col sm:flex-row" : "flex-col"}`}>
      <Photo paths={it.photo} alt={p.name} illus={it.illus} tint={it.onOrder ? "rice" : "cream"} sizes={wide ? "(min-width: 640px) 40vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"} className={wide ? "aspect-[4/3] sm:aspect-auto sm:w-2/5" : "aspect-[4/3]"} illusClassName="h-24 w-24" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="display text-[1.375rem] leading-tight">{p.name}</h3>
          <PriceLabel id={id} className="shrink-0 pt-1 text-[1.0625rem] font-semibold whitespace-nowrap" />
        </div>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{p.desc}</p>
        {(it.tags.length > 0 || it.onOrder) && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {it.onOrder && <li className="tag tag-onOrder">{d.carte.onOrder}</li>}
            {it.tags.map((t) => (
              <li key={t} className={`tag tag-${t}`}>
                {d.carte[t]}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap items-end gap-3 pt-5">
          {it.choices && (
            <label className="min-w-0 flex-1">
              <span className="sr-only">{d.carte.choice}</span>
              <select className="field !min-h-11 !py-2 text-[0.9375rem]" value={choice} onChange={(e) => setChoice(e.target.value)} aria-label={`${d.carte.choice} : ${p.name}`}>
                {it.choices.map((c) => (
                  <option key={c} value={c}>
                    {d.choices[c as keyof typeof d.choices]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              add(id, choice);
              setFlash(true);
            }}
            className={`btn !min-h-11 !px-4 !text-[0.9375rem] ${it.choices ? "" : "flex-1 sm:flex-none"}`}
            aria-label={fill(d.carte.addLabel, { name: p.name })}
          >
            {flash ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
            {flash ? d.carte.added : d.carte.add}
          </motion.button>
        </div>
        {inCart > 0 && <p className="mt-2 text-[0.8125rem] font-medium text-herb-ink">{fill(d.carte.inCart, { count: inCart })}</p>}
      </div>
    </article>
  );
}

/** La carte : une seule page, des onglets par catégorie. #carte-<catégorie> ouvre directement le bon onglet. */
export function MenuTabs({ initial = "banh-mi" }: { initial?: CategoryId }) {
  const { d } = useLocale();
  const [tab, setTab] = useState<CategoryId>(initial);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const fromHash = () => {
      const m = location.hash.match(/^#carte-(.+)$/);
      if (m && CATEGORIES.some((c) => c.id === m[1])) setTab(m[1] as CategoryId);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const ids = CATEGORIES.map((c) => c.id);
  const current = CATEGORIES.find((c) => c.id === tab)!;
  const move = (dir: number) => {
    const next = ids[(ids.indexOf(tab) + dir + ids.length) % ids.length];
    setTab(next);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={d.carte.tabsLabel}
        className="tabs-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            ref={(el) => {
              refs.current[c.id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${c.id}`}
            aria-selected={tab === c.id}
            aria-controls={`panel-${c.id}`}
            tabIndex={tab === c.id ? 0 : -1}
            onClick={() => setTab(c.id)}
            className={`min-h-11 shrink-0 rounded-full border-[1.5px] px-4 text-[0.9375rem] font-medium whitespace-nowrap transition-colors ${tab === c.id ? "border-ink bg-ink text-cream" : "border-line bg-paper hover:border-ink"}`}
          >
            {d.carte.tabs[c.id]}
          </button>
        ))}
      </div>
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className={`mt-6 grid gap-4 ${current.items.length === 1 ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {current.items.map((id) => (
          <ProductCard key={id} id={id} wide={current.items.length === 1} />
        ))}
      </motion.div>
      {(tab === "banh-mi" || tab === "bo-bun" || tab === "nems" || tab === "rotisserie") && <p className="mt-4 text-sm text-muted">{d.carte.halalNote}</p>}
    </div>
  );
}

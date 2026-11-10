import site from "@/data/site.json";
import fr from "@/locales/fr.json";
import { ITEMS } from "@/lib/carte";
import { totals, type Line } from "@/lib/cart";
import { formatDay, formatTime, price } from "@/lib/format";
import { addDays, pickupTimes } from "@/lib/hours";
import { isoDay } from "@/lib/format";
import type { Locale } from "@/lib/locales";

/** Lien WhatsApp vers Maily avec un message déjà écrit. */
export const waLink = (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export type OrderForm = { day: string; time: string; name: string; phone: string; notes: string };

/**
 * Récapitulatif envoyé sur WhatsApp. Toujours en français : c'est Maily qui le lit.
 * (*gras* et listes : mise en forme WhatsApp)
 */
export function orderMessage(lines: Line[], f: OrderForm, lang: Locale) {
  const out: string[] = ["Bonjour Maily, voici ma commande à emporter :", ""];
  for (const l of lines) {
    const it = ITEMS[l.item];
    const name = fr.products[l.item].name + (l.choice ? ` (${fr.choices[l.choice as keyof typeof fr.choices]})` : "");
    const p = it.price === null ? "prix au comptoir" : `${it.from ? "à partir de " : ""}${price(it.price * l.qty, "fr")}`;
    out.push(`• ${l.qty} × ${name} : ${p}${it.onOrder ? " [sur commande]" : ""}`);
  }
  const t = totals(lines);
  out.push("", `*Total${t.from ? " (à partir de)" : ""} : ${price(t.total, "fr")}*${t.unknown ? " + articles au prix du comptoir" : ""}`);
  out.push("", `*Retrait :* ${formatDay(f.day, "fr")} à ${formatTime(f.time, "fr")}`, `*Nom :* ${f.name.trim()}`, `*Téléphone :* ${f.phone.trim()}`);
  if (f.notes.trim()) out.push(`*Remarques :* ${f.notes.trim()}`);
  out.push("", `Paiement au retrait. Commande préparée sur le site${lang === "en" ? " (client anglophone)" : ""}.`);
  return out.join("\n");
}

export const isPhone = (v: string) => /^[+\d][\d\s\-().]{7,19}$/.test(v.trim());

/** Jours de retrait proposés : à partir d'aujourd'hui (ou plus tard si un produit est sur commande), avec au moins un créneau libre. */
export function pickupDays(now: Date, onOrder: boolean) {
  const today = isoDay(now);
  const start = onOrder ? site.order.advanceDays : 0;
  return Array.from({ length: site.order.daysAhead + 1 }, (_, i) => addDays(today, start + i)).filter((day) => slotsFor(day, now).length > 0);
}

export const slotsFor = (day: string, now: Date) => pickupTimes(day, now, site.order.stepMinutes, site.order.minutesAhead);

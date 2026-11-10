"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import site from "@/data/site.json";
import { Illus } from "@/components/Illus";
import { PriceLabel } from "@/components/MenuTabs";
import { CloseIcon, MinusIcon, PhoneIcon, PlusIcon, WhatsAppIcon } from "@/components/icons";
import { useLocale } from "@/components/providers";
import { totals, useCart } from "@/lib/cart";
import { ITEMS } from "@/lib/carte";
import { formatDay, formatTime, price } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { isPhone, orderMessage, pickupDays, slotsFor, waLink } from "@/lib/whatsapp";

type Field = "cart" | "day" | "time" | "name" | "phone";

/**
 * Commande à emporter : panier, créneau de retrait (d'après data/horaires.json), nom, téléphone, remarques.
 * « Envoyer » ouvre WhatsApp avec un récapitulatif bien formaté pour Maily (lib/whatsapp.ts).
 * Paiement en ligne : prévu (app/api/checkout) mais désactivé par défaut (data/site.json → payment.enabled).
 */
export function OrderForm() {
  const { lang, d } = useLocale();
  const { lines, setQty, ready } = useCart();
  const [now, setNow] = useState<Date | null>(null);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Field[]>([]);
  const [sent, setSent] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- heure du navigateur, connue après hydratation
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    try {
      const saved = JSON.parse(localStorage.getItem("maily-client") || "{}");
      if (typeof saved.name === "string") setName(saved.name);
      if (typeof saved.phone === "string") setPhone(saved.phone);
    } catch {}
    return () => clearInterval(id);
  }, []);

  const onOrder = lines.some((l) => ITEMS[l.item].onOrder);
  const days = useMemo(() => (now ? pickupDays(now, onOrder) : []), [now, onOrder]);
  const times = useMemo(() => (now && day ? slotsFor(day, now) : []), [now, day]);
  const t = totals(lines);

  // Jour et heure toujours valides : premier créneau disponible par défaut
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- recalé quand les créneaux changent
    if (days.length && !days.includes(day)) setDay(days[0]);
  }, [days, day]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- recalé quand les créneaux changent
    if (times.length && !times.includes(time)) setTime(times[0]);
  }, [times, time]);

  const check = () => {
    const e: Field[] = [];
    if (!lines.length) e.push("cart");
    if (!day) e.push("day");
    if (!time) e.push("time");
    if (!name.trim()) e.push("name");
    if (!isPhone(phone)) e.push("phone");
    setErrors(e);
    if (e.length) document.getElementById(e[0] === "cart" ? "panier" : `f-${e[0]}`)?.focus();
    return e.length === 0;
  };

  const send = () => {
    if (!check()) return;
    try {
      localStorage.setItem("maily-client", JSON.stringify({ name, phone }));
    } catch {}
    window.open(waLink(orderMessage(lines, { day, time, name, phone, notes }, lang)), "_blank", "noopener");
    setSent(true);
  };

  const pay = async () => {
    if (!check()) return;
    setPaying(true);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lines, day, time, name, phone, notes, lang }) });
      const j = await r.json();
      if (j.url) location.href = j.url;
      else send();
    } catch {
      send();
    } finally {
      setPaying(false);
    }
  };

  const err = (f: Field) => errors.includes(f);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
      {/* Panier */}
      <section aria-labelledby="panier-titre" className="card bg-paper p-5 ring-1 ring-line md:p-7">
        <h2 id="panier-titre" className="display text-[1.75rem]">
          {d.order.cartTitle}
        </h2>
        <div id="panier" tabIndex={-1} className="mt-4 outline-none">
          {!ready ? (
            <div className="h-24" />
          ) : lines.length === 0 ? (
            <div className={`flex flex-col items-center rounded-2xl bg-cream-deep px-5 py-10 text-center ${err("cart") ? "ring-2 ring-red" : ""}`}>
              <Illus name="banhmi" className="h-16 w-16 text-red" />
              <p className="mt-3 text-muted">{d.order.empty}</p>
              <Link href={`/${lang}#carte`} className="btn-line mt-5">
                {d.order.emptyCta}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              <AnimatePresence initial={false}>
                {lines.map((l) => {
                  const it = ITEMS[l.item];
                  const nm = d.products[l.item].name;
                  return (
                    <motion.li key={`${l.item}-${l.choice}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                      <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
                        <p className="font-semibold">
                          {nm}
                          {l.choice && <span className="font-normal text-muted"> · {d.choices[l.choice as keyof typeof d.choices]}</span>}
                        </p>
                        <PriceLabel id={l.item} className="text-[0.875rem] text-muted" />
                        {it.onOrder && <span className="tag tag-onOrder ms-2">{d.carte.onOrder}</span>}
                      </div>
                      <div className="flex items-center rounded-full ring-1 ring-line">
                        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-deep" onClick={() => setQty(l.item, l.choice, l.qty - 1)} aria-label={fill(d.order.less, { name: nm })}>
                          <MinusIcon />
                        </button>
                        <span className="w-7 text-center font-semibold tabular-nums" aria-live="polite">
                          {l.qty}
                        </span>
                        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-deep" onClick={() => setQty(l.item, l.choice, l.qty + 1)} aria-label={fill(d.order.more, { name: nm })}>
                          <PlusIcon />
                        </button>
                      </div>
                      <span className="ms-auto w-20 text-end font-semibold tabular-nums sm:ms-0">{it.price === null ? "—" : price(it.price * l.qty, lang)}</span>
                      <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-cream-deep hover:text-red" onClick={() => setQty(l.item, l.choice, 0)} aria-label={`${d.order.remove} ${nm}`}>
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
          {ready && lines.length > 0 && (
            <div className="mt-2 border-t-2 border-ink pt-4">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">{t.from ? d.order.totalFrom : d.order.total}</span>
                <span className="display text-[1.75rem] tabular-nums">{price(t.total, lang)}</span>
              </div>
              {t.unknown && <p className="mt-1 text-end text-sm text-muted">{d.order.counterNote}</p>}
            </div>
          )}
        </div>
      </section>

      {/* Retrait et coordonnées */}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="space-y-5"
        aria-label={d.order.title}
      >
        <fieldset>
          <legend className="eyebrow mb-3">{d.order.pickup}</legend>
          {onOrder && days[0] && <p className="mb-3 rounded-xl bg-rice-soft px-4 py-3 text-[0.9375rem]">{fill(d.order.onOrderNote, { day: formatDay(days[0], lang) })}</p>}
          {now && days.length === 0 ? (
            <p className="rounded-xl bg-red-soft px-4 py-3">{d.order.noSlot}</p>
          ) : (
            <div className="grid grid-cols-[1.4fr_1fr] gap-3">
              <label>
                <span className="label">{d.order.day}</span>
                <select id="f-day" className="field" value={day} onChange={(e) => setDay(e.target.value)} aria-invalid={err("day")}>
                  {days.map((x) => (
                    <option key={x} value={x}>
                      {formatDay(x, lang)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="label">{d.order.time}</span>
                <select id="f-time" className="field" value={time} onChange={(e) => setTime(e.target.value)} aria-invalid={err("time")}>
                  {times.map((x) => (
                    <option key={x} value={x}>
                      {formatTime(x, lang)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="label">{d.order.name}</span>
            <input id="f-name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={err("name")} maxLength={60} />
          </label>
          <label>
            <span className="label">{d.order.phone}</span>
            <input id="f-phone" className="field" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={err("phone")} maxLength={20} />
          </label>
        </div>
        <label className="block">
          <span className="label">{d.order.notes}</span>
          <textarea className="field min-h-24 resize-y" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={d.order.notesPh} maxLength={500} />
        </label>

        {errors.length > 0 && (
          <div role="alert" className="rounded-xl bg-red-soft px-4 py-3 text-[0.9375rem]">
            <p className="font-semibold">{d.order.fixFields}</p>
            <ul className="mt-1 list-disc ps-5">
              {errors.map((e) => (
                <li key={e}>{d.order.errors[e]}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="submit" className="btn flex-1">
            <WhatsAppIcon className="h-5 w-5" />
            {d.order.send}
          </button>
          {site.payment.enabled && (
            <button type="button" className="btn-line flex-1" onClick={pay} disabled={paying}>
              {d.order.payOnline}
            </button>
          )}
        </div>
        <p className="text-sm text-muted" role={sent ? "status" : undefined}>
          {sent ? d.order.sent : d.order.sendNote}
        </p>

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-cream-deep p-5">
          <div>
            <p className="font-semibold">{d.order.callTitle}</p>
            <p className="text-sm text-muted">{d.order.callText}</p>
          </div>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="btn-line shrink-0 !min-h-11">
            <PhoneIcon className="h-4 w-4" />
            {d.order.callCta}
          </a>
        </div>
      </form>
    </div>
  );
}
